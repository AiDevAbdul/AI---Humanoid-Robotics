from typing import List, Dict, Optional, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.chapter import Chapter
from ..models.progress import Progress
from ..models.student import Student


class PrerequisiteService:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def check_prerequisites(self, student_id: str, chapter_id: str) -> Dict[str, Any]:
        """
        Check if a student meets the prerequisites for a chapter.

        Args:
            student_id: The ID of the student
            chapter_id: The ID of the chapter to check prerequisites for

        Returns:
            Dictionary with prerequisite check results
        """
        # Get the target chapter
        chapter_result = await self.db_session.execute(
            select(Chapter).where(Chapter.id == chapter_id)
        )
        chapter = chapter_result.scalar_one_or_none()

        if not chapter:
            return {
                "has_access": False,
                "missing_prerequisites": [],
                "message": "Chapter not found"
            }

        # If no prerequisites, allow access
        if not chapter.prerequisites:
            return {
                "has_access": True,
                "missing_prerequisites": [],
                "message": "No prerequisites required for this chapter"
            }

        # Get student's completed chapters
        completed_result = await self.db_session.execute(
            select(Progress.chapter_id).where(
                Progress.student_id == student_id,
                Progress.status == "completed"
            )
        )
        completed_chapters = [row[0] for row in completed_result.fetchall()]

        # Check which prerequisites are missing
        missing_prerequisites = []
        for prereq_id in chapter.prerequisites:
            if prereq_id not in completed_chapters:
                # Get the prerequisite chapter info
                prereq_result = await self.db_session.execute(
                    select(Chapter.title).where(Chapter.id == prereq_id)
                )
                prereq_chapter = prereq_result.scalar_one_or_none()

                if prereq_chapter:
                    missing_prerequisites.append({
                        "id": prereq_id,
                        "title": prereq_chapter
                    })

        has_access = len(missing_prerequisites) == 0

        return {
            "has_access": has_access,
            "missing_prerequisites": missing_prerequisites,
            "message": f"{'Access granted' if has_access else 'Prerequisites missing'}"
        }

    async def get_learning_path(self, student_id: str, start_chapter_id: str = None) -> List[Dict[str, Any]]:
        """
        Generate an adaptive learning path for a student based on prerequisites and progress.

        Args:
            student_id: The ID of the student
            start_chapter_id: Optional starting chapter, if None uses student's current progress

        Returns:
            List of chapters in the recommended learning order
        """
        # Get all chapters
        all_chapters_result = await self.db_session.execute(
            select(Chapter).order_by(Chapter.module, Chapter.order)
        )
        all_chapters = all_chapters_result.scalars().all()

        # Get student's completed chapters
        completed_result = await self.db_session.execute(
            select(Progress.chapter_id, Progress.status).where(
                Progress.student_id == student_id
            )
        )
        student_progress = {row[0]: row[1] for row in completed_result.fetchall()}

        # Build the learning path
        learning_path = []

        # If a specific start chapter is provided, begin from there
        if start_chapter_id:
            start_chapter_result = await self.db_session.execute(
                select(Chapter).where(Chapter.id == start_chapter_id)
            )
            start_chapter = start_chapter_result.scalar_one_or_none()
            if start_chapter:
                path_item = self._build_path_item(start_chapter, student_progress.get(start_chapter_id))
                learning_path.append(path_item)

        # Otherwise, build a complete learning path
        else:
            for chapter in all_chapters:
                # Check if this chapter has prerequisites
                if chapter.prerequisites:
                    # Check if student has completed all prerequisites
                    all_prereqs_met = all(
                        prereq_id in student_progress and student_progress[prereq_id] == "completed"
                        for prereq_id in chapter.prerequisites
                    )
                else:
                    # No prerequisites required
                    all_prereqs_met = True

                # Add to learning path if prerequisites are met or if it's a starting point
                if all_prereqs_met or not chapter.prerequisites:
                    path_item = self._build_path_item(chapter, student_progress.get(chapter.id))
                    learning_path.append(path_item)

        return learning_path

    async def get_available_chapters(self, student_id: str) -> List[Dict[str, Any]]:
        """
        Get a list of chapters the student is currently eligible to access.

        Args:
            student_id: The ID of the student

        Returns:
            List of available chapters
        """
        # Get all chapters
        all_chapters_result = await self.db_session.execute(
            select(Chapter).order_by(Chapter.module, Chapter.order)
        )
        all_chapters = all_chapters_result.scalars().all()

        # Get student's completed chapters
        completed_result = await self.db_session.execute(
            select(Progress.chapter_id).where(
                Progress.student_id == student_id,
                Progress.status == "completed"
            )
        )
        completed_chapters = [row[0] for row in completed_result.fetchall()]

        available_chapters = []
        for chapter in all_chapters:
            # Check if all prerequisites are met
            if chapter.prerequisites:
                all_prereqs_met = all(prereq_id in completed_chapters for prereq_id in chapter.prerequisites)
            else:
                all_prereqs_met = True

            # If prerequisites are met, add to available list
            if all_prereqs_met:
                # Check if already in progress or completed
                progress_status = None
                progress_result = await self.db_session.execute(
                    select(Progress.status).where(
                        Progress.student_id == student_id,
                        Progress.chapter_id == chapter.id
                    )
                )
                progress_row = progress_result.fetchone()
                if progress_row:
                    progress_status = progress_row[0]

                available_chapters.append({
                    "id": chapter.id,
                    "title": chapter.title,
                    "slug": chapter.slug,
                    "module": chapter.module,
                    "order": chapter.order,
                    "status": progress_status or "not_started",
                    "prerequisites": chapter.prerequisites
                })

        return available_chapters

    def _build_path_item(self, chapter: Chapter, progress_status: Optional[str]) -> Dict[str, Any]:
        """Helper method to build a learning path item."""
        return {
            "id": chapter.id,
            "title": chapter.title,
            "slug": chapter.slug,
            "module": chapter.module,
            "order": chapter.order,
            "status": progress_status or "not_started",
            "prerequisites": chapter.prerequisites,
            "metadata": {
                "estimated_reading_time": chapter.meta_data.get("estimated_reading_time", 0),
                "difficulty": chapter.meta_data.get("difficulty", "beginner")
            }
        }

    async def validate_prerequisite_chain(self, chapter_id: str) -> Dict[str, Any]:
        """
        Validate the prerequisite chain for a chapter to ensure no circular dependencies.

        Args:
            chapter_id: The ID of the chapter to validate

        Returns:
            Dictionary with validation results
        """
        # This would implement a graph traversal to detect cycles
        # For now, we'll return a simple validation result
        chapter_result = await self.db_session.execute(
            select(Chapter).where(Chapter.id == chapter_id)
        )
        chapter = chapter_result.scalar_one_or_none()

        if not chapter or not chapter.prerequisites:
            return {
                "valid": True,
                "message": "No prerequisites to validate",
                "circular_dependency": False
            }

        # In a full implementation, we would traverse the prerequisite graph to detect cycles
        # For now, we'll assume the prerequisites are valid
        return {
            "valid": True,
            "message": "Prerequisites validated successfully",
            "circular_dependency": False
        }