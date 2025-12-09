from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.student import Student
from ..models.chapter import Chapter
from ..models.progress import Progress
from ..ai.openai_agent import OpenAIAgent


class PersonalizationService:
    @staticmethod
    async def get_personalized_content(
        db: Session,
        student: Student,
        chapter: Chapter,
        content_type: str = "text",
        current_difficulty: str = "beginner"
    ) -> Dict[str, Any]:
        """
        Get personalized content adaptation based on user profile using OpenAI
        """
        # Get student profile information
        student_profile = student.profile
        student_preferences = student.preferences

        # Determine content adaptation based on student profile
        original_content = chapter.content.get(content_type, chapter.content.get("text", ""))

        # Initialize OpenAI Agent
        agent = OpenAIAgent()

        # Use OpenAI to personalize the content
        adapted_content = await agent.personalize_content(
            content=original_content,
            student_profile=student_profile,
            difficulty_level=current_difficulty
        )

        # Adjust explanation level based on technical background
        explanation_level = "detailed"
        if student_profile.get("technical_background") == "advanced":
            explanation_level = "concise"
        elif student_profile.get("technical_background") == "intermediate":
            explanation_level = "moderate"

        # Create examples based on student's background
        examples = []
        if student_profile.get("technical_background") == "beginner":
            # For beginners, use more analogies and simplified examples
            examples.append({
                "type": "analogy",
                "content": f"As a beginner in {student_profile.get('primary_language', 'English')}, think of this concept like...",
                "complexity_level": "simplified"
            })
        else:
            # For advanced users, use more technical examples
            examples.append({
                "type": "code",
                "content": f"Here's a more advanced implementation in {student_profile.get('primary_language', 'English')}:",
                "complexity_level": "advanced" if student_profile.get("technical_background") == "advanced" else "standard"
            })

        # Determine difficulty adjustment
        difficulty_adjustment = "same"  # default
        if student_profile.get("technical_background") == "beginner":
            difficulty_adjustment = "easier"
        elif student_profile.get("technical_background") == "advanced":
            difficulty_adjustment = "harder"

        # Determine alternative learning paths based on prerequisites
        alternative_paths = []
        if chapter.prerequisites:
            completed_prereqs = db.query(Progress).filter(
                and_(
                    Progress.student_id == student.id,
                    Progress.chapter_id.in_(chapter.prerequisites),
                    Progress.status == "completed"
                )
            ).count()

            prereq_status = "adequate"
            if completed_prereqs < len(chapter.prerequisites):
                prereq_status = "review_needed"
            elif student_profile.get("technical_background") == "advanced":
                prereq_status = "advanced"

            alternative_paths.append({
                "title": "Prerequisite Review",
                "description": f"Based on your background, we recommend reviewing prerequisites",
                "prerequisite_level": prereq_status
            })

        return {
            "adapted_content": adapted_content,
            "explanation_level": explanation_level,
            "examples": examples,
            "difficulty_adjustment": difficulty_adjustment,
            "alternative_paths": alternative_paths
        }

    @staticmethod
    def adapt_content_difficulty(
        content: str,
        student_level: str,
        target_difficulty: str
    ) -> str:
        """
        Adapt content difficulty based on student level
        """
        # This is a simplified implementation
        # In a real implementation, this would use AI to modify the content
        if student_level == "beginner":
            # Add more explanations and examples
            return f"[BEGINNER-FRIENDLY VERSION] {content}"
        elif student_level == "advanced":
            # Add more technical depth
            return f"[ADVANCED VERSION] {content}"
        else:
            # Intermediate level - standard content
            return content