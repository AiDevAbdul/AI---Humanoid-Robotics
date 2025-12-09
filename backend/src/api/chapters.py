from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from ..database.base import get_db
from ..auth.security import get_current_active_user
from ..models.student import Student
from ..models.chapter import Chapter
from ..models.progress import Progress
from ..services.chapter_service import ChapterService

router = APIRouter()


@router.get("/", response_model=dict)
async def get_chapters(
    module: Optional[str] = Query(None, description="Filter by module (ros2, gazebo, nvidia_isaac, vla)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (beginner, intermediate, advanced)"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    limit: int = Query(20, ge=1, le=100, description="Number of results per page"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_active_user)
):
    """
    List all available chapters with filtering and pagination.
    """
    chapters, total = ChapterService.get_all_chapters(
        db, module=module, difficulty=difficulty, search=search, limit=limit, offset=offset
    )

    result_chapters = []
    for chapter in chapters:
        # Check if chapter is locked based on prerequisites
        is_locked = not ChapterService.get_chapter_prerequisites_status(db, chapter, current_student)

        # Get progress information
        progress = db.query(Progress).filter(
            and_(
                Progress.student_id == current_student.id,
                Progress.chapter_id == chapter.id
            )
        ).first()

        chapter_data = {
            "id": chapter.id,
            "title": chapter.title,
            "slug": chapter.slug,
            "module": chapter.module,
            "order": chapter.order,
            "difficulty": chapter.metadata.get("difficulty", "unknown"),
            "estimated_reading_time": chapter.metadata.get("estimated_reading_time", 0),
            "learning_objectives": chapter.metadata.get("learning_objectives", []),
            "prerequisites": chapter.prerequisites,
            "is_locked": is_locked,
            "progress": {
                "status": progress.status if progress else "not_started",
                "completion_percentage": progress.completion_percentage if progress else 0
            } if progress else {
                "status": "not_started",
                "completion_percentage": 0
            }
        }
        result_chapters.append(chapter_data)

    return {
        "chapters": result_chapters,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/{slug}", response_model=dict)
async def get_chapter_by_slug(
    slug: str,
    language: str = Query("en", description="Language code for content translation"),
    db: Session = Depends(get_db),
    current_student: Student = Depends(get_current_active_user)
):
    """
    Get detailed information about a specific chapter.
    """
    from ..models.progress import Progress
    from sqlalchemy import and_

    chapter_data = ChapterService.get_chapter_by_slug(db, slug, current_student, language)

    if not chapter_data:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # Check if chapter is locked based on prerequisites
    chapter = db.query(Chapter).filter(Chapter.slug == slug).first()
    is_locked = not ChapterService.get_chapter_prerequisites_status(db, chapter, current_student)

    if is_locked:
        raise HTTPException(status_code=403, detail="Prerequisites not met for this chapter")

    # If a specific language is requested, get the translated content
    if language != "en":
        from ..ai.translation_service import TranslationService
        translation_result = await TranslationService.get_translated_content(
            db, chapter.id, language
        )

        if translation_result and translation_result.get("is_translated"):
            # Update the content with the translated version
            chapter_data["content"]["text"] = translation_result["translated_content"]
            chapter_data["language"] = language
            chapter_data["translation_info"] = {
                "original_language": "en",
                "target_language": language,
                "translated": True,
                "message": translation_result.get("message", "")
            }

    return chapter_data