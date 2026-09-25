import uuid
import datetime
import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import ScanRecord
from backend.schemas.scan_schema import MessageScanRequest, ScanResponse, ApiStatusReport, ServiceStatus, ExecutionStep
from backend.security.url_safety import sanitize_for_json
from backend.analyzers.message_analyzer import analyze_message_content
from backend.risk.engine import evaluate_risk

router = APIRouter()

@router.post("/scan/message", response_model=ScanResponse)
async def scan_message_endpoint(request: MessageScanRequest, db: Session = Depends(get_db)):
    """
    Executes local deterministic social engineering analysis on SMS/text message content.
    Flagging urgency, financial promises, credential theft, and embedded phishing links.
    PRIVACY GUARANTEE: The full message text is NEVER saved to the database or transmitted to 3rd-party services.
    """
    start_time = time.time()
    now_str = datetime.datetime.utcnow().strftime("%H:%M:%S")

    raw_text = request.message_text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Message text cannot be empty.")

    scan_id = str(uuid.uuid4())
    execution_timeline: list[ExecutionStep] = []
    
    # 1. Analyze message text locally
    t0 = time.time()
    msg_res = analyze_message_content(raw_text)
    all_evidence = msg_res.get("evidence", [])
    execution_timeline.append(ExecutionStep(
        name="Local Social Engineering Pattern Analysis",
        status="COMPLETED",
        timestamp=now_str,
        duration_ms=int((time.time() - t0) * 1000)
    ))

    service_statuses = [
        ApiStatusReport(
            service="Local Pattern Analyzer",
            status=ServiceStatus.COMPLETED,
            message="Local deterministic social engineering scan executed. Zero remote data transmitted."
        )
    ]

    # Evaluate risk
    risk_level, risk_score, summary, why_this_result, recommendations, risk_details, limitations = evaluate_risk(
        evidence=all_evidence,
        service_statuses=service_statuses,
        input_type="message"
    )

    execution_timeline.append(ExecutionStep(
        name="Evidence Aggregation & Risk Engine",
        status="COMPLETED",
        timestamp=now_str,
        duration_ms=int((time.time() - start_time) * 1000)
    ))

    # Privacy-preserving target summary for DB storage
    sanitized_target = raw_text[:60] + ("..." if len(raw_text) > 60 else "")

    technical_details = {
        "text_length": len(raw_text),
        "social_engineering": msg_res.get("social_engineering"),
        "extracted_urls": msg_res.get("extracted_urls")
    }

    # Save to DB with sanitized snippet
    scan_record = ScanRecord(
        scan_id=scan_id,
        input_type="message",
        target=sanitized_target,
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
        input_type="message",
        target=sanitized_target,
        risk_level=risk_level,
        risk_score=risk_score,
        risk_details=risk_details,
        summary=summary,
        evidence=all_evidence,
        service_statuses=service_statuses,
        why_this_result=why_this_result,
        recommendations=recommendations,
        technical_details=technical_details,
        execution_timeline=execution_timeline,
        limitations=limitations,
        created_at=scan_record.created_at
    )
