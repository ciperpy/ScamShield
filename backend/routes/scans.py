import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import ScanRecord
from backend.schemas.scan_schema import RecentScanItem, ScanResponse, RiskLevel, EvidenceItem, ApiStatusReport

router = APIRouter()

@router.get("/scans/recent", response_model=List[RecentScanItem])
def get_recent_scans(db: Session = Depends(get_db)):
    """
    Retrieves the 10 most recent scan reports for dashboard display.
    """
    records = db.query(ScanRecord).order_by(ScanRecord.created_at.desc()).limit(10).all()
    results = []
    for r in records:
        results.append(RecentScanItem(
            scan_id=r.scan_id,
            input_type=r.input_type,
            target=r.target,
            risk_level=RiskLevel(r.risk_level),
            risk_score=r.risk_score,
            created_at=r.created_at
        ))
    return results

@router.get("/scans/{scan_id}", response_model=ScanResponse)
def get_scan_by_id(scan_id: str, db: Session = Depends(get_db)):
    """
    Retrieves a full scan report by scan_id.
    """
    r = db.query(ScanRecord).filter(ScanRecord.scan_id == scan_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    evidence_items = [EvidenceItem(**item) for item in (r.evidence_json or [])]
    statuses = [ApiStatusReport(**item) for item in (r.service_statuses_json or [])]

    # Reconstruct explanations
    why_this_result = [f"[{e.severity}] {e.title}: {e.description}" for e in evidence_items if e.severity in ("CRITICAL", "HIGH", "MEDIUM", "LOW")]
    if not why_this_result:
        why_this_result = ["No active threat indicators detected."]

    recommendations = [
        "⚠️ Do NOT enter passwords, usernames, PINs, or OTPs on unverified sites.",
        "🔒 Verify URL domains in your address bar before interacting."
    ]

    return ScanResponse(
        scan_id=r.scan_id,
        input_type=r.input_type,
        target=r.target,
        risk_level=RiskLevel(r.risk_level),
        risk_score=r.risk_score,
        summary=r.summary,
        evidence=evidence_items,
        service_statuses=statuses,
        why_this_result=why_this_result,
        recommendations=recommendations,
        technical_details=r.technical_details_json or {},
        created_at=r.created_at
    )
