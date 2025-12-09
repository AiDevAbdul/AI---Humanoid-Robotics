from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from ..models.badge import Badge
from ..models.student_badge import StudentBadge
from ..models.student import Student
from ..models.progress import Progress


class BadgeService:
    @staticmethod
    def get_available_badges(db: Session, student_id: str) -> Dict[str, Any]:
        """
        Get available and earned badges for the current user
        """
        # Get all badges
        all_badges = db.query(Badge).all()

        # Get badges earned by the student
        student_badges = db.query(StudentBadge).filter(
            StudentBadge.student_id == student_id
        ).all()

        # Create a set of badge IDs that the student has earned
        earned_badge_ids = {str(sb.badge_id) for sb in student_badges}

        # Format badges
        available_badges = []
        for badge in all_badges:
            is_earned = str(badge.id) in earned_badge_ids
            student_badge = next((sb for sb in student_badges if str(sb.badge_id) == str(badge.id)), None)

            badge_info = {
                "id": str(badge.id),
                "name": badge.name,
                "slug": badge.slug,
                "description": badge.description,
                "icon": badge.icon,
                "category": badge.category,
                "points_value": badge.points_value,
                "criteria": badge.criteria,
                "is_earned": is_earned,
                "earned_at": student_badge.earned_at if student_badge else None
            }
            available_badges.append(badge_info)

        # Calculate total points
        total_points = sum(sb.points_value for sb in student_badges)

        # Get recent achievements (badges earned in the last 10)
        recent_achievements = []
        for sb in student_badges[-10:]:  # Last 10 badges earned
            badge = db.query(Badge).filter(Badge.id == sb.badge_id).first()
            if badge:
                recent_achievements.append({
                    "badge_name": badge.name,
                    "earned_at": sb.earned_at,
                    "points_earned": badge.points_value
                })

        return {
            "available_badges": available_badges,
            "total_points": total_points,
            "recent_achievements": recent_achievements
        }

    @staticmethod
    def award_badge(db: Session, student_id: str, badge_slug: str) -> bool:
        """
        Award a badge to a student if they meet the criteria
        """
        # Get the badge by slug
        badge = db.query(Badge).filter(Badge.slug == badge_slug).first()
        if not badge:
            return False

        # Check if student already has this badge
        existing = db.query(StudentBadge).filter(
            and_(
                StudentBadge.student_id == student_id,
                StudentBadge.badge_id == badge.id
            )
        ).first()

        if existing:
            # Student already has this badge
            return False

        # Check if student meets criteria (simplified - in reality this would be more complex)
        # For now, we'll just check if they have completed a certain number of chapters
        if badge.criteria.get("type") == "chapter_completion":
            required_count = badge.criteria.get("requirement", {}).get("count", 1)
            completed_chapters = db.query(Progress).filter(
                and_(
                    Progress.student_id == student_id,
                    Progress.status == "completed"
                )
            ).count()

            if completed_chapters < required_count:
                return False  # Student doesn't meet criteria

        # Award the badge
        student_badge = StudentBadge(
            student_id=student_id,
            badge_id=badge.id,
            earned_at=datetime.utcnow().isoformat(),
            evidence={}  # Could include proof of achievement
        )

        db.add(student_badge)
        db.commit()

        return True

    @staticmethod
    def check_and_award_achievements(db: Session, student_id: str, event: str, data: Dict = None) -> List[Badge]:
        """
        Check if any badges should be awarded based on an event
        """
        awarded_badges = []

        # Get all badges that might be awarded for this event
        potential_badges = db.query(Badge).filter(
            Badge.criteria["type"].astext == event
        ).all()

        for badge in potential_badges:
            # Check if criteria are met
            criteria = badge.criteria
            if BadgeService._check_criteria_met(db, student_id, criteria, data):
                # Award the badge if student doesn't already have it
                success = BadgeService.award_badge(db, student_id, badge.slug)
                if success:
                    awarded_badges.append(badge)

        return awarded_badges

    @staticmethod
    def _check_criteria_met(db: Session, student_id: str, criteria: Dict, data: Dict = None) -> bool:
        """
        Check if badge criteria are met
        """
        criteria_type = criteria.get("type")
        requirement = criteria.get("requirement", {})

        if criteria_type == "chapter_completion":
            required_count = requirement.get("count", 1)
            completed_chapters = db.query(Progress).filter(
                and_(
                    Progress.student_id == student_id,
                    Progress.status == "completed"
                )
            ).count()
            return completed_chapters >= required_count

        elif criteria_type == "quiz_score":
            min_score = requirement.get("min_score", 80)
            # Check if student has achieved this score on any quiz
            # This is simplified - in reality would check specific quiz data
            return True  # Placeholder

        elif criteria_type == "time_based":
            # Check if student has spent a certain amount of time
            min_time = requirement.get("min_minutes", 60)
            total_time = 0  # Calculate from progress records
            progress_records = db.query(Progress).filter(Progress.student_id == student_id).all()
            for progress in progress_records:
                total_time += progress.time_spent
            return (total_time / 60) >= min_time  # Convert seconds to minutes

        # Add more criteria types as needed
        return False