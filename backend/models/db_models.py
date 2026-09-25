import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class ScanRecord(Base):
    __tablename__ = "scans"

    scan_id = Column(String(64), primary_key=True, index=True)
    input_type = Column(String(20), nullable=False)  # 'url' or 'message'
    target = Column(String(512), nullable=False)     # Sanitized URL or truncated message summary
    risk_level = Column(String(50), nullable=False)
    risk_score = Column(Integer, nullable=False)
    summary = Column(Text, nullable=False)
    evidence_json = Column(JSON, nullable=False)
    service_statuses_json = Column(JSON, nullable=False)
    technical_details_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
