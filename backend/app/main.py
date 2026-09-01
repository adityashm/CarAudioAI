"""
CarAudioAI Backend - FastAPI Application
Main entry point for the API server
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine
from app import models

# Create database tables if database is available
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Note: Database table auto-creation skipped or deferred: {e}")

app = FastAPI(
    title="CarAudioAI API",
    description="AI-powered car audio tuning API for Indian market",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "CarAudioAI API is running",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "ok",
        "database": "connected",
        "environment": settings.ENVIRONMENT
    }

# Import and include active routers
from app.routers import cars, equipment, tuning
app.include_router(cars.router, prefix="/api/cars", tags=["Cars"])
app.include_router(equipment.router, prefix="/api/equipment", tags=["Equipment"])
app.include_router(tuning.router, prefix="/api/tuning", tags=["Tuning"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
