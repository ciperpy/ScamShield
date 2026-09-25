import os
from pathlib import Path
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR.parent / ".env")


class Settings:
    PROJECT_NAME: str = "ScamShield"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # External Security APIs
    VIRUSTOTAL_API_KEY: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    URLSCAN_API_KEY: str = os.getenv("URLSCAN_API_KEY", "")
    URLSCAN_VISIBILITY: str = os.getenv(
        "URLSCAN_VISIBILITY",
        "unlisted"
    )

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./scamshield.db"
    )

    # Security limits
    MAX_REDIRECT_HOPS: int = 10
    REDIRECT_TIMEOUT_SECONDS: float = 5.0


settings = Settings()