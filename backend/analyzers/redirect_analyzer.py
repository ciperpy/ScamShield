import time
import httpx
from typing import Dict, Any, List
from urllib.parse import urlparse
from backend.security.ssrf import validate_url_ssrf
from backend.schemas.scan_schema import EvidenceItem, EvidenceCategory, HttpTelemetry
from backend.config import settings

async def trace_redirects(initial_url: str) -> Dict[str, Any]:
    """
    Safely follows HTTP redirect chains server-side with SSRF protection on every hop.
    Captures HTTP status code, server headers, content type, and detailed hop flow.
    Flags HTTP 404 status as explicit contextual evidence.
    """
    evidence: List[EvidenceItem] = []
    redirect_chain: List[str] = [initial_url]
    hop_details: List[Dict[str, Any]] = []
    current_url = initial_url
    
    # Verify initial URL SSRF safety
    is_safe, primary_ip, reason = validate_url_ssrf(current_url)
    if not is_safe:
        evidence.append(EvidenceItem(
            category=EvidenceCategory.REDIRECTS,
            severity="HIGH",
            source="SSRF Protection Guard",
            title="SSRF Security Block Triggered",
            description=reason,
            interpretation="ScamShield blocked HTTP connection because the destination hostname points to restricted or private IP addresses."
        ))
        return {
            "initial_url": initial_url,
            "final_url": initial_url,
            "redirect_count": 0,
            "redirect_chain": [initial_url],
            "hop_details": [],
            "http_telemetry": {
                "status_code": None,
                "server": None,
                "content_type": None,
                "response_time_ms": None
            },
            "ssrf_blocked": True,
            "evidence": evidence
        }

    hop_count = 0
    client_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ScamShield-Security-Analyzer/1.0"
    }

    final_status_code = None
    final_server = None
    final_content_type = None
    start_time = time.time()

    try:
        async with httpx.AsyncClient(follow_redirects=False, timeout=settings.REDIRECT_TIMEOUT_SECONDS, headers=client_headers) as client:
            while hop_count < settings.MAX_REDIRECT_HOPS:
                try:
                    res_start = time.time()
                    response = await client.get(current_url)
                    res_duration = int((time.time() - res_start) * 1000)

                    final_status_code = response.status_code
                    final_server = response.headers.get("server") or response.headers.get("Server")
                    final_content_type = response.headers.get("content-type") or response.headers.get("Content-Type")

                    hop_details.append({
                        "hop": hop_count,
                        "url": current_url,
                        "status_code": response.status_code,
                        "server": final_server,
                        "content_type": final_content_type,
                        "response_time_ms": res_duration
                    })

                    if response.is_redirect or response.status_code in (301, 302, 303, 307, 308):
                        location = response.headers.get("location")
                        if not location:
                            break
                        
                        # Resolve relative URLs
                        if location.startswith("/"):
                            parsed_curr = urlparse(current_url)
                            next_url = f"{parsed_curr.scheme}://{parsed_curr.netloc}{location}"
                        elif not (location.startswith("http://") or location.startswith("https://")):
                            parsed_curr = urlparse(current_url)
                            next_url = f"{parsed_curr.scheme}://{parsed_curr.netloc}/{location.lstrip('/')}"
                        else:
                            next_url = location

                        # Validate next URL against SSRF
                        next_safe, _, next_reason = validate_url_ssrf(next_url)
                        if not next_safe:
                            evidence.append(EvidenceItem(
                                category=EvidenceCategory.REDIRECTS,
                                severity="HIGH",
                                source="SSRF Protection Guard",
                                title="Redirect Chain SSRF Block",
                                description=f"Hop {hop_count + 1} redirect to '{next_url}' was blocked: {next_reason}",
                                interpretation="A redirect target resolved to an internal/private address and was safety-terminated."
                            ))
                            break

                        redirect_chain.append(next_url)
                        current_url = next_url
                        hop_count += 1
                    else:
                        break
                except httpx.RequestError as e:
                    break
    except Exception:
        pass

    total_duration_ms = int((time.time() - start_time) * 1000)
    final_url = current_url
    redirect_count = max(0, len(redirect_chain) - 1)

    # 404 Status Evidence handling (Requirement #2)
    if final_status_code == 404:
        evidence.append(EvidenceItem(
            category=EvidenceCategory.REDIRECTS,
            severity="INFO",
            source="HTTP Response Inspector",
            title="HTTP Status 404 Not Found",
            description=f"The target page returned HTTP status 404 (Not Found).",
            interpretation="HTTP 404 indicates the page was removed, moved, or non-existent. Note: A 404 response does NOT prove a domain is safe."
        ))

    if redirect_count >= 3:
        evidence.append(EvidenceItem(
            category=EvidenceCategory.REDIRECTS,
            severity="MEDIUM",
            source="Redirect Chain Analyzer",
            title=f"Multiple HTTP Redirects ({redirect_count} hops)",
            description=f"Initial URL redirected {redirect_count} times. Final destination: {final_url}",
            interpretation="Multiple redirect hops are commonly used by phishing networks and URL shorteners to mask final malicious destinations."
        ))

    initial_domain = urlparse(initial_url).hostname
    final_domain = urlparse(final_url).hostname

    if redirect_count > 0 and initial_domain and final_domain and initial_domain.lower() != final_domain.lower():
        evidence.append(EvidenceItem(
            category=EvidenceCategory.REDIRECTS,
            severity="LOW",
            source="Redirect Chain Analyzer",
            title="Cross-Domain Redirect",
            description=f"Initial domain '{initial_domain}' redirected to a different destination domain '{final_domain}'.",
            interpretation="Redirecting across different domain names is common in URL shorteners, affiliate links, and deceptive redirects."
        ))

    return {
        "initial_url": initial_url,
        "final_url": final_url,
        "redirect_count": redirect_count,
        "redirect_chain": redirect_chain,
        "hop_details": hop_details,
        "http_telemetry": {
            "status_code": final_status_code,
            "server": final_server,
            "content_type": final_content_type,
            "response_time_ms": total_duration_ms
        },
        "ssrf_blocked": False,
        "evidence": evidence
    }
