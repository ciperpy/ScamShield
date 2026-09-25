import re
from typing import Dict, Any, List
from backend.schemas.scan_schema import EvidenceItem, EvidenceCategory

URL_REGEX = re.compile(
    r'https?://(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:/[^\s]*)?',
    re.IGNORECASE
)

URGENCY_PATTERNS = [
    r'\burgent\b', r'\bimmediately\b', r'\bwithin \d+ (?:hours?|minutes?)\b',
    r'\baccount (?:will be )?blocked\b', r'\baccount (?:will be )?suspended\b',
    r'\bfinal warning\b', r'\baction required\b', r'\bact now\b', r'\bexpired?\b',
    r'\bunauthorized access\b', r'\bsecurity alert\b'
]

FINANCIAL_PATTERNS = [
    r'\bwon\b', r'\bcongratulations\b', r'\blottery\b', r'\bprize\b', r'\bclaim\b',
    r'\brefund\b', r'\bcashback\b', r'₹\s?\d+', r'\$\s?\d+', r'\bcredited\b',
    r'\binvestment\b', r'\bbonus\b', r'\breward\b'
]

CREDENTIAL_PATTERNS = [
    r'\botp\b', r'\bpin\b', r'\bcvv\b', r'\bpassword\b', r'\bcard number\b',
    r'\bverification code\b', r'\bverify (?:your )?account\b', r'\bbanking credentials\b',
    r'\blogin details\b'
]

def analyze_message_content(text: str) -> Dict[str, Any]:
    """
    Performs deterministic local pattern analysis on text messages.
    Extracts embedded URLs and flags social engineering risk vectors (Urgency, Financial claims, Credential harvesting).
    No third-party LLM calls executed.
    """
    evidence: List[EvidenceItem] = []
    
    # 1. Extract URLs
    extracted_urls = URL_REGEX.findall(text)
    
    # 2. Urgency Detection
    matched_urgency = []
    for pat in URGENCY_PATTERNS:
        if re.search(pat, text, re.IGNORECASE):
            matched_urgency.append(pat.replace(r'\b', '').replace('?', ''))

    if matched_urgency:
        evidence.append(EvidenceItem(
            category=EvidenceCategory.MESSAGE_SOCIAL_ENGINEERING,
            severity="HIGH",
            source="Message Pattern Analyzer",
            title="Urgency / Pressure Tactics Detected",
            description="The message employs coercive time pressure or threat language (e.g. 'account blocked', 'immediately', 'final warning').",
            interpretation="Scammers use artificial urgency to trigger panic so victims act before verifying the request through official channels."
        ))

    # 3. Financial Pressure / Reward Claims
    matched_financial = []
    for pat in FINANCIAL_PATTERNS:
        if re.search(pat, text, re.IGNORECASE):
            matched_financial.append(pat.replace(r'\b', ''))

    if matched_financial:
        evidence.append(EvidenceItem(
            category=EvidenceCategory.MESSAGE_SOCIAL_ENGINEERING,
            severity="MEDIUM",
            source="Message Pattern Analyzer",
            title="Unsolicited Financial Claim / Prize Bait",
            description="The message references unexpected monetary prizes, refunds, lottery wins, or financial transfers.",
            interpretation="Promising unexpected funds or threatening financial penalties is a standard social engineering lure to extract upfront payments or credentials."
        ))

    # 4. Credential Harvesting Requests
    matched_credentials = []
    for pat in CREDENTIAL_PATTERNS:
        if re.search(pat, text, re.IGNORECASE):
            matched_credentials.append(pat.replace(r'\b', ''))

    if matched_credentials:
        evidence.append(EvidenceItem(
            category=EvidenceCategory.MESSAGE_SOCIAL_ENGINEERING,
            severity="CRITICAL",
            source="Message Pattern Analyzer",
            title="Sensitive Credential Request Flagged",
            description=f"The message requests sensitive authentication details ({', '.join(matched_credentials)}).",
            interpretation="Legitimate financial institutions and services NEVER ask users to share OTPs, PINs, or passwords via SMS or unverified links."
        ))

    # 5. Extracted Link Warning
    if extracted_urls:
        evidence.append(EvidenceItem(
            category=EvidenceCategory.MESSAGE_SOCIAL_ENGINEERING,
            severity="MEDIUM",
            source="Message Pattern Analyzer",
            title=f"Embedded Link Detected ({len(extracted_urls)} found)",
            description=f"Found embedded URL: {extracted_urls[0]}",
            interpretation="Unsolicited text messages directing users to external links are the primary vector for phishing landing pages."
        ))

    # Social engineering indicators checklist
    social_engineering_vector = {
        "urgency_detected": len(matched_urgency) > 0,
        "financial_pressure": len(matched_financial) > 0,
        "credential_harvesting": len(matched_credentials) > 0,
        "has_embedded_url": len(extracted_urls) > 0,
        "extracted_urls": extracted_urls
    }

    return {
        "text_length": len(text),
        "extracted_urls": extracted_urls,
        "social_engineering": social_engineering_vector,
        "evidence": evidence
    }
