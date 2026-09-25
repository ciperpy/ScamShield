import socket
import ssl
import datetime
from typing import Dict, Any, List
from urllib.parse import urlparse
from backend.schemas.scan_schema import EvidenceItem, EvidenceCategory

def analyze_tls(url: str) -> Dict[str, Any]:
    """
    Inspects SSL/TLS certificate details for HTTPS websites.
    Explicitly clarifies that HTTPS protects transport encryption, NOT site legitimacy.
    """
    evidence: List[EvidenceItem] = []
    parsed = urlparse(url)
    scheme = parsed.scheme.lower()
    hostname = parsed.hostname
    port = parsed.port or (443 if scheme == "https" else 80)

    if scheme != "https":
        evidence.append(EvidenceItem(
            category=EvidenceCategory.TLS,
            severity="MEDIUM",
            source="TLS/HTTPS Inspector",
            title="Unencrypted HTTP Connection",
            description="The URL uses unencrypted HTTP protocol (http://) rather than HTTPS.",
            interpretation="Unencrypted connections allow network eavesdropping and data tampering. Modern legitimate web services enforce HTTPS."
        ))
        return {
            "has_https": False,
            "certificate_valid": False,
            "issuer": None,
            "expiration_date": None,
            "days_until_expiration": None,
            "evidence": evidence
        }

    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=4.0) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                
                # Extract Issuer
                issuer = dict(x[0] for x in cert.get("issuer", []))
                issuer_name = issuer.get("organizationName") or issuer.get("commonName") or "Unknown Issuer"
                
                # Expiration parsing
                not_after_str = cert.get("notAfter")
                expiration_date = None
                days_until_expiration = None
                if not_after_str:
                    expiration_date = datetime.datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z")
                    days_until_expiration = (expiration_date - datetime.datetime.utcnow()).days

                evidence.append(EvidenceItem(
                    category=EvidenceCategory.TLS,
                    severity="INFO",
                    source="TLS/HTTPS Inspector",
                    title="Valid HTTPS Certificate Enabled",
                    description=f"TLS transport encryption is active. Issuer: {issuer_name}. Certificate valid for {days_until_expiration} more days.",
                    interpretation="HTTPS encrypts communication between your browser and the server. NOTE: HTTPS alone does NOT prove that a website is legitimate—scam sites routinely use free HTTPS certificates."
                ))

                return {
                    "has_https": True,
                    "certificate_valid": True,
                    "issuer": issuer_name,
                    "expiration_date": expiration_date.isoformat() if expiration_date else None,
                    "days_until_expiration": days_until_expiration,
                    "evidence": evidence
                }
    except Exception as e:
        evidence.append(EvidenceItem(
            category=EvidenceCategory.TLS,
            severity="MEDIUM",
            source="TLS/HTTPS Inspector",
            title="TLS Handshake / Certificate Warning",
            description=f"Could not establish a verified TLS connection to '{hostname}' ({str(e)}).",
            interpretation="Invalid, self-signed, or untrusted SSL certificates prevent secure transport and are common in temporary malicious infrastructure."
        ))
        return {
            "has_https": True,
            "certificate_valid": False,
            "issuer": None,
            "expiration_date": None,
            "days_until_expiration": None,
            "error": str(e),
            "evidence": evidence
        }
