from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import init_db
from backend.routes.url import router as url_router
from backend.routes.message import router as message_router
from backend.routes.scans import router as scans_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real-Time Evidence-Based Scam and Phishing Threat Analysis Platform"
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

app.include_router(url_router, prefix=settings.API_V1_STR, tags=["URL Scanner"])
app.include_router(message_router, prefix=settings.API_V1_STR, tags=["Message Scanner"])
app.include_router(scans_router, prefix=settings.API_V1_STR, tags=["Scan History"])

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "tagline": "Detect. Verify. Stay Safe.",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
