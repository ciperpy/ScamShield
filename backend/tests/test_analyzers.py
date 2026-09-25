import pytest
from backend.analyzers.url_analyzer import analyze_url_structure
from backend.analyzers.brand_analyzer import analyze_brand_impersonation
from backend.analyzers.message_analyzer import analyze_message_content

def test_url_structure_ip_hostname():
    res = analyze_url_structure("http://185.22.91.43/login")
    assert res["is_ip_hostname"] is True
    assert len(res["evidence"]) > 0
    assert any(e.title == "IP Address Hostname Detected" for e in res["evidence"])

def test_brand_impersonation():
    # Legitimate brand URL should NOT trigger impersonation
    legit_res = analyze_brand_impersonation("https://www.paypal.com/signin")
    assert legit_res["impersonations_found"] is False

    # Impersonation attempt should trigger brand warning
    spoof_res = analyze_brand_impersonation("https://paypal-login-security.example.xyz/claim")
    assert spoof_res["impersonations_found"] is True
    assert spoof_res["detected_impersonations"][0]["brand"] == "Paypal"

def test_message_analyzer():
    text = "URGENT! Your bank account will be blocked within 2 hours. Send OTP immediately: http://example.xyz/claim"
    res = analyze_message_content(text)
    
    assert res["social_engineering"]["urgency_detected"] is True
    assert res["social_engineering"]["credential_harvesting"] is True
    assert len(res["extracted_urls"]) == 1
    assert res["extracted_urls"][0] == "http://example.xyz/claim"
