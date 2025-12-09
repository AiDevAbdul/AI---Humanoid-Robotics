from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, Dict
from ..database.base import get_db
from ..auth.security import get_current_active_user
from ..models.student import Student
from ..models.chapter import Chapter
from ..services.progress_service import ProgressService

router = APIRouter()


@router.post("/{chapter_id}")
async def update_progress(
    chapter_id: str,
    request_data: Dict,
    current_student: Student = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update progress for a specific chapter.
    """
    action = request_data.get("action", "continue")
    time_spent = request_data.get("time_spent", 0)
    completion_percentage = request_data.get("completion_percentage", 0)
    quiz_answers = request_data.get("quiz_answers", [])

    # Verify that the chapter exists
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # Update progress
    progress_result = ProgressService.update_progress(
        db,
        str(current_student.id),
        chapter_id,
        action,
        time_spent,
        completion_percentage,
        quiz_answers
    )

    return progress_result


@router.get("/")
async def get_student_progress(
    current_student: Student = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get overall progress for the current user.
    """
    progress_result = ProgressService.get_student_progress(
        db,
        str(current_student.id)
    )

    return progress_result