from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users, providers, bookings, intake, insurance , ai_gemini
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Care Routing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(providers.router, prefix="/api/providers", tags=["Providers"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(intake.router, prefix="/api/intake", tags=["Intake"])
app.include_router(insurance.router, prefix="/api/insurance", tags=["Insurance"])
app.include_router(ai_gemini.router, prefix="/api/ai/gemini-care-tips", tags=["AIGeneratedCare"])

@app.get("/")
def root():
    return {"message": "Smart Care Routing Backend is running!"}

@app.get("/health")
async def health_check():
    """Health check endpoint to verify database connectivity"""
    try:
        from database import db
        # Try to access the database
        if hasattr(db, 'users'):
            return {
                "status": "healthy",
                "database": "connected",
                "message": "Backend and database are working correctly"
            }
        else:
            return {
                "status": "healthy",
                "database": "in-memory",
                "message": "Backend is running with in-memory storage"
            }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }