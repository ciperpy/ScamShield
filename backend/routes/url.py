import uuid
import asyncio
import datetime
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import ScanRecord
from backend.schemas.scan_schema import UrlScanRequest, ScanResponse, ApiStatusReport, ExecutionStep, HttpTelemetry
from backend.security.url_safety import normalize_url, sanitize_for_json
from backend.analyzers.url_analyzer import analyze_url_structure
from backend.analyzers.domain_analyzer import analyze_domain
from backend.analyzers.redirect_analyzer import trace_redirects
from backend.analyzers.tls_analyzer import analyze_tls
from backend.analyzers.brand_analyzer import analyze_brand_impersonation
from backend.integrations.virustotal import scan_virustotal
from backend.integrations.urlscan import scan_urlscan
from backend.risk.engine import evaluate_risk

router = APIRouter()

@router.post("/scan/url", response_model=ScanResponse)
async def scan_url_endpoint(request: UrlScanRequest, db: Session = Depends(get_db)):
    """
    Executes real-time multi-factor security analysis on a submitted URL.
    Runs URL structure, DNS/WHOIS, TLS, SSRF-guarded redirect trace, Brand impersonation, VirusTotal, and urlscan.io.
    """
    start_time = time.time()
    now_str = datetime.datetime.utcnow().strftime("%H:%M:%S")

    url_input = request.url.strip()
    if not url_input:
        raise HTTPException(status_code=400, detail="Target URL cannot be empty.")

    normalized_url = normalize_url(url_input)
    scan_id = str(uuid.uuid4())
    
    execution_timeline: list[ExecutionStep] = []

    # 1. URL Structure Check
    t0 = time.time()
    url_struct_res = analyze_url_structure(normalized_url)
    execution_timeline.append(ExecutionStep(
        name="URL Syntax & Structure Analysis",
        status="COMPLETED",
        timestamp=now_str,
        duration_ms=int((time.time() - t0) * 1000)
    ))

    # 2. Domain & DNS Check
    t0 = time.time()
    domain_res = analyze_domain(normalized_url)
    execution_timeline.append(ExecutionStep(
        name="DNS Resolution & WHOIS Telemetry",
        status="COMPLETED",
        timestamp=now_str,
        duration_ms=int((time.time() - t0) * 1000)
    ))

    # 3. TLS / HTTPS Check
    t0 = time.time()
    tls_res = analyze_tls(normalized_url)
    execution_timeline.append(ExecutionStep(
        name="TLS Certificate Inspection",
        status="COMPLETED",
        timestamp=now_str,
        duration_ms=int((time.time() - t0) * 1000)
    ))

    # 4. Brand Impersonation Check
    t0 = time.time()
    brand_res = analyze_brand_impersonation(normalized_url)
    execution_timeline.append(ExecutionStep(
        name="Brand Impersonation Check",
        status="COMPLETED",
        timestamp=now_str,
        duration_ms=int((time.time() - t0) * 1000)
    ))

    # 5. Async Network Analyzers (Redirects, VirusTotal, urlscan)
    t0 = time.time()
    redirect_task = asyncio.create_task(trace_redirects(normalized_url))
    vt_task = asyncio.create_task(scan_virustotal(normalized_url))
    urlscan_task = asyncio.create_task(scan_urlscan(normalized_url))

    redirect_res, (vt_status, vt_evidence, vt_details), (us_status, us_evidence, us_details) = await asyncio.gather(
        redirect_task, vt_task, urlscan_task
    )

    async_duration = int((time.time() - t0) * 1000)
    execution_timeline.append(ExecutionStep(
        name="HTTP Redirect Hop Tracing",
        status="COMPLETED" if not redirect_res.get("ssrf_blocked") else "FAILED",
        timestamp=now_str,
        duration_ms=async_duration
    ))

    execution_timeline.append(ExecutionStep(
        name="VirusTotal v3 Intelligence Query",
        status=vt_status.status.value,
        timestamp=now_str,
        duration_ms=async_duration
    ))

    execution_timeline.append(ExecutionStep(
        name="urlscan.io Dynamic Web Analysis",
        status=us_status.status.value,
        timestamp=now_str,
        duration_ms=async_duration
    ))

    # Aggregate Evidence
    all_evidence = []
    all_evidence.extend(url_struct_res.get("evidence", []))
    all_evidence.extend(domain_res.get("evidence", []))
    all_evidence.extend(redirect_res.get("evidence", []))
    all_evidence.extend(tls_res.get("evidence", []))
    all_evidence.extend(brand_res.get("evidence", []))
    all_evidence.extend(vt_evidence)
    all_evidence.extend(us_evidence)

    # Aggregate Service Statuses
    service_statuses: list[ApiStatusReport] = [
        vt_status,
        us_status
    ]

    # Evaluate overall risk
    risk_level, risk_score, summary, why_this_result, recommendations, risk_details, limitations = evaluate_risk(
        evidence=all_evidence,
        service_statuses=service_statuses,
        input_type="url"
    )

    # Check WHOIS status for limitations
    if domain_res.get("whois", {}).get("status") == "UNAVAILABLE":
        limitations.append("WHOIS domain registration history was redacted or unavailable.")

    execution_timeline.append(ExecutionStep(
        name="Evidence Aggregation & Risk Engine",
        status="COMPLETED",
        timestamp=now_str,
        duration_ms=int((time.time() - start_time) * 1000)
    ))

    technical_details = {
        "url_structure": url_struct_res,
        "domain": domain_res,
        "redirects": redirect_res,
        "tls": tls_res,
        "brand": brand_res,
        "virustotal": vt_details,
        "urlscan": us_details
    }

    http_telemetry_raw = redirect_res.get("http_telemetry", {})
    http_telemetry = HttpTelemetry(
        status_code=http_telemetry_raw.get("status_code"),
        server=http_telemetry_raw.get("server"),
        content_type=http_telemetry_raw.get("content_type"),
        response_time_ms=http_telemetry_raw.get("response_time_ms")
    )

    url_structure_checks = url_struct_res.get("structure_checks", [])

    # Save scan record to SQLite DB
    scan_record = ScanRecord(
        scan_id=scan_id,
        input_type="url",
        target=normalized_url,
        risk_level=risk_level.value,
        risk_score=risk_score,
        summary=summary,
        evidence_json=sanitize_for_json(all_evidence),
        service_statuses_json=sanitize_for_json(service_statuses),
        technical_details_json=sanitize_for_json(technical_details),
        created_at=datetime.datetime.utcnow()
    )
    db.add(scan_record)
    db.commit()

    return ScanResponse(
        scan_id=scan_id,
        input_type="url",
        target=normalized_url,
        risk_level=risk_level,
        risk_score=risk_score,
        risk_details=risk_details,
        summary=summary,
        evidence=all_evidence,
        service_statuses=service_statuses,
        why_this_result=why_this_result,
        recommendations=recommendations,
        technical_details=technical_details,
        http_telemetry=http_telemetry,
        url_structure_checks=url_structure_checks,
        execution_timeline=execution_timeline,
        limitations=limitations,
        created_at=scan_record.created_at
    )
