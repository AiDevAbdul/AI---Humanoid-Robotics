from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.chapter import Chapter
from ..models.course_module import CourseModule
from ..models.progress import Progress
from ..models.student import Student


class ChapterService:
    @staticmethod
    def get_all_chapters(
        db: Session,
        module: Optional[str] = None,
        difficulty: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> tuple[List[Chapter], int]:
        """
        Get all chapters with filtering and pagination
        Returns (chapters, total_count)
        """
        query = db.query(Chapter)

        # Apply filters
        if module:
            query = query.filter(Chapter.module == module)
        if difficulty:
            # Assuming difficulty is in metadata
            query = query.filter(Chapter.metadata['difficulty'].astext == difficulty)
        if search:
            query = query.filter(
                Chapter.title.contains(search) |
                Chapter.content['text'].astext.contains(search)
            )

        # Get total count
        total = query.count()

        # Apply pagination
        chapters = query.order_by(Chapter.order).offset(offset).limit(limit).all()

        return chapters, total

    @staticmethod
    def get_chapter_by_slug(db: Session, slug: str, student: Optional[Student] = None, language: str = "en") -> Optional[dict]:
        """
        Get a chapter by slug with additional information
        """
        chapter = db.query(Chapter).filter(Chapter.slug == slug).first()
        if not chapter:
            return None

        # Get the content based on the requested language
        content = chapter.content.copy()

        # If a specific language is requested and translations exist, use the translated content
        if language != "en" and "translations" in content:
            translated_content = content["translations"].get(language)
            if translated_content:
                content["text"] = translated_content

        # Convert to dict with additional progress information if student is provided
        chapter_dict = {
            "id": chapter.id,
            "title": chapter.title,
            "slug": chapter.slug,
            "module": chapter.module,
            "order": chapter.order,
            "content": content,
            "interactive_elements": chapter.interactive_elements,
            "metadata": chapter.metadata,
            "prerequisites": chapter.prerequisites,
            "created_at": chapter.created_at.isoformat() if chapter.created_at else None,
            "updated_at": chapter.updated_at.isoformat() if chapter.updated_at else None
        }

        # Add progress information if student is provided
        if student:
            progress = db.query(Progress).filter(
                and_(
                    Progress.student_id == student.id,
                    Progress.chapter_id == chapter.id
                )
            ).first()

            chapter_dict["progress"] = {
                "status": progress.status if progress else "not_started",
                "completion_percentage": progress.completion_percentage if progress else 0,
                "time_spent": progress.time_spent if progress else 0,
                "scores": progress.scores if progress else {},
            }
        else:
            chapter_dict["progress"] = {
                "status": "not_started",
                "completion_percentage": 0,
                "time_spent": 0,
                "scores": {},
            }

        return chapter_dict

    @staticmethod
    def get_chapter_prerequisites_status(db: Session, chapter: Chapter, student: Student) -> bool:
        """
        Check if student has completed all prerequisites for a chapter
        """
        if not chapter.prerequisites:
            return True  # No prerequisites required

        # Check if student has completed all prerequisite chapters
        completed_prerequisites = db.query(Progress).filter(
            and_(
                Progress.student_id == student.id,
                Progress.chapter_id.in_(chapter.prerequisites),
                Progress.status == "completed"
            )
        ).count()

        return completed_prerequisites == len(chapter.prerequisites)