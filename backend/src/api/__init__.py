"""
API module for the Physical AI & Humanoid Robotics Textbook application
"""
from fastapi import APIRouter

# Main API router
api_router = APIRouter()

# Import and include all sub-routers
from . import auth, users, chapters, progress, ai, gamification, translation

# Include all routers
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(chapters.router, prefix="/chapters", tags=["chapters"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])
api_router.include_router(translation.router, prefix="/translation", tags=["translation"])