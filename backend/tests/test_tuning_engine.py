"""
Comprehensive Unit and Integration Test Suite for CarAudioAI Backend
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.algorithms.crossover import calculate_crossover_settings
from app.algorithms.time_alignment import calculate_time_alignment
from app.algorithms.eq_optimizer import calculate_eq_profile
from app.algorithms.gain_staging import calculate_gain_staging
from app.algorithms.dsp_export import export_pioneer_xml, export_minidsp_json

client = TestClient(app)

# --- 1. HEALTH & METADATA ---
def test_health_endpoints():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"

# --- 2. CARS API ---
def test_cars_list_and_filter():
    res = client.get("/api/cars")
    assert res.status_code == 200
    cars = res.json()
    assert len(cars) > 10
    
    # Filter by make
    skoda_res = client.get("/api/cars?make=Skoda")
    assert skoda_res.status_code == 200
    assert all(c["make"] == "Skoda" for c in skoda_res.json())

def test_skoda_kylaq_car_api():
    response = client.get("/api/cars/Skoda/Kylaq")
    assert response.status_code == 200
    data = response.json()
    assert data["make"] == "Skoda"
    assert data["model"] == "Kylaq"
    variant = data["variants"][0]
    assert "cabin_acoustic_distances_cm" in variant["specs"]

# --- 3. EQUIPMENT API ---
def test_equipment_catalog_api():
    response = client.get("/api/equipment")
    assert response.status_code == 200
    items = response.json()
    brands = [i["brand"] for i in items]
    assert "Nakamichi" in brands
    assert "MOCO" in brands
    assert "Sound Barrier" in brands
    assert "Sony" in brands
    assert "Pioneer" in brands

def test_equipment_categories():
    response = client.get("/api/equipment/categories")
    assert response.status_code == 200
    cats = response.json()["categories"]
    assert "head_unit" in cats or "amplifier" in cats or "speaker" in cats

# --- 4. ALGORITHMS & DSP EXPORTERS ---
def test_crossover_ported_box_subsonic_protection():
    res = calculate_crossover_settings(
        front_speaker_type="component",
        front_speaker_size="6.5",
        has_subwoofer=True,
        subwoofer_enclosure="ported",
        subwoofer_tune_freq_hz=35.0,
        rear_speakers_present=True
    )
    assert res["front"]["cutoff_frequency_hz"] == 80
    assert res["rear"]["cutoff_frequency_hz"] == 90
    assert res["subwoofer"]["lpf_frequency_hz"] == 80
    assert res["subwoofer"]["subsonic_filter_hz"] == 28

def test_time_alignment_calculation():
    distances = {"FL": 138, "FR": 95, "RL": 155, "RR": 115, "SUB": 210}
    res = calculate_time_alignment(distances, listening_position="driver_rhd")
    assert res["delays_milliseconds"]["SUB"] == 0.0
    assert res["delays_milliseconds"]["FR"] == pytest.approx(3.35, 0.05)
    assert res["delays_milliseconds"]["FL"] == pytest.approx(2.10, 0.05)

def test_14_band_eq_optimizer():
    res = calculate_eq_profile(sound_profile="sql_punjabi_hiphop", cabin_type="compact_suv", has_subwoofer=True)
    assert res["total_bands"] == 14
    band_map = {b["frequency_hz"]: b["gain_db"] for b in res["bands"]}
    assert band_map[63] == 5.5
    assert band_map[200] == -1.5

def test_gain_staging_voltages():
    res = calculate_gain_staging(head_unit_preout_volts=2.0, front_rms_watts=45.0, front_impedance_ohms=4.0)
    assert "13.42 Volts AC" in res["digital_multimeter_calibration"]["front_channels_ch1_ch2"]["target_ac_voltage"]

def test_dsp_export_generators():
    mock_data = {
        "car": "Skoda Kylaq",
        "sound_target": "SQL",
        "head_unit_14_band_eq": {"bands": [{"frequency_hz": 63, "gain_db": 5.5}]},
        "crossover_configuration": {"front": {"cutoff_frequency_hz": 80}},
        "time_alignment_and_phase": {"delays_milliseconds": {"FL": 2.10}}
    }
    xml_out = export_pioneer_xml(mock_data)
    assert "<PioneerDSPConfig" in xml_out
    assert "Skoda Kylaq" in xml_out

    json_out = export_minidsp_json(mock_data)
    assert "MiniDSP" in json_out
    assert "Skoda Kylaq" in json_out

# --- 5. FULL TUNING PIPELINE ENDPOINT ---
def test_full_tuning_pipeline_endpoint():
    payload = {
        "car_make": "Skoda",
        "car_model": "Kylaq",
        "car_variant": "Prestige",
        "equipment": {
            "head_unit_brand": "Nakamichi",
            "head_unit_model": "NAM5510",
            "front_speakers": "Sony XS-162GS Component",
            "rear_speakers": "Sony XS-162GS Coaxial",
            "speakers_amplifier": "MOCO AF-04",
            "subwoofer": "Pioneer TS-W307D4",
            "subwoofer_enclosure_type": "ported",
            "subwoofer_tuning_frequency_hz": 35.0,
            "subwoofer_amplifier": "Sound Barrier SB-654"
        },
        "sound_target_profile": "sql_punjabi_hiphop",
        "listening_position": "driver_rhd"
    }
    response = client.post("/api/tuning/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Skoda Kylaq" in data["car"]
    assert len(data["head_unit_14_band_eq"]["bands"]) == 14
    assert data["pioneer_xml_preview"] is not None
    assert data["minidsp_json_preview"] is not None

# --- 6. AUTHENTICATION FLOW (OTP & JWT) ---
def test_auth_otp_and_jwt_flow():
    # 1. Send OTP
    send_res = client.post("/api/auth/send-otp", json={"phone_number": "+919876543210"})
    assert send_res.status_code == 200
    assert send_res.json()["success"] is True

    # 2. Verify OTP with code 123456
    verify_res = client.post("/api/auth/verify-otp", json={
        "phone_number": "+919876543210",
        "otp_code": "123456",
        "name": "Aditya"
    })
    assert verify_res.status_code == 200
    token_data = verify_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Access Protected /me endpoint
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["phone_number"] == "+919876543210"

# --- 7. PAYMENTS & SUBSCRIPTIONS ---
def test_payment_plans_and_order():
    plans_res = client.get("/api/payments/plans")
    assert plans_res.status_code == 200
    plans = plans_res.json()
    assert len(plans) == 3
    assert any(p["id"] == "pro_monthly" and p["price_inr"] == 99 for p in plans)

    # Create Order (with auth token)
    auth_token = client.post("/api/auth/verify-otp", json={
        "phone_number": "+919999988888",
        "otp_code": "123456"
    }).json()["access_token"]

    order_res = client.post(
        "/api/payments/create-order",
        json={"plan_id": "pro_monthly"},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert order_res.status_code == 200
    assert "order_" in order_res.json()["order_id"]

    # Verify payment
    verify_pay_res = client.post(
        "/api/payments/verify",
        json={
            "razorpay_order_id": order_res.json()["order_id"],
            "razorpay_payment_id": "pay_mock_12345",
            "razorpay_signature": "mock_sig",
            "plan_id": "pro_monthly"
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert verify_pay_res.status_code == 200
    assert verify_pay_res.json()["subscription_tier"] == "pro_monthly"

# --- 8. MEASUREMENTS & RESONANCE DETECTION ---
def test_measurements_upload_and_smoothing():
    mock_raw_data = [
        {"frequency_hz": 20, "spl_db": 75.0},
        {"frequency_hz": 50, "spl_db": 82.0},
        {"frequency_hz": 63, "spl_db": 88.0},
        {"frequency_hz": 125, "spl_db": 92.0},  # Peak resonance
        {"frequency_hz": 250, "spl_db": 78.0},
        {"frequency_hz": 500, "spl_db": 79.0},
        {"frequency_hz": 1000, "spl_db": 80.0},
        {"frequency_hz": 4000, "spl_db": 89.0},  # Reflection peak
        {"frequency_hz": 10000, "spl_db": 77.0},
        {"frequency_hz": 16000, "spl_db": 74.0}
    ]
    res = client.post("/api/measurements", json={
        "measurement_type": "pink_noise",
        "raw_data": mock_raw_data
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["smoothed_data"]) == 10
    assert len(data["peak_resonance_frequencies_hz"]) > 0
