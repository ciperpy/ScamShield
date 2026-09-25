import tldextract
from typing import Dict, Any, List
from urllib.parse import urlparse
from backend.schemas.scan_schema import EvidenceItem, EvidenceCategory

TRUSTED_BRAND_MAP = {
    "paypal": ["paypal.com", "paypal.me"],
    "google": ["google.com", "google.co.in", "google.org", "youtube.com", "gmail.com"],
    "microsoft": ["microsoft.com", "office.com", "live.com", "outlook.com", "azure.com"],
    "apple": ["apple.com", "icloud.com"],
    "amazon": ["amazon.com", "amazon.in", "aws.amazon.com", "media-amazon.com"],
    "facebook": ["facebook.com", "fb.com", "messenger.com"],
    "instagram": ["instagram.com"],
    "netflix": ["netflix.com"],
    "whatsapp": ["whatsapp.com", "wa.me"],
    "telegram": ["telegram.org", "t.me"],
    "sbi": ["sbi.co.in", "onlinesbi.sbi", "onlinesbi.com"],
    "hdfc": ["hdfcbank.com", "hdfc.com"],
    "icici": ["icicibank.com"],
    "paytm": ["paytm.com"],
    "phonepe": ["phonepe.com"],
}

def analyze_brand_impersonation(url: str) -> Dict[str, Any]:
    """
    Parses the registrable root domain using tldextract and compares against a curated trusted domain database.
    Distinguishes legitimate brand domains from lookalike typosquatting or subdomain impersonation.
    """
    evidence: List[EvidenceItem] = []
    
    extracted = tldextract.extract(url)
    root_domain = f"{extracted.domain}.{extracted.suffix}".lower()
    
    parsed = urlparse(url)
    full_hostname = (parsed.hostname or "").lower()
    full_path = (parsed.path or "").lower()
    
    detected_impersonations = []

    for brand_key, legitimate_domains in TRUSTED_BRAND_MAP.items():
        # Check if the brand name is present anywhere in the hostname or path
        if brand_key in full_hostname or brand_key in full_path:
            # Verify if the actual root domain is in the brand's legitimate domains list
            is_legitimate_brand_domain = any(root_domain == leg_dom or root_domain.endswith("." + leg_dom) for leg_dom in legitimate_domains)
            
            if not is_legitimate_brand_domain:
                brand_display = brand_key.capitalize()
                detected_impersonations.append({
                    "brand": brand_display,
                    "actual_root_domain": root_domain,
                    "legitimate_domains": legitimate_domains
                })
                
                evidence.append(EvidenceItem(
                    category=EvidenceCategory.BRAND_IMPERSONATION,
                    severity="HIGH",
                    source="Brand Impersonation Detector",
                    title=f"Possible {brand_display} Brand Impersonation",
                    description=f"The URL references '{brand_display}' in its hostname or path, but the actual registered domain is '{root_domain}'.",
                    interpretation=f"Official {brand_display} services operate under official domains ({', '.join(legitimate_domains)}). Operating on '{root_domain}' indicates potential phishing or brand spoofing."
                ))

    return {
        "root_domain": root_domain,
        "impersonations_found": len(detected_impersonations) > 0,
        "detected_impersonations": detected_impersonations,
        "evidence": evidence
    }
