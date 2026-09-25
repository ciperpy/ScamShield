import dns.resolver
import whois
import datetime
from typing import Dict, Any, List
from urllib.parse import urlparse
from backend.schemas.scan_schema import EvidenceItem, EvidenceCategory

def analyze_domain(url: str) -> Dict[str, Any]:
    """
    Analyzes domain DNS records and WHOIS age telemetry.
    Respects privacy redaction: missing WHOIS is marked as UNKNOWN, NOT marked as suspicious.
    """
    evidence: List[EvidenceItem] = []
    parsed = urlparse(url)
    hostname = parsed.hostname or url
    
    # DNS Resolution
    dns_records = {
        "a_records": [],
        "mx_records": [],
        "ns_records": []
    }
    
    try:
        a_answers = dns.resolver.resolve(hostname, "A")
        dns_records["a_records"] = [str(rdata) for rdata in a_answers]
    except Exception:
        pass

    try:
        mx_answers = dns.resolver.resolve(hostname, "MX")
        dns_records["mx_records"] = [str(rdata.exchange) for rdata in mx_answers]
    except Exception:
        pass

    try:
        ns_answers = dns.resolver.resolve(hostname, "NS")
        dns_records["ns_records"] = [str(rdata.target) for rdata in ns_answers]
    except Exception:
        pass

    # WHOIS Lookup
    whois_data = {
        "status": "UNKNOWN",
        "domain_age_days": None,
        "creation_date": None,
        "expiration_date": None,
        "registrar": None,
        "reason": "WHOIS lookup not executed"
    }

    try:
        w = whois.whois(hostname)
        creation_date = w.creation_date
        
        # Handle list of dates if WHOIS returns multiple
        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        expiration_date = w.expiration_date
        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]

        registrar = w.registrar
        if isinstance(registrar, list):
            registrar = registrar[0]

        if creation_date and isinstance(creation_date, datetime.datetime):
            now = datetime.datetime.utcnow()
            age_days = (now - creation_date).days
            whois_data["status"] = "AVAILABLE"
            whois_data["domain_age_days"] = max(0, age_days)
            whois_data["creation_date"] = creation_date.isoformat()
            whois_data["expiration_date"] = expiration_date.isoformat() if isinstance(expiration_date, datetime.datetime) else str(expiration_date)
            whois_data["registrar"] = str(registrar) if registrar else "Unknown"

            if age_days < 30:
                evidence.append(EvidenceItem(
                    category=EvidenceCategory.DOMAIN,
                    severity="LOW",
                    source="WHOIS Domain Intelligence",
                    title=f"Newly Registered Domain ({age_days} days old)",
                    description=f"Domain was registered on {creation_date.strftime('%Y-%m-%d')} ({age_days} days ago). Registrar: {whois_data['registrar']}.",
                    interpretation="Newly registered domains can be legitimate startups, but transient phishing domains are frequently registered less than 30 days before launch."
                ))
            else:
                evidence.append(EvidenceItem(
                    category=EvidenceCategory.DOMAIN,
                    severity="INFO",
                    source="WHOIS Domain Intelligence",
                    title=f"Established Domain Age ({age_days} days old)",
                    description=f"Domain was registered on {creation_date.strftime('%Y-%m-%d')}.",
                    interpretation="Older domain registration history provides established domain presence."
                ))
        else:
            whois_data["status"] = "UNAVAILABLE"
            whois_data["reason"] = "Registration data redacted, private, or unavailable"
            evidence.append(EvidenceItem(
                category=EvidenceCategory.DOMAIN,
                severity="INFO",
                source="WHOIS Domain Intelligence",
                title="Domain Age: Unknown",
                description="WHOIS registration details were redacted, private, or not returned by the registrar.",
                interpretation="WHOIS privacy protection is standard practice for many legitimate domain owners and does not indicate malicious intent."
            ))
            
    except Exception as e:
        whois_data["status"] = "UNAVAILABLE"
        whois_data["reason"] = f"WHOIS query failed or lookup timed out ({str(e)})"
        evidence.append(EvidenceItem(
            category=EvidenceCategory.DOMAIN,
            severity="INFO",
            source="WHOIS Domain Intelligence",
            title="Domain Age: Unknown",
            description="Domain registration information could not be retrieved from public WHOIS servers.",
            interpretation="Unavailable WHOIS data is common due to privacy regulations (GDPR) and is treated neutrally."
        ))

    return {
        "dns": dns_records,
        "whois": whois_data,
        "evidence": evidence
    }
