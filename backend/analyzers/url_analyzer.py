import re
import ipaddress
from urllib.parse import urlparse
from typing import Dict, Any, List
from backend.schemas.scan_schema import EvidenceItem, EvidenceCategory, UrlStructureCheck

SUSPICIOUS_KEYWORDS = ["login", "verify", "account", "update", "secure", "banking", "claim", "free", "bonus", "reward", "token", "auth", "signin", "wallet", "support"]
HIGH_RISK_TLDS = [".xyz", ".top", ".zip", ".mov", ".tk", ".ml", ".ga", ".cf", ".gq", ".work", ".click", ".link", ".buzz", ".cam"]

def analyze_url_structure(url: str) -> Dict[str, Any]:
    """
    Performs deterministic inspection on the URL string.
    Identifies IP hostnames, malformed ports, excessive subdomains, punycode, TLD risks, and keyword patterns.
    Produces a structured check matrix for URL Structure Analysis.
    """
    evidence: List[EvidenceItem] = []
    structure_checks: List[UrlStructureCheck] = []

    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    scheme = parsed.scheme.lower()
    port = parsed.port
    path = parsed.path.lower()
    query = parsed.query.lower()
    
    # 1. HTTPS Check
    if scheme == "https":
        structure_checks.append(UrlStructureCheck(
            name="HTTPS Encryption",
            status="PASS",
            description="URL uses secure HTTPS protocol scheme."
        ))
    else:
        structure_checks.append(UrlStructureCheck(
            name="HTTPS Encryption",
            status="FAIL",
            description="URL uses unencrypted HTTP protocol scheme."
        ))

    # 2. IP Hostname Check
    is_ip_hostname = False
    try:
        ipaddress.ip_address(hostname)
        is_ip_hostname = True
        structure_checks.append(UrlStructureCheck(
            name="IP-Based Hostname",
            status="FAIL",
            description=f"Website uses explicit IP address '{hostname}' instead of a registered domain."
        ))
        evidence.append(EvidenceItem(
            category=EvidenceCategory.URL_STRUCTURE,
            severity="HIGH",
            source="URL Structural Check",
            title="IP Address Hostname Detected",
            description=f"The website uses an explicit IP address '{hostname}' instead of a normal domain name.",
            interpretation="Legitimate consumer sites almost exclusively use registered domain names. Phishing attackers frequently use IP addresses to bypass domain reputation checks."
        ))
    except ValueError:
        structure_checks.append(UrlStructureCheck(
            name="IP-Based Hostname",
            status="PASS",
            description="Uses standard domain name rather than explicit IP address."
        ))

    # 3. Unusual Port Check
    is_unusual_port = False
    if port and port not in (80, 443):
        is_unusual_port = True
        structure_checks.append(UrlStructureCheck(
            name="Web Port Assignment",
            status="WARNING",
            description=f"Connects on non-standard port {port} instead of standard web ports (80/443)."
        ))
        evidence.append(EvidenceItem(
            category=EvidenceCategory.URL_STRUCTURE,
            severity="MEDIUM",
            source="URL Structural Check",
            title="Non-Standard Web Port Detected",
            description=f"The URL connects on port {port} instead of standard web ports (80/443).",
            interpretation="Unusual port numbers are often used by temporary phishing servers or self-hosted malware command nodes."
        ))
    else:
        structure_checks.append(UrlStructureCheck(
            name="Web Port Assignment",
            status="PASS",
            description="Uses standard HTTP/HTTPS web ports."
        ))

    # 4. Excessive Subdomains Check
    subdomains = hostname.split(".")
    has_excessive_subdomains = False
    if not is_ip_hostname and len(subdomains) > 3:
        has_excessive_subdomains = True
        structure_checks.append(UrlStructureCheck(
            name="Subdomain Depth",
            status="WARNING",
            description=f"Hostname contains {len(subdomains)} domain levels (excessive subdomain stacking)."
        ))
        evidence.append(EvidenceItem(
            category=EvidenceCategory.URL_STRUCTURE,
            severity="MEDIUM",
            source="URL Structural Check",
            title="Excessive Subdomains Detected",
            description=f"The hostname '{hostname}' contains {len(subdomains)} domain levels.",
            interpretation="Attackers often stack multiple subdomains (e.g. paypal.com.login.user-auth.example.com) to trick users on mobile screens into seeing trusted brand names."
        ))
    else:
        structure_checks.append(UrlStructureCheck(
            name="Subdomain Depth",
            status="PASS",
            description="Subdomain hierarchy depth is normal."
        ))

    # 5. Punycode Check
    has_punycode = False
    if "xn--" in hostname:
        has_punycode = True
        structure_checks.append(UrlStructureCheck(
            name="Punycode Homograph Encoding",
            status="FAIL",
            description="Domain uses Punycode (xn--) encoding."
        ))
        evidence.append(EvidenceItem(
            category=EvidenceCategory.URL_STRUCTURE,
            severity="HIGH",
            source="URL Structural Check",
            title="Punycode / Homograph Encoding Detected",
            description=f"The domain '{hostname}' uses Punycode encoding (xn--).",
            interpretation="Punycode allows registering look-alike domains using foreign alphabets (homograph attacks) that mimic legitimate brand names."
        ))
    else:
        structure_checks.append(UrlStructureCheck(
            name="Punycode Homograph Encoding",
            status="PASS",
            description="No homograph Punycode encoding detected."
        ))

    # 6. Credentials @ Symbol Check
    has_at_symbol = "@" in url
    if has_at_symbol:
        structure_checks.append(UrlStructureCheck(
            name="Credentials Userinfo Symbol (@)",
            status="FAIL",
            description="URL contains userinfo '@' symbol."
        ))
        evidence.append(EvidenceItem(
            category=EvidenceCategory.URL_STRUCTURE,
            severity="HIGH",
            source="URL Structural Check",
            title="Credentials @ Symbol in URL",
            description="The URL contains an '@' character, which can obscure the true destination domain in standard web browsers.",
            interpretation="Everything before the '@' symbol is ignored by the browser during host routing, leading users to mistake the destination."
        ))
    else:
        structure_checks.append(UrlStructureCheck(
            name="Credentials Userinfo Symbol (@)",
            status="PASS",
            description="No userinfo routing obfuscation symbol (@) found."
        ))

    # 7. TLD Check
    matched_tld = ""
    for tld in HIGH_RISK_TLDS:
        if hostname.endswith(tld):
            matched_tld = tld
            evidence.append(EvidenceItem(
                category=EvidenceCategory.URL_STRUCTURE,
                severity="LOW",
                source="URL Structural Check",
                title=f"High-Risk TLD Extension ({tld})",
                description=f"The domain uses the '{tld}' top-level domain.",
                interpretation=f"The {tld} extension is commonly available at zero or low cost and is statistically prevalent in transient spam/phishing campaigns. This is a risk factor, not proof of malice."
            ))
            break

    if matched_tld:
        structure_checks.append(UrlStructureCheck(
            name="Top-Level Domain Risk",
            status="WARNING",
            description=f"Uses high-risk TLD extension '{matched_tld}'."
        ))
    else:
        structure_checks.append(UrlStructureCheck(
            name="Top-Level Domain Risk",
            status="PASS",
            description="Uses standard top-level domain extension."
        ))

    # 8. Keywords Check
    found_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in path or kw in query]
    if found_keywords:
        structure_checks.append(UrlStructureCheck(
            name="Sensitive Action Keywords",
            status="WARNING",
            description=f"Contains sensitive keywords: {', '.join(found_keywords[:3])}."
        ))
    else:
        structure_checks.append(UrlStructureCheck(
            name="Sensitive Action Keywords",
            status="PASS",
            description="No sensitive phishing/auth keywords matched in path."
        ))

    return {
        "url": url,
        "scheme": scheme,
        "hostname": hostname,
        "port": port,
        "is_ip_hostname": is_ip_hostname,
        "is_unusual_port": is_unusual_port,
        "has_excessive_subdomains": has_excessive_subdomains,
        "has_punycode": has_punycode,
        "has_at_symbol": has_at_symbol,
        "high_risk_tld": matched_tld,
        "found_keywords": found_keywords,
        "structure_checks": structure_checks,
        "evidence": evidence
    }
