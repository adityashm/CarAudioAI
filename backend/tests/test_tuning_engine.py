"""
Unit and Integration Tests for Skoda Kylaq SQL Audio Tuning Engine
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.algorithms.crossover import calculate_crossover_settings
from app.algorithms.time_alignment import calculate_time_alignment
from app.algorithms.eq_optimizer import calculate_eq_profile
from app.algorithms.gain_staging import calculate_gain_staging

client = TestClient(app)

def test_health_endpoints():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_skoda_kylaq_car_api():
    response = client.get("/api/cars/Skoda/Kylaq")
    assert response.status_code == 200
    data = response.json()
    assert data["make"] == "Skoda"
    assert data["model"] == "Kylaq"
    variant = data["variants"][0]
    assert "cabin_acoustic_distances_cm" in variant["specs"]
    distances = variant["specs"]["cabin_acoustic_distances_cm"]
    assert distances["driver_to_front_left_cm"] == 95 or distances["driver_to_front_right_cm"] == 95 or distances["driver_to_subwoofer_boot_cm"] == 210

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
    assert res["subwoofer"]["subsonic_filter_hz"] == 28  # 35 - 7 = 28Hz protection

def test_time_alignment_calculation():
    distances = {
        "FL": 138,
        "FR": 95,
        "RL": 155,
        "RR": 115,
        "SUB": 210
    }
    res = calculate_time_alignment(distances, listening_position="driver_rhd")
    # Sub is furthest at 210cm -> 0 ms delay
    assert res["delays_milliseconds"]["SUB"] == 0.0
    # FR is closest at 95cm -> delta 115cm -> 115 / 34.3 = ~3.35 ms
    assert res["delays_milliseconds"]["FR"] == pytest.approx(3.35, 0.05)
    # FL is 138cm -> delta 72cm -> 72 / 34.3 = ~2.10 ms
    assert res["delays_milliseconds"]["FL"] == pytest.approx(2.10, 0.05)

def test_14_band_eq_optimizer():
    res = calculate_eq_profile(
        sound_profile="sql_punjabi_hiphop",
        cabin_type="compact_suv",
        has_subwoofer=True
    )
    assert res["total_bands"] == 14
    band_map = {b["frequency_hz"]: b["gain_db"] for b in res["bands"]}
    assert band_map[63] == 5.5  # Sub-bass punch
    assert band_map[200] == -1.5  # Anti-boom cut
    assert band_map[4000] == -1.0  # Anti-reflection cut
    assert band_map[12000] == 2.0  # Sparkle

def test_gain_staging_voltages():
    res = calculate_gain_staging(
        head_unit_preout_volts=2.0,
        front_rms_watts=45.0,
        front_impedance_ohms=4.0,
        sub_rms_watts=250.0,
        sub_impedance_ohms=8.0
    )
    assert "13.42 Volts AC" in res["digital_multimeter_calibration"]["front_channels_ch1_ch2"]["target_ac_voltage"]
    assert "44.72 Volts AC" in res["digital_multimeter_calibration"]["subwoofer_channel"]["target_ac_voltage"] or "Volts AC" in res["digital_multimeter_calibration"]["subwoofer_channel"]["target_ac_voltage"]

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
    assert data["crossover_configuration"]["front"]["cutoff_frequency_hz"] == 80
    assert data["crossover_configuration"]["subwoofer"]["subsonic_filter_hz"] == 28
    assert len(data["quick_action_checklist"]) >= 5
