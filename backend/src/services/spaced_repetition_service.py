from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from ..models.chapter import Chapter
from ..models.progress import Progress
from ..models.student import Student
import math


class SpacedRepetitionService:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
        # SM-2 algorithm parameters
        self.REMEMBRANCE_FACTORS = [2.5, 2.0, 1.7, 1.5, 1.3, 1.3, 1.3]  # For grades 0-6
        self.DEFAULT_EASE_FACTOR = 2.5
        self.DEFAULT_INTERVAL = 1  # days

    async def calculate_review_schedule(self, student_id: str) -> List[Dict[str, Any]]:
        """
        Calculate personalized review schedule for a student using SM-2 algorithm.

        Args:
            student_id: The ID of the student

        Returns:
            List of chapters scheduled for review with timing information
        """
        # Get student's progress records
        progress_result = await self.db_session.execute(
            select(Progress).where(
                Progress.student_id == student_id,
                Progress.status == "completed"
            )
        )
        progress_records = progress_result.scalars().all()

        review_schedule = []
        for progress in progress_records:
            # Calculate next review date using SM-2 algorithm
            next_review = self._calculate_next_review_date(
                progress,
                progress.scores.get("overall_score", 75)  # Convert score to SM-2 grade
            )

            # Only include chapters that are due for review
            if next_review <= datetime.utcnow():
                chapter_result = await self.db_session.execute(
                    select(Chapter.title, Chapter.slug).where(Chapter.id == progress.chapter_id)
                )
                chapter = chapter_result.first()

                if chapter:
                    review_schedule.append({
                        "chapter_id": progress.chapter_id,
                        "chapter_title": chapter[0],
                        "chapter_slug": chapter[1],
                        "last_reviewed": progress.completed_at,
                        "next_review": next_review,
                        "current_interval": progress.personalized_path.get("interval", 1) if progress.personalized_path else 1,
                        "ease_factor": progress.personalized_path.get("ease_factor", self.DEFAULT_EASE_FACTOR) if progress.personalized_path else self.DEFAULT_EASE_FACTOR,
                        "review_urgency": self._calculate_urgency(next_review)
                    })

        # Sort by urgency (due date)
        review_schedule.sort(key=lambda x: x["next_review"])
        return review_schedule

    async def update_review_status(self, student_id: str, chapter_id: str, quality: int) -> Dict[str, Any]:
        """
        Update review status after a student reviews a chapter.

        Args:
            student_id: The ID of the student
            chapter_id: The ID of the chapter being reviewed
            quality: Quality rating of the review (0-5 scale)

        Returns:
            Updated schedule information
        """
        # Get the progress record
        progress_result = await self.db_session.execute(
            select(Progress).where(
                and_(
                    Progress.student_id == student_id,
                    Progress.chapter_id == chapter_id
                )
            )
        )
        progress = progress_result.scalar_one_or_none()

        if not progress:
            raise ValueError(f"No progress record found for student {student_id} and chapter {chapter_id}")

        # Convert quality rating to SM-2 grade (0-5 to 0-6)
        sm2_grade = min(quality + 1, 6)  # Add 1 to map 0-5 to 1-6, cap at 6

        # Update the interval and ease factor using SM-2 algorithm
        new_interval, new_ease_factor = self._update_sm2_parameters(
            progress,
            sm2_grade
        )

        # Update the progress record with new spaced repetition data
        if progress.personalized_path is None:
            progress.personalized_path = {}

        progress.personalized_path.update({
            "interval": new_interval,
            "ease_factor": new_ease_factor,
            "last_reviewed": datetime.utcnow().isoformat(),
            "repetition_number": progress.personalized_path.get("repetition_number", 0) + 1
        })

        # Update scores if provided
        if "review_scores" not in progress.scores:
            progress.scores["review_scores"] = []
        progress.scores["review_scores"].append({
            "date": datetime.utcnow().isoformat(),
            "quality": quality,
            "interval": new_interval
        })

        # Calculate next review date
        next_review = datetime.utcnow() + timedelta(days=new_interval)

        return {
            "chapter_id": chapter_id,
            "quality": quality,
            "new_interval": new_interval,
            "new_ease_factor": new_ease_factor,
            "next_review": next_review,
            "message": f"Review recorded. Next review scheduled for {next_review.strftime('%Y-%m-%d')}"
        }

    async def get_review_recommendations(self, student_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get personalized review recommendations for a student.

        Args:
            student_id: The ID of the student
            limit: Maximum number of recommendations to return

        Returns:
            List of recommended chapters for review
        """
        review_schedule = await self.calculate_review_schedule(student_id)
        return review_schedule[:limit]

    async def schedule_maintenance_review(self, student_id: str, days_ahead: int = 7) -> List[Dict[str, Any]]:
        """
        Schedule maintenance reviews for content learned in the past.

        Args:
            student_id: The ID of the student
            days_ahead: How many days ahead to schedule reviews

        Returns:
            List of maintenance review schedules
        """
        future_date = datetime.utcnow() + timedelta(days=days_ahead)

        # Get completed chapters that will need review in the next 'days_ahead' days
        progress_result = await self.db_session.execute(
            select(Progress).where(
                and_(
                    Progress.student_id == student_id,
                    Progress.status == "completed",
                    Progress.completed_at <= datetime.utcnow() - timedelta(days=1)  # Exclude today's completions
                )
            )
        )
        progress_records = progress_result.scalars().all()

        maintenance_reviews = []
        for progress in progress_records:
            next_review = self._calculate_next_review_date(
                progress,
                progress.scores.get("overall_score", 75)
            )

            if datetime.utcnow() <= next_review <= future_date:
                chapter_result = await self.db_session.execute(
                    select(Chapter.title, Chapter.slug).where(Chapter.id == progress.chapter_id)
                )
                chapter = chapter_result.first()

                if chapter:
                    maintenance_reviews.append({
                        "chapter_id": progress.chapter_id,
                        "chapter_title": chapter[0],
                        "chapter_slug": chapter[1],
                        "scheduled_review": next_review,
                        "days_until_review": (next_review - datetime.utcnow()).days
                    })

        return sorted(maintenance_reviews, key=lambda x: x["scheduled_review"])

    def _calculate_next_review_date(self, progress: Progress, quality_score: int) -> datetime:
        """
        Calculate the next review date using SM-2 algorithm.
        """
        # Convert quality score (0-100) to SM-2 grade (0-6)
        sm2_grade = self._convert_score_to_grade(quality_score)

        # Get current parameters or use defaults
        current_interval = progress.personalized_path.get("interval", self.DEFAULT_INTERVAL) if progress.personalized_path else self.DEFAULT_INTERVAL
        current_ease_factor = progress.personalized_path.get("ease_factor", self.DEFAULT_EASE_FACTOR) if progress.personalized_path else self.DEFAULT_EASE_FACTOR

        # Apply SM-2 algorithm
        if sm2_grade < 3:  # If quality is below 3, restart the sequence
            new_interval = 1
            new_ease_factor = current_ease_factor
        else:
            if current_interval == 1:
                new_interval = 6  # First review after initial learning
            elif current_interval == 6:
                new_interval = 12  # Second review
            else:
                # Calculate new interval based on ease factor
                new_interval = round(current_interval * current_ease_factor)

            # Update ease factor based on quality
            new_ease_factor = max(1.3, current_ease_factor + 0.1 - (5 - sm2_grade) * (0.08 + (5 - sm2_grade) * 0.02))

        # Calculate next review date
        last_review = progress.completed_at or progress.updated_at or datetime.utcnow()
        next_review = last_review + timedelta(days=new_interval)

        return next_review

    def _update_sm2_parameters(self, progress: Progress, quality: int) -> Tuple[int, float]:
        """
        Update interval and ease factor based on SM-2 algorithm.
        """
        current_interval = progress.personalized_path.get("interval", self.DEFAULT_INTERVAL) if progress.personalized_path else self.DEFAULT_INTERVAL
        current_ease_factor = progress.personalized_path.get("ease_factor", self.DEFAULT_EASE_FACTOR) if progress.personalized_path else self.DEFAULT_EASE_FACTOR

        if quality < 3:  # Quality is low, start over
            new_interval = 1
            new_ease_factor = max(1.3, current_ease_factor - 0.2)
        else:
            if current_interval == 1:
                new_interval = 6  # First review after initial learning
            elif current_interval == 6:
                new_interval = 12  # Second review
            else:
                # Calculate new interval using ease factor
                new_interval = round(current_interval * current_ease_factor)

            # Adjust ease factor based on quality
            quality_modifier = (quality - 2) * 0.15  # Adjust based on quality (higher quality = higher EF)
            new_ease_factor = max(1.3, current_ease_factor + quality_modifier)

        return new_interval, new_ease_factor

    def _convert_score_to_grade(self, score: int) -> int:
        """
        Convert a score (0-100) to an SM-2 grade (0-6).
        """
        if score >= 95:
            return 6
        elif score >= 85:
            return 5
        elif score >= 75:
            return 4
        elif score >= 65:
            return 3
        elif score >= 50:
            return 2
        elif score >= 25:
            return 1
        else:
            return 0

    def _calculate_urgency(self, next_review: datetime) -> str:
        """
        Calculate urgency level for a review.
        """
        days_until = (next_review - datetime.utcnow()).days

        if days_until <= 0:
            return "urgent"
        elif days_until <= 1:
            return "high"
        elif days_until <= 3:
            return "medium"
        elif days_until <= 7:
            return "low"
        else:
            return "planning"

    async def generate_personalized_review_plan(self, student_id: str, time_horizon_days: int = 30) -> Dict[str, Any]:
        """
        Generate a comprehensive personalized review plan for a student.

        Args:
            student_id: The ID of the student
            time_horizon_days: Number of days to plan for

        Returns:
            Comprehensive review plan
        """
        end_date = datetime.utcnow() + timedelta(days=time_horizon_days)

        # Get all review schedules
        all_reviews = await self.calculate_review_schedule(student_id)

        # Filter for the time horizon
        scheduled_reviews = [
            review for review in all_reviews
            if datetime.utcnow() <= review["next_review"] <= end_date
        ]

        # Group by urgency
        urgent_reviews = [r for r in scheduled_reviews if r["review_urgency"] == "urgent"]
        high_priority_reviews = [r for r in scheduled_reviews if r["review_urgency"] == "high"]
        medium_priority_reviews = [r for r in scheduled_reviews if r["review_urgency"] == "medium"]
        low_priority_reviews = [r for r in scheduled_reviews if r["review_urgency"] == "low"]

        # Calculate statistics
        total_scheduled = len(scheduled_reviews)
        days_with_reviews = len(set(review["next_review"].date() for review in scheduled_reviews))

        return {
            "student_id": student_id,
            "time_horizon": time_horizon_days,
            "total_scheduled_reviews": total_scheduled,
            "days_with_reviews": days_with_reviews,
            "daily_average": round(total_scheduled / time_horizon_days, 2) if time_horizon_days > 0 else 0,
            "urgent_reviews": len(urgent_reviews),
            "high_priority_reviews": len(high_priority_reviews),
            "medium_priority_reviews": len(medium_priority_reviews),
            "low_priority_reviews": len(low_priority_reviews),
            "review_schedule": scheduled_reviews,
            "recommendations": self._generate_recommendations(scheduled_reviews)
        }

    def _generate_recommendations(self, scheduled_reviews: List[Dict[str, Any]]) -> List[str]:
        """
        Generate personalized recommendations based on the review schedule.
        """
        recommendations = []

        if len(scheduled_reviews) == 0:
            recommendations.append("No reviews are currently scheduled. Continue with new content.")
        else:
            # Add recommendations based on distribution
            if len([r for r in scheduled_reviews if r["review_urgency"] == "urgent"]) > 3:
                recommendations.append("You have several urgent reviews. Prioritize these for optimal retention.")

            if len(scheduled_reviews) > 10:
                recommendations.append("Your review load is high. Consider spreading reviews over multiple days.")

        return recommendations