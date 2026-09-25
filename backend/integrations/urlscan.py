import httpx
import asyncio
from typing import Dict, Any, List, Tuple
from backend.config import settings
from backend.schemas.scan_schema import ApiStatusReport, ServiceStatus, EvidenceItem, EvidenceCategory

async def scan_urlscan(url: str) -> Tuple[ApiStatusReport, List[EvidenceItem], Dict[str, Any]]:
    """
    Submits a URL to urlscan.io API and polls for dynamic web behavior analysis.
    Uses configurable visibility ('unlisted' by default for user privacy).
    Reports explicit status: COMPLETED, NOT_CONFIGURED, RATE_LIMITED, SERVICE_UNAVAILABLE, FAILED.
    """
    evidence: List[EvidenceItem] = []
    details: Dict[str, Any] = {}

    if not settings.URLSCAN_API_KEY:
        status_report = ApiStatusReport(
            service="urlscan.io",
            status=ServiceStatus.NOT_CONFIGURED,
            message="urlscan.io API key is not configured in environment (URLSCAN_API_KEY)."
        )
        return status_report, evidence, details

    headers = {
        "API-Key": settings.URLSCAN_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "url": url,
        "visibility": settings.URLSCAN_VISIBILITY
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Submit scan request
            submit_res = await client.post("https://urlscan.io/api/v1/scan/", headers=headers, json=payload)
            
            if submit_res.status_code == 429:
                return ApiStatusReport(
                    service="urlscan.io",
                    status=ServiceStatus.RATE_LIMITED,
                    message="urlscan.io API rate limit reached (HTTP 429)."
                ), evidence, details

            if submit_res.status_code != 200:
                return ApiStatusReport(
                    service="urlscan.io",
                    status=ServiceStatus.FAILED,
                    message=f"urlscan.io submit failed with HTTP {submit_res.status_code}."
                ), evidence, details

            submit_data = submit_res.json()
            api_result_url = submit_data.get("api")
            result_id = submit_data.get("uuid")

            if not api_result_url or not result_id:
                return ApiStatusReport(
                    service="urlscan.io",
                    status=ServiceStatus.FAILED,
                    message="urlscan.io returned malformed submission response."
                ), evidence, details

            # 2. Async polling for scan completion (poll up to 3 times with 3s intervals)
            scan_completed = False
            result_data = {}
            for _ in range(3):
                await asyncio.sleep(3)
                poll_res = await client.get(api_result_url)
                if poll_res.status_code == 200:
                    result_data = poll_res.json()
                    scan_completed = True
                    break

            if not scan_completed:
                return ApiStatusReport(
                    service="urlscan.io",
                    status=ServiceStatus.COMPLETED,
                    message=f"urlscan.io scan submitted (UUID: {result_id}). Async scan is in progress."
                ), evidence, {
                    "uuid": result_id,
                    "report_url": f"https://urlscan.io/result/{result_id}/",
                    "screenshot_url": f"https://urlscan.io/screenshots/{result_id}.png"
                }

            # Process completed result
            page = result_data.get("page", {})
            verdicts = result_data.get("verdicts", {}).get("overall", {})
            task = result_data.get("task", {})
            stats = result_data.get("stats", {})

            screenshot_url = f"https://urlscan.io/screenshots/{result_id}.png"
            report_url = f"https://urlscan.io/result/{result_id}/"
            final_url = page.get("url") or task.get("url")
            page_title = page.get("title") or "Dynamic Scan Result"
            malicious_verdict = verdicts.get("malicious", False)
            verdict_score = verdicts.get("score", 0)

            details = {
                "uuid": result_id,
                "screenshot_url": screenshot_url,
                "report_url": report_url,
                "final_url": final_url,
                "page_title": page_title,
                "domain": page.get("domain"),
                "ip": page.get("ip"),
                "country": page.get("country"),
                "server": page.get("server"),
                "asn": page.get("asn"),
                "asnname": page.get("asnname"),
                "uniq_countries": stats.get("uniqCountries", 1),
                "verdict_score": verdict_score,
                "is_malicious": malicious_verdict
            }

            if malicious_verdict or verdict_score > 50:
                evidence.append(EvidenceItem(
                    category=EvidenceCategory.THREAT_INTELLIGENCE,
                    severity="HIGH",
                    source="urlscan.io Dynamic Scanner",
                    title="urlscan.io Flagged Malicious Verdict",
                    description=f"urlscan.io dynamic analysis gave a threat score of {verdict_score}/100.",
                    interpretation="Automated headless browsing detected suspicious script execution, malicious outbound connections, or phishing page structures.",
                    source_url=report_url
                ))
            else:
                evidence.append(EvidenceItem(
                    category=EvidenceCategory.THREAT_INTELLIGENCE,
                    severity="INFO",
                    source="urlscan.io Dynamic Scanner",
                    title="urlscan.io Dynamic Scan Completed",
                    description=f"Dynamic scan completed on final URL: {final_url}",
                    interpretation="Dynamic analysis captured live page render and network connections without immediate automated security triggers.",
                    source_url=report_url
                ))

            return ApiStatusReport(
                service="urlscan.io",
                status=ServiceStatus.COMPLETED,
                message="Dynamic page scan retrieved successfully."
            ), evidence, details

    except Exception as e:
        return ApiStatusReport(
            service="urlscan.io",
            status=ServiceStatus.SERVICE_UNAVAILABLE,
            message=f"urlscan.io request failed ({str(e)})."
        ), evidence, details
