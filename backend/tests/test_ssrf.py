import pytest
from backend.security.ssrf import is_safe_ip, validate_url_ssrf

def test_is_safe_ip():
    assert is_safe_ip("8.8.8.8") is True
    assert is_safe_ip("1.1.1.1") is True
    assert is_safe_ip("142.250.190.46") is True

    # Private / Reserved / Metadata IPs
    assert is_safe_ip("127.0.0.1") is False
    assert is_safe_ip("10.0.0.1") is False
    assert is_safe_ip("172.16.0.1") is False
    assert is_safe_ip("192.168.1.1") is False
    assert is_safe_ip("169.254.169.254") is False

def test_validate_url_ssrf():
    is_safe, _, reason = validate_url_ssrf("http://localhost:8000")
    assert is_safe is False
    assert "restricted endpoint" in reason or "private/reserved IP" in reason

    is_safe, _, reason = validate_url_ssrf("http://127.0.0.1/admin")
    assert is_safe is False

    is_safe, _, reason = validate_url_ssrf("http://169.254.169.254/latest/meta-data")
    assert is_safe is False
