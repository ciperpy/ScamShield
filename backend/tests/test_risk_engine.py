import pytest
from backend.risk.engine import evaluate_risk
from backend.schemas.scan_schema import EvidenceItem, EvidenceCategory, RiskLevel, ApiStatusReport, ServiceStatus

def test_risk_engine_unknown_default():
    # When evidence is empty, status must default to UNKNOWN / INCONCLUSIVE
    level, score, summary, why, recs, details, limitations = evaluate_risk(evidence=[], service_statuses=[])
    assert level == RiskLevel.UNKNOWN
    assert score == 0
    assert details.confidence == "LOW"

def test_risk_engine_critical_threat():
    evidence = [
        EvidenceItem(
            category=EvidenceCategory.THREAT_INTELLIGENCE,
            severity="CRITICAL",
            source="VirusTotal API v3",
            title="VirusTotal Threats Detected (8 Malicious)",
            description="8 security vendors flagged this URL.",
            interpretation="Active malware signatures detected."
        )
    ]
    statuses = [
        ApiStatusReport(service="VirusTotal", status=ServiceStatus.COMPLETED, message="Done")
    ]
    level, score, summary, why, recs, details, limitations = evaluate_risk(evidence, statuses)
    assert level == RiskLevel.CRITICAL
    assert score >= 40
    assert details.critical_signals_count == 1
