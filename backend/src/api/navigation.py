from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from ..database.session import get_db
from ..services.prerequisite_service import PrerequisiteService
from ..models.chapter import Chapter
from ..models.progress import Progress
from ..utils.auth import get_current_student

router = APIRouter(prefix="/navigation", tags=["navigation"])


@router.get("/check-prerequisites/{chapter_id}")
async def check_prerequisites(
    chapter_id: str,
    current_student: Dict = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Check if a student meets the prerequisites for a specific chapter.
    """
    service = PrerequisiteService(db)
    result = await service.check_prerequisites(current_student["id"], chapter_id)

    if not result["has_access"] and result["missing_prerequisites"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Prerequisites not met",
                "missing_prerequisites": result["missing_prerequisites"]
            }
        )

    return result


@router.get("/learning-path")
async def get_learning_path(
    start_chapter_id: str = None,
    current_student: Dict = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get an adaptive learning path for the student.
    """
    service = PrerequisiteService(db)
    learning_path = await service.get_learning_path(
        current_student["id"],
        start_chapter_id
    )
    return learning_path


@router.get("/available-chapters")
async def get_available_chapters(
    current_student: Dict = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get a list of chapters the student is eligible to access.
    """
    service = PrerequisiteService(db)
    available_chapters = await service.get_available_chapters(current_student["id"])
    return available_chapters


@router.get("/chapter/{chapter_id}/next")
async def get_next_chapter(
    chapter_id: str,
    current_student: Dict = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get the next recommended chapter based on current progress and prerequisites.
    """
    service = PrerequisiteService(db)

    # First, check if the student has completed the current chapter
    progress_result = await db.execute(
        select(Progress).where(
            Progress.student_id == current_student["id"],
            Progress.chapter_id == chapter_id
        )
    )
    current_progress = progress_result.scalar_one_or_none()

    if not current_progress or current_progress.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must complete the current chapter before accessing the next one"
        )

    # Get all chapters to find the next one
    all_chapters_result = await db.execute(
        select(Chapter).order_by(Chapter.module, Chapter.order)
    )
    all_chapters = all_chapters_result.scalars().all()

    # Find the current chapter and get the next eligible one
    current_chapter = next((ch for ch in all_chapters if ch.id == chapter_id), None)
    if not current_chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Current chapter not found"
        )

    # Look for the next chapter that the student can access
    current_index = -1
    for i, chapter in enumerate(all_chapters):
        if chapter.id == chapter_id:
            current_index = i
            break

    if current_index != -1:
        for i in range(current_index + 1, len(all_chapters)):
            next_chapter = all_chapters[i]
            # Check if student meets prerequisites for this next chapter
            check_result = await service.check_prerequisites(
                current_student["id"],
                next_chapter.id
            )
            if check_result["has_access"]:
                return {
                    "id": next_chapter.id,
                    "title": next_chapter.title,
                    "slug": next_chapter.slug,
                    "module": next_chapter.module,
                    "order": next_chapter.order
                }

    # If no next chapter is available, return completion message
    return {
        "message": "No more chapters available. You have completed all accessible content."
    }


@router.get("/chapter/{chapter_id}/prerequisite-tree")
async def get_prerequisite_tree(
    chapter_id: str,
    current_student: Dict = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get the full prerequisite tree for a chapter, showing all required chapters
    and the student's completion status.
    """
    service = PrerequisiteService(db)

    # Get the target chapter
    chapter_result = await db.execute(
        select(Chapter).where(Chapter.id == chapter_id)
    )
    target_chapter = chapter_result.scalar_one_or_none()

    if not target_chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )

    # Get student's progress
    progress_result = await db.execute(
        select(Progress.chapter_id, Progress.status).where(
            Progress.student_id == current_student["id"]
        )
    )
    student_progress = {row[0]: row[1] for row in progress_result.fetchall()}

    # Build the prerequisite tree
    tree = await build_prerequisite_tree(
        chapter_id,
        db,
        student_progress,
        visited=set()
    )

    return {
        "target_chapter": {
            "id": target_chapter.id,
            "title": target_chapter.title,
            "slug": target_chapter.slug
        },
        "prerequisite_tree": tree,
        "can_access": len(tree.get("missing_prerequisites", [])) == 0
    }


async def build_prerequisite_tree(
    chapter_id: str,
    db: AsyncSession,
    student_progress: Dict,
    visited: set
) -> Dict[str, Any]:
    """
    Recursively build the prerequisite tree for a chapter.
    """
    if chapter_id in visited:
        # Circular dependency detected
        return {
            "id": chapter_id,
            "title": "Circular Dependency Detected",
            "status": "error",
            "prerequisites": [],
            "completed": False
        }

    visited.add(chapter_id)

    # Get chapter info
    chapter_result = await db.execute(
        select(Chapter).where(Chapter.id == chapter_id)
    )
    chapter = chapter_result.scalar_one_or_none()

    if not chapter:
        return {
            "id": chapter_id,
            "title": "Chapter Not Found",
            "status": "error",
            "prerequisites": [],
            "completed": False
        }

    # Check student's progress for this chapter
    chapter_status = student_progress.get(chapter_id, "not_started")
    is_completed = chapter_status == "completed"

    # Process prerequisites
    prereq_trees = []
    missing_prereqs = []
    all_prereqs_completed = True

    if chapter.prerequisites:
        for prereq_id in chapter.prerequisites:
            prereq_tree = await build_prerequisite_tree(
                prereq_id,
                db,
                student_progress,
                visited.copy()
            )
            prereq_trees.append(prereq_tree)

            if not prereq_tree.get("completed", False):
                all_prereqs_completed = False
                missing_prereqs.append({
                    "id": prereq_tree["id"],
                    "title": prereq_tree["title"]
                })

    return {
        "id": chapter.id,
        "title": chapter.title,
        "slug": chapter.slug,
        "status": chapter_status,
        "completed": is_completed,
        "prerequisites": prereq_trees,
        "all_prereqs_completed": all_prereqs_completed,
        "missing_prerequisites": missing_prereqs if not all_prereqs_completed else []
    }


@router.post("/validate-navigation")
async def validate_navigation(
    request: Dict[str, str],
    current_student: Dict = Depends(get_current_student),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Validate if a student can navigate to a specific chapter.
    """
    target_chapter_id = request.get("target_chapter_id")
    if not target_chapter_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_chapter_id is required"
        )

    service = PrerequisiteService(db)
    result = await service.check_prerequisites(
        current_student["id"],
        target_chapter_id
    )

    return {
        "can_navigate": result["has_access"],
        "validation_result": result
    }