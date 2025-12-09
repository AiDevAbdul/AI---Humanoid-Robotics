from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from ..database.base import get_db
from ..auth.security import get_current_active_user
from ..models.student import Student
from ..services.badge_service import BadgeService

router = APIRouter()


@router.get("/badges")
async def get_student_badges(
    current_student: Student = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get available and earned badges for the current user.
    """
    badges_result = BadgeService.get_available_badges(
        db,
        str(current_student.id)
    )

    return badges_result


@router.get("/leaderboard")
async def get_leaderboard(
    period: str = "all_time",  # Options: weekly, monthly, all_time
    limit: int = 10,
    current_student: Student = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get leaderboard information.
    """
    # This is a simplified implementation
    # In a real implementation, this would calculate scores based on points/badges
    leaderboard = []

    # For now, return a mock response
    # In a real implementation, this would query the database for top students
    # based on their points, completed chapters, etc.

    mock_leaderboard = [
        {
            "rank": 1,
            "username": "top_student",
            "total_points": 1500,
            "completed_chapters": 25,
            "current_streak": 14
        },
        {
            "rank": 2,
            "username": "second_student",
            "total_points": 1200,
            "completed_chapters": 22,
            "current_streak": 10
        },
        {
            "rank": 3,
            "username": "third_student",
            "total_points": 1000,
            "completed_chapters": 20,
            "current_streak": 7
        }
    ][:limit]

    # Get user's rank if they're on the leaderboard
    user_rank = None
    for entry in mock_leaderboard:
        if entry["username"] == current_student.username:
            user_rank = {
                "rank": entry["rank"],
                "points": entry["total_points"],
                "progress": 100  # This would be calculated in a real implementation
            }
            break

    if not user_rank:
        # If user is not in the top N, they're not on the leaderboard
        user_rank = {
            "rank": None,
            "points": 0,  # Would be calculated in real implementation
            "progress": 0  # Would be calculated in real implementation
        }

    return {
        "leaderboard": mock_leaderboard,
        "user_rank": user_rank
    }