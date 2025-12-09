from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from ..database.base import get_db
from ..auth.security import get_current_active_user
from ..models.student import Student

router = APIRouter()


@router.get("/me")
async def get_current_user_profile(
    current_student: Student = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get current user's profile information.
    """
    # For now, return a simplified profile
    # In a real implementation, we would fetch from the database
    profile = {
        "id": str(current_student.id),
        "email": current_student.email,
        "username": current_student.username,
        "profile": current_student.profile,
        "preferences": current_student.preferences,
        "progress_stats": {
            "completed_chapters": 0,  # This would be calculated from progress data
            "total_points": 0,  # This would come from badges/progress
            "current_streak": 0  # This would be calculated
        },
        "created_at": current_student.created_at.isoformat(),
        "updated_at": current_student.updated_at.isoformat()
    }
    return profile


@router.put("/me")
async def update_user_profile(
    profile_data: dict,  # In a real implementation, this would be a Pydantic model
    current_student: Student = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update user profile information.
    """
    # Update the student's profile information
    if "profile" in profile_data:
        current_student.profile.update(profile_data["profile"])

    if "preferences" in profile_data:
        current_student.preferences.update(profile_data["preferences"])

    # Update the updated_at timestamp
    from datetime import datetime
    current_student.updated_at = datetime.utcnow()

    # Commit changes to database
    db.commit()
    db.refresh(current_student)

    return {
        "id": str(current_student.id),
        "email": current_student.email,
        "username": current_student.username,
        "profile": current_student.profile,
        "preferences": current_student.preferences,
        "updated_at": current_student.updated_at.isoformat()
    }