"""
DataShield – Python NLP Engine
FastAPI entry point: mounts routers and configures middleware.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging

from routers import analyze, scan as scan_router

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s – %(message)s",
)
logger = logging.getLogger("datashield")

# ─── App Factory ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="DataShield NLP Engine",
    description="High-performance privacy analysis API powering DataShield.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React dev
        "http://localhost:5000",   # Node gateway
        "https://datashield.app",  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request Timing Middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000, 2)
    response.headers["X-Process-Time-Ms"] = str(duration_ms)
    logger.info(f"{request.method} {request.url.path}  →  {response.status_code}  ({duration_ms}ms)")
    return response

# ─── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal engine error", "detail": str(exc)},
    )

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(analyze.router, prefix="/analyze", tags=["Analysis"])
app.include_router(scan_router.router, prefix="/scan",   tags=["Scan"])

# ─── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health():
    return {
        "status": "online",
        "service": "DataShield NLP Engine",
        "version": "1.0.0",
    }

# ─── Run ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")