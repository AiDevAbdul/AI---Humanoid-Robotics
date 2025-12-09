from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.progress import Progress
from ..models.student import Student
from ..models.chapter import Chapter


class ProgressService:
    @staticmethod
    def update_progress(
        db: Session,
        student_id: str,
        chapter_id: str,
        action: str,
        time_spent: int = 0,
        completion_percentage: int = 0,
        quiz_answers: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        Update progress for a specific chapter
        """
        # Get or create progress record
        progress = db.query(Progress).filter(
            and_(
                Progress.student_id == student_id,
                Progress.chapter_id == chapter_id
            )
        ).first()

        if not progress:
            # Create new progress record
            progress = Progress(
                student_id=student_id,
                chapter_id=chapter_id,
                status="in_progress",
                completion_percentage=completion_percentage,
                time_spent=time_spent,
                scores={"quiz_score": 0, "practical_score": 0, "overall_score": 0},
                attempts=1
            )
            db.add(progress)
        else:
            # Update existing progress
            progress.time_spent += time_spent
            progress.completion_percentage = max(progress.completion_percentage, completion_percentage)

            # Update status based on completion percentage
            if completion_percentage >= 100:
                progress.status = "completed"
                from datetime import datetime
                progress.completed_at = datetime.utcnow().isoformat()
            elif completion_percentage > 0:
                progress.status = "in_progress"
            else:
                progress.status = "not_started"

            # Update scores if quiz answers are provided
            if quiz_answers:
                # Calculate quiz score based on answers
                correct_answers = sum(1 for answer in quiz_answers if answer.get("is_correct", False))
                total_answers = len(quiz_answers)
                quiz_score = (correct_answers / total_answers * 100) if total_answers > 0 else 0

                # Update scores
                progress.scores["quiz_score"] = quiz_score
                # For now, set practical and overall scores to match quiz score
                # In a real implementation, these would be calculated separately
                progress.scores["practical_score"] = quiz_score
                progress.scores["overall_score"] = quiz_score

        db.commit()
        db.refresh(progress)

        return {
            "chapter_id": chapter_id,
            "status": progress.status,
            "completion_percentage": progress.completion_percentage,
            "time_spent": progress.time_spent,
            "scores": progress.scores,
            "updated_at": progress.updated_at.isoformat()
        }

    @staticmethod
    def get_student_progress(db: Session, student_id: str) -> Dict[str, Any]:
        """
        Get overall progress for the current user
        """
        # Get all progress records for the student
        all_progress = db.query(Progress).filter(Progress.student_id == student_id).all()

        # Calculate overall statistics
        total_chapters = len(all_progress)
        completed_chapters = sum(1 for p in all_progress if p.status == "completed")
        in_progress_chapters = sum(1 for p in all_progress if p.status == "in_progress")
        not_started_chapters = sum(1 for p in all_progress if p.status == "not_started")

        overall_completion = (completed_chapters / total_chapters * 100) if total_chapters > 0 else 0

        # Calculate total points (this would come from badges in a real implementation)
        total_points = 0  # This would be calculated from badges earned
        badges_earned = 0  # This would come from the badges system

        # Calculate current streak (simplified - in reality this would be more complex)
        current_streak = 0

        # Group progress by module
        module_progress = []
        # In a real implementation, we would group by actual modules
        # For now, we'll just return a mock structure

        # Get recent activity (last 5 activities)
        recent_activity = []
        # This would come from progress updates and other activities
        for p in all_progress[:5]:  # Last 5 progress updates
            chapter = db.query(Chapter).filter(Chapter.id == p.chapter_id).first()
            recent_activity.append({
                "type": "chapter_completed" if p.status == "completed" else "chapter_progressed",
                "description": f"Progress updated for {chapter.title if chapter else 'chapter'}",
                "timestamp": p.updated_at.isoformat() if p.updated_at else "",
                "chapter_title": chapter.title if chapter else ""
            })

        return {
            "overall_completion": overall_completion,
            "completed_chapters": completed_chapters,
            "total_chapters": total_chapters,
            "total_points": total_points,
            "badges_earned": badges_earned,
            "current_streak": current_streak,
            "module_progress": module_progress,
            "recent_activity": recent_activity
        }

    @staticmethod
    def get_chapter_progress(db: Session, student_id: str, chapter_id: str) -> Optional[Dict[str, Any]]:
        """
        Get progress for a specific chapter
        """
        progress = db.query(Progress).filter(
            and_(
                Progress.student_id == student_id,
                Progress.chapter_id == chapter_id
            )
        ).first()

        if not progress:
            return {
                "chapter_id": chapter_id,
                "status": "not_started",
                "completion_percentage": 0,
                "time_spent": 0,
                "scores": {"quiz_score": 0, "practical_score": 0, "overall_score": 0},
            }

        return {
            "chapter_id": chapter_id,
            "status": progress.status,
            "completion_percentage": progress.completion_percentage,
            "time_spent": progress.time_spent,
            "scores": progress.scores,
        }