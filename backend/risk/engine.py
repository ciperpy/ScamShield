from typing import List, Dict, Any, Tuple
from backend.schemas.scan_schema import (
    EvidenceItem, EvidenceCategory, RiskLevel, ApiStatusReport, 
    ServiceStatus, RiskDetails, ScoreContribution
)

SEVERITY_WEIGHTS = {
    "CRITICAL": 40,
    "HIGH": 25,
    "MEDIUM": 12,
    "LOW": 5,
    "INFO": 0
}

def evaluate_risk(
    evidence: List[EvidenceItem],
    service_statuses: List[ApiStatusReport],
    input_type: str = "url"
) -> Tuple[RiskLevel, int, str, List[str], List[str], RiskDetails, List[str]]:
    """
    Evaluates evidence telemetry deterministically.
    Categorizes evidence by severity, produces an explicit Score Contribution Breakdown,
    computes confidence score, tracks actual limitations, and defaults to UNKNOWN / INCONCLUSIVE
    when evidence is insufficient or external threat tools are unconfigured.
    """
    limitations: List[str] = []

    # Check unconfigured / failed integrations for limitations tracking
    for status in service_statuses:
        if status.status == ServiceStatus.NOT_CONFIGURED:
            limitations.append(f"{status.service} was not configured (API key missing).")
        elif status.status in (ServiceStatus.SERVICE_UNAVAILABLE, ServiceStatus.FAILED, ServiceStatus.RATE_LIMITED):
            limitations.append(f"{status.service} check failed or was rate-limited ({status.message}).")

    if not evidence:
        risk_details = RiskDetails(
            level=RiskLevel.UNKNOWN,
            score=0,
            confidence="LOW",
            positive_signals_count=0,
            risk_signals_count=0,
            critical_signals_count=0,
            unavailable_checks_count=len(limitations),
            score_breakdown=[]
        )
        return (
            RiskLevel.UNKNOWN,
            0,
            "Insufficient evidence collected to perform a definitive security classification.",
            ["No security evidence factors were identified."],
            [
                "Exercise normal caution before interacting with this content.",
                "Verify the sender or source directly through official established channels."
            ],
            risk_details,
            limitations
        )

    # 1. Count evidence severities by category
    critical_count = sum(1 for e in evidence if e.severity == "CRITICAL")
    high_count = sum(1 for e in evidence if e.severity == "HIGH")
    medium_count = sum(1 for e in evidence if e.severity == "MEDIUM")
    low_count = sum(1 for e in evidence if e.severity == "LOW")
    info_count = sum(1 for e in evidence if e.severity == "INFO")

    # 2. Build Score Breakdown
    score_acc = 0
    score_breakdown: List[ScoreContribution] = []

    for e in evidence:
        weight = SEVERITY_WEIGHTS.get(e.severity, 0)
        if weight > 0:
            score_acc += weight
            score_breakdown.append(ScoreContribution(
                category=e.category.value,
                points=weight,
                title=e.title
            ))

    risk_score = min(100, score_acc)

    # Check external intelligence status
    completed_integrations = sum(1 for s in service_statuses if s.status == ServiceStatus.COMPLETED)
    has_intel_data = any(e.category == EvidenceCategory.THREAT_INTELLIGENCE for e in evidence)

    # Determine Risk Level
    if critical_count >= 1 or risk_score >= 65:
        risk_level = RiskLevel.CRITICAL
    elif high_count >= 1 or risk_score >= 40:
        risk_level = RiskLevel.HIGH
    elif medium_count >= 2 or (medium_count >= 1 and low_count >= 2) or risk_score >= 20:
        risk_level = RiskLevel.MEDIUM
    elif has_intel_data and critical_count == 0 and high_count == 0 and medium_count == 0:
        # We have active threat intelligence scans and ZERO threat detections
        risk_level = RiskLevel.LOW
    else:
        # Default when external intelligence is unavailable or evidence is inconclusive
        risk_level = RiskLevel.UNKNOWN

    # Compute Confidence Score
    if completed_integrations >= 2 and len(evidence) >= 4:
        confidence = "HIGH"
    elif len(evidence) >= 2:
        confidence = "MEDIUM"
    else:
        confidence = "LOW"

    # Risk Details object
    risk_details = RiskDetails(
        level=risk_level,
        score=risk_score,
        confidence=confidence,
        positive_signals_count=info_count,
        risk_signals_count=high_count + medium_count + low_count,
        critical_signals_count=critical_count,
        unavailable_checks_count=len(limitations),
        score_breakdown=score_breakdown
    )

    # Generate transparent explanations ("Why this result?")
    why_this_result: List[str] = []
    for e in evidence:
        if e.severity in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
            why_this_result.append(f"[{e.severity}] {e.title}: {e.description}")

    if not why_this_result:
        why_this_result.append("No active threat indicators or malicious signatures were detected by the available checks.")

    # Executive summary
    if risk_level == RiskLevel.CRITICAL:
        summary = "CRITICAL RISK: Multiple high-severity threat indicators or malicious vendor detections identified. Severe risk of phishing, malware, or credential theft."
    elif risk_level == RiskLevel.HIGH:
        summary = "HIGH RISK: Strong risk factors detected, such as brand impersonation, high security vendor detections, or dangerous structural URL anomalies."
    elif risk_level == RiskLevel.MEDIUM:
        summary = "MEDIUM RISK: Moderate risk factors observed (e.g. recent domain registration, multiple redirects, or urgency language)."
    elif risk_level == RiskLevel.LOW:
        summary = "SAFE / LOW RISK: Available external threat intelligence and domain telemetry indicate zero detected threat signatures."
    else:
        summary = "UNKNOWN / INCONCLUSIVE: Evidence is currently insufficient or external threat intelligence APIs were unconfigured. Absence of evidence does not prove safety."

    # Recommendations
    recommendations: List[str] = []
    if risk_level in (RiskLevel.CRITICAL, RiskLevel.HIGH):
        recommendations = [
            "⚠️ Do NOT enter passwords, usernames, PINs, or OTPs on this page.",
            "⚠️ Do NOT make payments, enter credit card details, or download files.",
            "🔒 Close the page immediately and navigate to the official website directly."
        ]
    elif risk_level == RiskLevel.MEDIUM:
        recommendations = [
            "⚡ Double-check the exact domain name in your browser address bar.",
            "🔑 Ensure the page does not ask for sensitive one-time passcodes or banking credentials.",
            "ℹ️ Contact the supposed organization using their official public telephone number."
        ]
    else:
        recommendations = [
            "✓ Always verify URL domain spellings carefully.",
            "✓ Never share OTPs or authentication PINs with anyone.",
            "✓ Keep your web browser and operating system updated."
        ]

    return risk_level, risk_score, summary, why_this_result, recommendations, risk_details, limitations
