from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class RiskLevel(str, Enum):
    LOW = "SAFE / LOW RISK"
    MEDIUM = "MEDIUM RISK"
    HIGH = "HIGH RISK"
    CRITICAL = "CRITICAL RISK"
    UNKNOWN = "UNKNOWN / INCONCLUSIVE"

class ServiceStatus(str, Enum):
    COMPLETED = "COMPLETED"
    RATE_LIMITED = "RATE_LIMITED"
    NOT_CONFIGURED = "NOT_CONFIGURED"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"

class EvidenceCategory(str, Enum):
    THREAT_INTELLIGENCE = "THREAT_INTELLIGENCE"
    DOMAIN = "DOMAIN"
    URL_STRUCTURE = "URL_STRUCTURE"
    REDIRECTS = "REDIRECTS"
    TLS = "TLS"
    BRAND_IMPERSONATION = "BRAND_IMPERSONATION"
    MESSAGE_SOCIAL_ENGINEERING = "MESSAGE_SOCIAL_ENGINEERING"

class EvidenceItem(BaseModel):
    category: EvidenceCategory
    severity: str = Field(..., description="INFO, LOW, MEDIUM, HIGH, CRITICAL")
    source: str = Field(..., description="Name of check/tool (e.g., VirusTotal, URLScan, WHOIS, TLS, Local Rules)")
    title: str
    description: str
    interpretation: str
    source_url: Optional[str] = None

class ApiStatusReport(BaseModel):
    service: str
    status: ServiceStatus
    message: str
    details: Optional[Dict[str, Any]] = None

class ScoreContribution(BaseModel):
    category: str
    points: int
    title: str

class RiskDetails(BaseModel):
    level: RiskLevel
    score: int
    confidence: str  # "HIGH", "MEDIUM", "LOW"
    positive_signals_count: int
    risk_signals_count: int
    critical_signals_count: int
    unavailable_checks_count: int
    score_breakdown: List[ScoreContribution]

class HttpTelemetry(BaseModel):
    status_code: Optional[int] = None
    server: Optional[str] = None
    content_type: Optional[str] = None
    response_time_ms: Optional[int] = None

class UrlStructureCheck(BaseModel):
    name: str
    status: str  # "PASS", "WARNING", "FAIL", "UNKNOWN"
    description: str

class ExecutionStep(BaseModel):
    name: str
    status: str  # "COMPLETED", "SKIPPED", "FAILED"
    timestamp: str
    duration_ms: Optional[int] = None

class VendorEngineResult(BaseModel):
    engine: str
    category: str  # "clean", "malicious", "suspicious", "undetected"

class UrlScanRequest(BaseModel):
    url: str = Field(..., description="Target URL to analyze")

class MessageScanRequest(BaseModel):
    message_text: str = Field(..., description="Suspicious SMS or text content to analyze")

class ScanResponse(BaseModel):
    scan_id: str
    input_type: str  # "url" or "message"
    target: str      # Target URL or sanitized message snippet
    risk_level: RiskLevel
    risk_score: int  # 0 to 100
    risk_details: Optional[RiskDetails] = None
    summary: str
    evidence: List[EvidenceItem]
    service_statuses: List[ApiStatusReport]
    why_this_result: List[str]
    recommendations: List[str]
    technical_details: Dict[str, Any]
    http_telemetry: Optional[HttpTelemetry] = None
    url_structure_checks: List[UrlStructureCheck] = []
    execution_timeline: List[ExecutionStep] = []
    limitations: List[str] = []
    created_at: datetime

class RecentScanItem(BaseModel):
    scan_id: str
    input_type: str
    target: str
    risk_level: RiskLevel
    risk_score: int
    created_at: datetime
