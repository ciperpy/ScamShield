import httpx
import base64
from typing import Dict, Any, List, Tuple
from backend.config import settings
from backend.schemas.scan_schema import ApiStatusReport, ServiceStatus, EvidenceItem, EvidenceCategory

async def scan_virustotal(url: str) -> Tuple[ApiStatusReport, List[EvidenceItem], Dict[str, Any]]:
    """
    Submits a URL or retrieves an existing analysis report from VirusTotal API v3.
    Extracts vendor engine-level detection results map and report URL.
    Reports explicit status: COMPLETED, NOT_CONFIGURED, RATE_LIMITED, SERVICE_UNAVAILABLE, FAILED.
    """
    evidence: List[EvidenceItem] = []
    details: Dict[str, Any] = {}

    if not settings.VIRUSTOTAL_API_KEY:
        status_report = ApiStatusReport(
            service="VirusTotal v3",
            status=ServiceStatus.NOT_CONFIGURED,
            message="VirusTotal API key is not configured in environment (VIRUSTOTAL_API_KEY)."
        )
        return status_report, evidence, details

    # VirusTotal URL ID is base64url without padding of the URL
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    headers = {
        "x-apikey": settings.VIRUSTOTAL_API_KEY,
        "Accept": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(api_url, headers=headers)
            
            if response.status_code == 429:
                return ApiStatusReport(
                    service="VirusTotal v3",
                    status=ServiceStatus.RATE_LIMITED,
                    message="VirusTotal API rate limit reached (HTTP 429)."
                ), evidence, details

            if response.status_code >= 500:
                return ApiStatusReport(
                    service="VirusTotal v3",
                    status=ServiceStatus.SERVICE_UNAVAILABLE,
                    message=f"VirusTotal server error (HTTP {response.status_code})."
                ), evidence, details

            if response.status_code == 404:
                # URL not analyzed yet on VT - attempt POST submission
                submit_res = await client.post("https://www.virustotal.com/api/v3/urls", headers=headers, data={"url": url})
                if submit_res.status_code in (200, 201):
                    return ApiStatusReport(
                        service="VirusTotal v3",
                        status=ServiceStatus.COMPLETED,
                        message="URL submitted to VirusTotal for analysis. First-time scan queued."
                    ), evidence, {"submitted": True, "report_url": f"https://www.virustotal.com/gui/url/{url_id}"}

            if response.status_code == 200:
                data = response.json().get("data", {})
                attributes = data.get("attributes", {})
                stats = attributes.get("last_analysis_stats", {})
                results = attributes.get("last_analysis_results", {})

                malicious_count = stats.get("malicious", 0)
                suspicious_count = stats.get("suspicious", 0)
                harmless_count = stats.get("harmless", 0)
                undetected_count = stats.get("undetected", 0)
                total_engines = malicious_count + suspicious_count + harmless_count + undetected_count

                # Extract vendor engine-level detection map
                engine_results = []
                flagged_vendors = []
                for vendor, res in results.items():
                    category = res.get("category", "undetected")
                    engine_results.append({
                        "engine": vendor,
                        "category": category,
                        "result_text": res.get("result", category)
                    })
                    if category in ("malicious", "suspicious"):
                        flagged_vendors.append(f"{vendor} ({category})")

                report_url = f"https://www.virustotal.com/gui/url/{url_id}"

                details = {
                    "report_url": report_url,
                    "total_engines": total_engines,
                    "malicious": malicious_count,
                    "suspicious": suspicious_count,
                    "harmless": harmless_count,
                    "undetected": undetected_count,
                    "flagged_vendors": flagged_vendors,
                    "engine_results": engine_results[:40],  # Return up to 40 vendor engine results for report table
                    "reputation": attributes.get("reputation", 0)
                }

                if malicious_count > 0 or suspicious_count > 0:
                    severity = "CRITICAL" if malicious_count >= 5 else "HIGH" if malicious_count >= 1 else "MEDIUM"
                    evidence.append(EvidenceItem(
                        category=EvidenceCategory.THREAT_INTELLIGENCE,
                        severity=severity,
                        source="VirusTotal API v3",
                        title=f"VirusTotal Threats Detected ({malicious_count} Malicious, {suspicious_count} Suspicious)",
                        description=f"{malicious_count + suspicious_count} of {total_engines} security vendors flagged this URL. Flagged: {', '.join(flagged_vendors[:5])}{'...' if len(flagged_vendors)>5 else ''}.",
                        interpretation="Global cybersecurity vendors have identified active threat signatures, phishing payloads, or malicious code associated with this URL.",
                        source_url=report_url
                    ))
                else:
                    evidence.append(EvidenceItem(
                        category=EvidenceCategory.THREAT_INTELLIGENCE,
                        severity="INFO",
                        source="VirusTotal API v3",
                        title=f"VirusTotal Clear (0 / {total_engines} Detections)",
                        description=f"0 of {total_engines} security engines flagged this URL as malicious in the returned VirusTotal report.",
                        interpretation="No security vendors in VirusTotal currently list active malware signatures for this URL. Note: 0 detections alone does not guarantee absolute safety.",
                        source_url=report_url
                    ))

                return ApiStatusReport(
                    service="VirusTotal v3",
                    status=ServiceStatus.COMPLETED,
                    message=f"Analysis retrieved successfully ({malicious_count}/{total_engines} malicious detections)."
                ), evidence, details

            return ApiStatusReport(
                service="VirusTotal v3",
                status=ServiceStatus.FAILED,
                message=f"Unexpected status HTTP {response.status_code} from VirusTotal API."
            ), evidence, details

    except Exception as e:
        return ApiStatusReport(
            service="VirusTotal v3",
            status=ServiceStatus.SERVICE_UNAVAILABLE,
            message=f"VirusTotal client network request failed ({str(e)})."
        ), evidence, details
