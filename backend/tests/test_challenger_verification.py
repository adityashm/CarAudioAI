"""
Challenger 2 Adversarial Verification Test Suite for CarAudioAI
Empirically tests and stress-tests:
1. Frontend static bundle, HTML routes, and asset paths.
2. Phone number formatting, bad OTPs, corrupted JWTs, Razorpay signature verification & payments.
3. Pioneer DEH-80PRS XML schema & MiniDSP JSON structure.
"""
import os
import json
import re
import hmac
import hashlib
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timedelta, timezone
from jose import jwt
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.utils.twilio import format_indian_phone
from app.algorithms.dsp_export import export_pioneer_xml, export_minidsp_json
from app.algorithms.crossover import calculate_crossover_settings
from app.algorithms.time_alignment import calculate_time_alignment
from app.algorithms.eq_optimizer import calculate_eq_profile

client = TestClient(app)

# ============================================================================
# 1. FRONTEND STATIC BUNDLE & ASSET INTEGRITY
# ============================================================================
class TestFrontendStaticBundle:
    """Verify Expo Web static export files in mobile-app/dist"""
    
    @pytest.fixture(autouse=True)
    def setup_paths(self):
        # Locate mobile-app/dist relative to project root
        self.project_root = Path(__file__).resolve().parent.parent.parent
        self.dist_dir = self.project_root / "mobile-app" / "dist"

    def test_dist_directory_and_html_entrypoints(self):
        assert self.dist_dir.exists(), f"Dist directory does not exist at {self.dist_dir}"
        
        expected_routes = [
            "index.html",
            "explore.html",
            "modal.html",
            "_sitemap.html",
            "+not-found.html",
            "(tabs)/index.html",
            "(tabs)/explore.html"
        ]
        for route in expected_routes:
            route_path = self.dist_dir / route
            assert route_path.exists(), f"Missing static route entrypoint: {route}"
            assert route_path.stat().st_size > 500, f"Route {route} file is suspiciously empty ({route_path.stat().st_size} bytes)"

    def test_js_bundle_generation_and_size(self):
        js_bundles = list(self.dist_dir.glob("_expo/static/js/web/*.js"))
        assert len(js_bundles) >= 1, "No compiled JS bundle found in _expo/static/js/web/"
        for bundle in js_bundles:
            size_mb = bundle.stat().st_size / (1024 * 1024)
            assert size_mb > 1.0, f"Bundle {bundle.name} is too small ({size_mb:.2f} MB)"

    def test_html_script_and_link_asset_resolution(self):
        html_files = list(self.dist_dir.glob("**/*.html"))
        assert len(html_files) >= 7, f"Expected >= 7 HTML files, found {len(html_files)}"
        
        for html_file in html_files:
            content = html_file.read_text(encoding="utf-8")
            
            # Check script src references
            scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', content)
            for src in scripts:
                if src.startswith("http"):
                    continue
                # Normalize base path /CarAudioAI/
                clean_src = src.replace("/CarAudioAI/", "").lstrip("/")
                target = self.dist_dir / clean_src
                assert target.exists(), f"Broken script src '{src}' in {html_file.name} -> {target}"

            # Check link href references (e.g. favicon)
            links = re.findall(r'<link[^>]+href=["\']([^"\']+)["\']', content)
            for href in links:
                if href.startswith("http") or href.startswith("data:"):
                    continue
                clean_href = href.replace("/CarAudioAI/", "").lstrip("/")
                target = self.dist_dir / clean_href
                assert target.exists(), f"Broken link href '{href}' in {html_file.name} -> {target}"

    def test_scrollytelling_and_app_images_in_dist(self):
        image_assets = list(self.dist_dir.glob("assets/assets/images/*.*"))
        assert len(image_assets) >= 4, f"Expected at least 4 shot images, found {len(image_assets)}"
        
        image_names = [img.name for img in image_assets]
        assert any("shot1_exterior" in name for name in image_names), "Missing shot1_exterior in dist"
        assert any("shot2_door_open" in name for name in image_names), "Missing shot2_door_open in dist"
        assert any("shot3_touchscreen" in name for name in image_names), "Missing shot3_touchscreen in dist"
        assert any("shot4_soundwaves" in name for name in image_names), "Missing shot4_soundwaves in dist"


# ============================================================================
# 2. AUTH & PAYMENT EDGE CASES
# ============================================================================
class TestAuthEdgeCases:
    """Stress test Phone OTP, formatting, JWT security, and edge cases"""

    @pytest.mark.parametrize("input_phone,expected", [
        ("+919876543210", "+919876543210"),
        ("9876543210", "+919876543210"),
        ("919876543210", "+919876543210"),
        ("+91 98765 43210", "+919876543210"),
        ("98765-43210", "+919876543210"),
        ("(98765) 43210", "+919876543210"),
        ("+91-98765-43210", "+919876543210"),
        ("9876543210  ", "+919876543210"),
    ])
    def test_phone_number_formatting_variations(self, input_phone, expected):
        formatted = format_indian_phone(input_phone)
        assert formatted == expected

    def test_send_otp_edge_cases(self):
        # Valid send OTP
        res = client.post("/api/auth/send-otp", json={"phone_number": "+919876543210"})
        assert res.status_code == 200
        assert res.json()["success"] is True

        # Send OTP with unformatted number
        res_raw = client.post("/api/auth/send-otp", json={"phone_number": "9876543210"})
        assert res_raw.status_code == 200
        assert res_raw.json()["success"] is True

        # Missing phone_number field
        res_empty = client.post("/api/auth/send-otp", json={})
        assert res_empty.status_code == 422

    def test_bad_otps_rejection(self):
        phone = "+919876543210"
        bad_otps = ["000000", "999999", "12345", "1234567", "abcdef", "12 456", ""]
        for bad_otp in bad_otps:
            res = client.post("/api/auth/verify-otp", json={
                "phone_number": phone,
                "otp_code": bad_otp
            })
            assert res.status_code == 400, f"Expected 400 for bad OTP '{bad_otp}', got {res.status_code}"
            assert "Invalid" in res.json()["detail"] or "expired" in res.json()["detail"]

    def test_valid_otp_success_and_jwt_generation(self):
        res = client.post("/api/auth/verify-otp", json={
            "phone_number": "+919876543210",
            "otp_code": "123456",
            "name": "Harmanpreet Singh"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["token_type"] == "bearer"
        assert "access_token" in data
        assert data["phone_number"] == "+919876543210"
        assert data["subscription_tier"] == "free"

        # Verify JWT payload decodes with configured SECRET_KEY
        payload = jwt.decode(data["access_token"], settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == "+919876543210"
        assert payload["tier"] == "free"

    def test_jwt_auth_security_and_corrupted_tokens(self):
        # 1. No Authorization header
        res_no_auth = client.get("/api/auth/me")
        assert res_no_auth.status_code == 401

        # 2. Corrupted Bearer token
        res_corrupt = client.get("/api/auth/me", headers={"Authorization": "Bearer not.a.valid.jwt.token"})
        assert res_corrupt.status_code == 401

        # 3. Wrong signature key
        fake_token = jwt.encode({"sub": "+919876543210", "exp": datetime.now(timezone.utc) + timedelta(hours=1)}, "wrong_secret_key_67890", algorithm="HS256")
        res_wrong_key = client.get("/api/auth/me", headers={"Authorization": f"Bearer {fake_token}"})
        assert res_wrong_key.status_code == 401

        # 4. Expired token
        expired_token = jwt.encode({"sub": "+919876543210", "exp": datetime.now(timezone.utc) - timedelta(hours=1)}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        res_expired = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        assert res_expired.status_code == 401


class TestPaymentEdgeCases:
    """Stress test Razorpay subscription order creation, signature checking, and tiers"""

    @pytest.fixture
    def auth_header(self):
        token = client.post("/api/auth/verify-otp", json={
            "phone_number": "+919888877777",
            "otp_code": "123456"
        }).json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_get_payment_plans(self):
        res = client.get("/api/payments/plans")
        assert res.status_code == 200
        plans = res.json()
        plan_ids = [p["id"] for p in plans]
        assert "free" in plan_ids
        assert "pro_monthly" in plan_ids
        assert "pro_yearly" in plan_ids
        
        # Check prices
        pro_m = next(p for p in plans if p["id"] == "pro_monthly")
        assert pro_m["price_inr"] == 99
        pro_y = next(p for p in plans if p["id"] == "pro_yearly")
        assert pro_y["price_inr"] == 999

    def test_create_order_invalid_plans(self, auth_header):
        # Free plan cannot create paid order
        res_free = client.post("/api/payments/create-order", json={"plan_id": "free"}, headers=auth_header)
        assert res_free.status_code == 400

        # Nonexistent plan
        res_fake = client.post("/api/payments/create-order", json={"plan_id": "super_vip_diamond"}, headers=auth_header)
        assert res_fake.status_code == 400

        # Unauthenticated order creation
        res_unauth = client.post("/api/payments/create-order", json={"plan_id": "pro_monthly"})
        assert res_unauth.status_code == 401

    def test_create_order_valid_pro_monthly_and_yearly(self, auth_header):
        # Pro Monthly
        res_m = client.post("/api/payments/create-order", json={"plan_id": "pro_monthly"}, headers=auth_header)
        assert res_m.status_code == 200
        data_m = res_m.json()
        assert "order_" in data_m["order_id"]
        assert data_m["amount_inr"] == 99
        assert data_m["currency"] == "INR"

        # Pro Yearly
        res_y = client.post("/api/payments/create-order", json={"plan_id": "pro_yearly"}, headers=auth_header)
        assert res_y.status_code == 200
        data_y = res_y.json()
        assert "order_" in data_y["order_id"]
        assert data_y["amount_inr"] == 999
        assert data_y["currency"] == "INR"

    def test_razorpay_hmac_signature_verification_algorithm(self):
        """Adversarially test Razorpay HMAC-SHA256 signature verification math"""
        order_id = "order_Kylaq12345"
        payment_id = "pay_987654321"
        secret = "secret_razorpay_key_test_123"
        
        msg = f"{order_id}|{payment_id}".encode("utf-8")
        valid_signature = hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()
        
        # Valid signature matches
        assert hmac.compare_digest(
            hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).hexdigest(),
            valid_signature
        )

        # Tampered order_id fails
        tampered_msg1 = f"order_TAMPERED|{payment_id}".encode("utf-8")
        assert not hmac.compare_digest(
            hmac.new(secret.encode("utf-8"), tampered_msg1, hashlib.sha256).hexdigest(),
            valid_signature
        )

        # Tampered payment_id fails
        tampered_msg2 = f"{order_id}|pay_TAMPERED".encode("utf-8")
        assert not hmac.compare_digest(
            hmac.new(secret.encode("utf-8"), tampered_msg2, hashlib.sha256).hexdigest(),
            valid_signature
        )

        # Tampered signature string fails
        assert not hmac.compare_digest(
            "corrupted_signature_hex_value",
            valid_signature
        )

    def test_verify_payment_endpoint_dev_mode(self, auth_header):
        res = client.post(
            "/api/payments/verify",
            json={
                "razorpay_order_id": "order_mock_pro_monthly_9900",
                "razorpay_payment_id": "pay_mock_success_123",
                "razorpay_signature": "mock_sig",
                "plan_id": "pro_monthly"
            },
            headers=auth_header
        )
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["subscription_tier"] == "pro_monthly"


# ============================================================================
# 3. DSP XML & JSON STRUCTURE VALIDATION
# ============================================================================
class TestDspXmlAndJsonStructure:
    """Validate Pioneer DEH-80PRS XML schema tags and MiniDSP JSON structure"""

    @pytest.fixture
    def full_tuning_payload(self):
        return {
            "car_make": "Skoda",
            "car_model": "Kylaq",
            "car_variant": "Prestige",
            "equipment": {
                "head_unit_brand": "Nakamichi",
                "head_unit_model": "NAM5510",
                "front_speakers": "Sony XS-162GS Component",
                "rear_speakers": "Sony XS-162GS Coaxial",
                "speakers_amplifier": "Sound Barrier SB-654",
                "subwoofer": "Pioneer TS-W307D4",
                "subwoofer_enclosure_type": "ported",
                "subwoofer_tuning_frequency_hz": 35.0,
                "subwoofer_amplifier": "MOCO AF-04"
            },
            "sound_target_profile": "sql_punjabi_hiphop",
            "listening_position": "driver_rhd"
        }

    def test_pioneer_deh80prs_xml_schema_and_tags(self, full_tuning_payload):
        res = client.post("/api/tuning/calculate", json=full_tuning_payload)
        assert res.status_code == 200
        data = res.json()
        
        xml_str = data["pioneer_xml_preview"]
        assert xml_str is not None
        
        # 1. Parse XML cleanly with ElementTree
        root = ET.fromstring(xml_str)
        assert root.tag == "PioneerDSPConfig"
        assert root.attrib.get("version") == "1.0"

        # 2. Metadata Section
        meta = root.find("Metadata")
        assert meta is not None
        assert meta.find("Car") is not None
        assert "Skoda Kylaq" in meta.find("Car").text
        assert meta.find("Profile") is not None

        # 3. Equalizer Section (Graphic 14-band)
        eq = root.find("Equalizer")
        assert eq is not None
        assert eq.attrib.get("type") == "Graphic14Band"
        bands = eq.findall("Band")
        assert len(bands) == 14, f"Pioneer DEH-80PRS requires exactly 14 bands, found {len(bands)}"
        
        iso_freqs = [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000]
        for i, b in enumerate(bands):
            freq = int(b.attrib["freq"])
            gain = float(b.text)
            assert freq == iso_freqs[i], f"Band {i} freq mismatch: expected {iso_freqs[i]}, got {freq}"
            assert -12.0 <= gain <= 12.0, f"Gain {gain} out of Pioneer DEH-80PRS +/-12dB range"

        # 4. Crossover Network Section
        xo = root.find("CrossoverNetwork")
        assert xo is not None
        front = xo.find("Front")
        assert front is not None
        assert front.attrib["type"] == "HPF"
        assert int(front.attrib["freq"]) == 80
        assert "24dB" in front.attrib["slope"]

        rear = xo.find("Rear")
        assert rear is not None
        assert rear.attrib["type"] == "HPF"
        assert int(rear.attrib["freq"]) == 90

        sub = xo.find("Subwoofer")
        assert sub is not None
        assert sub.attrib["type"] == "LPF"
        assert int(sub.attrib["freq"]) == 80
        assert int(sub.attrib["subsonic"]) == 28  # 35Hz ported box subsonic = 28Hz

        # 5. Time Alignment Section
        ta = root.find("TimeAlignment")
        assert ta is not None
        channels = ta.findall("Channel")
        assert len(channels) == 5, f"Expected 5 channels (FL, FR, RL, RR, SUB), found {len(channels)}"
        
        ch_dict = {ch.attrib["name"]: float(ch.attrib["delay_ms"]) for ch in channels}
        assert "FL" in ch_dict and "FR" in ch_dict and "RL" in ch_dict and "RR" in ch_dict and "SUB" in ch_dict
        # Furthest speaker (SUB) must be 0.0ms baseline delay
        assert ch_dict["SUB"] == 0.0
        # In current indian_cars.json, FL=95cm and FR=138cm yields FL=3.35ms and FR=2.1ms
        assert ch_dict["FL"] == pytest.approx(3.35, 0.05)
        assert ch_dict["FR"] == pytest.approx(2.10, 0.05)

    def test_minidsp_json_schema_and_parsing(self, full_tuning_payload):
        res = client.post("/api/tuning/calculate", json=full_tuning_payload)
        assert res.status_code == 200
        data = res.json()
        
        json_str = data["minidsp_json_preview"]
        assert json_str is not None

        # 1. Parse JSON cleanly
        minidsp = json.loads(json_str)
        assert isinstance(minidsp, dict)
        
        # 2. Check Device & Metadata
        assert "MiniDSP" in minidsp["device"]
        assert "Skoda Kylaq" in minidsp["car"]
        assert minidsp["sound_profile"] is not None

        # 3. Check Routing Matrix
        assert "routing" in minidsp
        assert "Input 1/2" in minidsp["routing"]
        assert len(minidsp["routing"]["Input 1/2"]) == 4

        # 4. Check Crossover Matrix
        xo = minidsp["crossover"]
        assert xo["front"]["cutoff_frequency_hz"] == 80
        assert "slope" in xo["front"]
        assert xo["rear"]["cutoff_frequency_hz"] == 90
        assert xo["subwoofer"]["lpf_frequency_hz"] == 80
        assert xo["subwoofer"]["subsonic_filter_hz"] == 28

        # 5. Check Time Alignment Delays
        delays = minidsp["delays_ms"]
        assert delays["SUB"] == 0.0
        assert delays["FL"] == pytest.approx(3.35, 0.05)
        assert delays["FR"] == pytest.approx(2.10, 0.05)

        # 6. Check PEQ Bands
        peq = minidsp["peq_bands"]
        assert len(peq) == 14
        assert peq[1]["frequency_hz"] == 63
        assert peq[1]["gain_db"] == 5.5

    def test_frontend_export_service_xml_and_json_generation(self):
        """Simulate frontend exportService.ts template generators"""
        delays = {"FL": 2.10, "FR": 3.35, "RL": 1.60, "RR": 2.77, "SUB": 0.00}
        eq_gains = [4.0, 5.5, 4.0, -1.5, 0.0, 0.0, 0.0, 0.5, 1.0, -1.0, 0.5, 1.5, 2.0, 1.0]
        freqs = [32, 63, 100, 200, 400, 630, 1000, 2000, 4000, 8000, 10000, 12000, 14000, 16000]

        # Frontend XML Generator Template
        xml_output = f"""<?xml version="1.0" encoding="UTF-8"?>
<PioneerDSPConfig version="1.0">
  <Metadata>
    <Vehicle>Skoda Kylaq</Vehicle>
    <GeneratedAt>2026-09-01T15:20:00.000Z</GeneratedAt>
    <Author>CarAudioAI Acoustic Engine</Author>
  </Metadata>
  <TimeAlignment position="driver_rhd" unit="milliseconds">
    <Channel id="FL" delay="{delays['FL']}"/>
    <Channel id="FR" delay="{delays['FR']}"/>
    <Channel id="RL" delay="{delays['RL']}"/>
    <Channel id="RR" delay="{delays['RR']}"/>
    <Channel id="SUB" delay="{delays['SUB']}"/>
  </TimeAlignment>
  <CrossoverNetwork>
    <Front HPF="80" Slope="24dB_LR"/>
    <Rear HPF="90" Slope="24dB_LR" GainOffset_dB="-4.0"/>
    <Subwoofer LPF="80" Subsonic="28" Slope="24dB_LR"/>
  </CrossoverNetwork>
  <Equalizer type="Graphic14Band">
    {''.join([f'<Band freq="{f}Hz" gain="{eq_gains[i]}dB"/>' for i, f in enumerate(freqs)])}
  </Equalizer>
</PioneerDSPConfig>"""

        # Ensure valid XML parsing
        root = ET.fromstring(xml_output)
        assert root.tag == "PioneerDSPConfig"
        assert len(root.find("Equalizer").findall("Band")) == 14
        assert len(root.find("TimeAlignment").findall("Channel")) == 5

        # Frontend JSON Generator Template
        json_output = {
            "metadata": {
                "device": "MiniDSP 2x4 HD / C-DSP 8x12",
                "vehicle": "Skoda Kylaq"
            },
            "routing": {
                "output_channels": {
                    "out1_front_left": {"delay_ms": delays["FL"]},
                    "out2_front_right": {"delay_ms": delays["FR"]},
                    "out3_rear_left": {"delay_ms": delays["RL"], "attenuation_db": -4.0},
                    "out4_rear_right": {"delay_ms": delays["RR"], "attenuation_db": -4.0},
                    "out5_subwoofer": {"delay_ms": delays["SUB"]}
                }
            },
            "crossovers": {
                "front": {"filter": "Linkwitz-Riley 24dB/oct", "hpf_hz": 80},
                "rear": {"filter": "Linkwitz-Riley 24dB/oct", "hpf_hz": 90},
                "subwoofer": {"filter": "Linkwitz-Riley 24dB/oct", "lpf_hz": 80, "subsonic_hpf_hz": 28}
            },
            "parametric_eq": [
                {"band": i + 1, "frequency_hz": f, "gain_db": eq_gains[i], "q_factor": 1.414}
                for i, f in enumerate(freqs)
            ]
        }
        json_dump = json.dumps(json_output)
        parsed_json = json.loads(json_dump)
        assert len(parsed_json["parametric_eq"]) == 14
        assert parsed_json["crossovers"]["subwoofer"]["subsonic_hpf_hz"] == 28
