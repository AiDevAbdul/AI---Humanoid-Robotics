from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.chapter import Chapter
from ..models.progress import Progress
from ..models.student import Student
import re
import math


class MicrolearningService:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
        # Configuration for microlearning segmentation
        self.WORDS_PER_MINUTE = 200  # Average reading speed
        self.MICROLEARNING_DURATION = 5  # Target duration in minutes
        self.MAX_MICROLEARNING_SIZE = 1000  # Max characters per microlearning unit
        self.MIN_MICROLEARNING_SIZE = 200   # Min characters for a valid unit

    async def segment_chapter_for_microlearning(self, chapter_id: str) -> List[Dict[str, Any]]:
        """
        Segment a chapter into microlearning units based on content and learning principles.

        Args:
            chapter_id: The ID of the chapter to segment

        Returns:
            List of microlearning units with timing and content information
        """
        # Get the chapter content
        chapter_result = await self.db_session.execute(
            select(Chapter).where(Chapter.id == chapter_id)
        )
        chapter = chapter_result.scalar_one_or_none()

        if not chapter:
            raise ValueError(f"Chapter with ID {chapter_id} not found")

        # Get the chapter content (in a real implementation, this would come from the content management system)
        content = chapter.content.get("text", "") or chapter.content.get("html_content", "")

        if not content:
            return []

        # Segment the content into microlearning units
        microlearning_units = self._segment_content(content, chapter)

        # Add metadata and timing information
        for i, unit in enumerate(microlearning_units):
            unit["id"] = f"{chapter_id}_ml_{i+1}"
            unit["chapter_id"] = chapter_id
            unit["order"] = i + 1
            unit["estimated_duration"] = self._estimate_reading_time(unit["content"])
            unit["word_count"] = len(unit["content"].split())
            unit["character_count"] = len(unit["content"])

        return microlearning_units

    async def get_microlearning_path(self, student_id: str, chapter_id: str) -> List[Dict[str, Any]]:
        """
        Get a microlearning path for a student, including their progress.

        Args:
            student_id: The ID of the student
            chapter_id: The ID of the chapter

        Returns:
            List of microlearning units with student progress
        """
        # Get the microlearning units for the chapter
        microlearning_units = await self.segment_chapter_for_microlearning(chapter_id)

        # Get student's progress for this chapter
        progress_result = await self.db_session.execute(
            select(Progress).where(
                Progress.student_id == student_id,
                Progress.chapter_id == chapter_id
            )
        )
        progress = progress_result.scalar_one_or_none()

        # Add progress information to each unit
        for unit in microlearning_units:
            if progress and "microlearning_progress" in progress.personalized_path:
                unit_progress = progress.personalized_path["microlearning_progress"].get(unit["id"], {})
                unit["completed"] = unit_progress.get("completed", False)
                unit["completed_at"] = unit_progress.get("completed_at")
                unit["engagement_score"] = unit_progress.get("engagement_score", 0)
            else:
                unit["completed"] = False
                unit["engagement_score"] = 0

        return microlearning_units

    async def update_microlearning_progress(self, student_id: str, unit_id: str, action: str = "complete") -> Dict[str, Any]:
        """
        Update progress for a specific microlearning unit.

        Args:
            student_id: The ID of the student
            unit_id: The ID of the microlearning unit
            action: The action taken (complete, start, pause, etc.)

        Returns:
            Updated progress information
        """
        # Extract chapter_id from unit_id
        chapter_id = unit_id.split("_ml_")[0]

        # Get or create progress record
        progress_result = await self.db_session.execute(
            select(Progress).where(
                Progress.student_id == student_id,
                Progress.chapter_id == chapter_id
            )
        )
        progress = progress_result.scalar_one_or_none()

        if not progress:
            # Create a new progress record if it doesn't exist
            chapter_result = await self.db_session.execute(
                select(Chapter).where(Chapter.id == chapter_id)
            )
            chapter = chapter_result.scalar_one_or_none()

            if not chapter:
                raise ValueError(f"Chapter with ID {chapter_id} not found")

            from ..models.progress import Progress as ProgressModel
            progress = ProgressModel(
                student_id=student_id,
                chapter_id=chapter_id,
                status="in_progress",
                completion_percentage=0,
                time_spent=0,
                scores={"quiz_score": 0, "practical_score": 0, "overall_score": 0},
                attempts=1,
                personalized_path={
                    "microlearning_progress": {},
                    "current_unit": unit_id
                }
            )
            self.db_session.add(progress)
        else:
            # Update existing progress
            if "microlearning_progress" not in progress.personalized_path:
                progress.personalized_path["microlearning_progress"] = {}

        # Update the specific unit progress
        microlearning_progress = progress.personalized_path["microlearning_progress"]

        if action == "complete":
            microlearning_progress[unit_id] = {
                "completed": True,
                "completed_at": datetime.utcnow().isoformat(),
                "engagement_score": 5,  # Default engagement score
                "time_spent": 300  # Default 5 minutes
            }
        elif action == "start":
            if unit_id not in microlearning_progress:
                microlearning_progress[unit_id] = {
                    "started": True,
                    "started_at": datetime.utcnow().isoformat()
                }
        elif action == "pause":
            if unit_id in microlearning_progress:
                microlearning_progress[unit_id]["paused"] = True
                microlearning_progress[unit_id]["paused_at"] = datetime.utcnow().isoformat()

        # Update current unit
        progress.personalized_path["current_unit"] = unit_id

        # Calculate overall chapter progress based on microlearning completion
        all_units = await self.segment_chapter_for_microlearning(chapter_id)
        completed_units = sum(1 for unit_id in microlearning_progress.keys()
                             if microlearning_progress[unit_id].get("completed", False))

        progress.completion_percentage = min(100, int((completed_units / len(all_units)) * 100))

        if progress.completion_percentage == 100:
            progress.status = "completed"
            progress.completed_at = datetime.utcnow()

        return {
            "unit_id": unit_id,
            "chapter_id": chapter_id,
            "action": action,
            "progress_updated": True,
            "completion_percentage": progress.completion_percentage,
            "message": f"Microlearning unit {action}d successfully"
        }

    async def get_microlearning_recommendations(self, student_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get personalized microlearning recommendations for a student.

        Args:
            student_id: The ID of the student
            limit: Maximum number of recommendations to return

        Returns:
            List of recommended microlearning units
        """
        # Get all chapters the student is enrolled in or has started
        progress_result = await self.db_session.execute(
            select(Progress).where(Progress.student_id == student_id)
        )
        student_progress = progress_result.scalars().all()

        recommendations = []
        for progress in student_progress:
            # Get microlearning units for this chapter
            units = await self.get_microlearning_path(student_id, progress.chapter_id)

            # Find incomplete units
            incomplete_units = [unit for unit in units if not unit["completed"]]

            # Add to recommendations
            for unit in incomplete_units[:2]:  # Add up to 2 units per chapter
                recommendations.append({
                    "unit_id": unit["id"],
                    "chapter_id": unit["chapter_id"],
                    "title": f"{unit['title']} - Part {unit['order']}",
                    "estimated_duration": unit["estimated_duration"],
                    "word_count": unit["word_count"],
                    "engagement_score": unit["engagement_score"],
                    "chapter_title": await self._get_chapter_title(unit["chapter_id"])
                })

        # Sort by engagement score (descending) and return limited results
        recommendations.sort(key=lambda x: x["engagement_score"], reverse=True)
        return recommendations[:limit]

    def _segment_content(self, content: str, chapter: Chapter) -> List[Dict[str, Any]]:
        """
        Segment the chapter content into microlearning units.

        Args:
            content: The raw content to segment
            chapter: The chapter object for metadata

        Returns:
            List of segmented microlearning units
        """
        units = []

        # Try to segment based on semantic boundaries first (headings, sections)
        semantic_units = self._segment_by_semantics(content)

        if semantic_units:
            # If we found semantic boundaries, use those as primary segments
            for i, unit_content in enumerate(semantic_units):
                if len(unit_content.strip()) >= self.MIN_MICROLEARNING_SIZE:
                    units.append({
                        "title": f"{chapter.title} - Segment {i+1}",
                        "content": unit_content.strip(),
                        "segment_type": "semantic",
                        "context": {
                            "chapter_title": chapter.title,
                            "module": chapter.module,
                            "order": i + 1
                        }
                    })
        else:
            # If no semantic boundaries, segment by length
            length_based_units = self._segment_by_length(content)
            for i, unit_content in enumerate(length_based_units):
                units.append({
                    "title": f"{chapter.title} - Micro Unit {i+1}",
                    "content": unit_content.strip(),
                    "segment_type": "length_based",
                    "context": {
                        "chapter_title": chapter.title,
                        "module": chapter.module,
                        "order": i + 1
                    }
                })

        # Further subdivide if any units are too long
        refined_units = []
        for unit in units:
            if len(unit["content"]) > self.MAX_MICROLEARNING_SIZE:
                sub_units = self._break_down_unit(unit)
                refined_units.extend(sub_units)
            else:
                refined_units.append(unit)

        return refined_units

    def _segment_by_semantics(self, content: str) -> List[str]:
        """
        Segment content based on semantic boundaries like headings.
        """
        # Look for common heading patterns in markdown/html
        heading_patterns = [
            r'<h[1-6][^>]*>(.*?)</h[1-6]>',  # HTML headings
            r'^#{1,6}\s+(.*?)$',  # Markdown headings
            r'^\s*[A-Z][^.!?]*[.!?]\s*$',  # Sentence endings that might indicate sections
        ]

        # For this implementation, we'll look for markdown-style headings
        lines = content.split('\n')
        segments = []
        current_segment = []

        for line in lines:
            if re.match(r'^#{1,6}\s+', line.strip()):  # Markdown heading
                if current_segment:
                    segment_content = '\n'.join(current_segment).strip()
                    if segment_content:
                        segments.append(segment_content)
                    current_segment = [line]
                else:
                    current_segment.append(line)
            else:
                current_segment.append(line)

        # Add the last segment
        if current_segment:
            segment_content = '\n'.join(current_segment).strip()
            if segment_content:
                segments.append(segment_content)

        return segments

    def _segment_by_length(self, content: str) -> List[str]:
        """
        Segment content by length if no semantic boundaries are found.
        """
        units = []
        paragraphs = content.split('\n\n')  # Split by paragraph breaks

        current_unit = []
        current_length = 0

        for paragraph in paragraphs:
            paragraph_length = len(paragraph)

            if current_length + paragraph_length > self.MAX_MICROLEARNING_SIZE and current_unit:
                # Complete current unit and start a new one
                units.append('\n\n'.join(current_unit))
                current_unit = [paragraph]
                current_length = paragraph_length
            else:
                current_unit.append(paragraph)
                current_length += paragraph_length

        # Add the last unit
        if current_unit:
            units.append('\n\n'.join(current_unit))

        return [unit for unit in units if len(unit) >= self.MIN_MICROLEARNING_SIZE]

    def _break_down_unit(self, unit: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Break down a unit that is too long into smaller sub-units.
        """
        content = unit["content"]
        sub_units = []

        # Split by sentences while trying to maintain semantic coherence
        sentences = re.split(r'[.!?]+', content)
        current_subunit = []
        current_length = 0

        for sentence in sentences:
            sentence = sentence.strip() + '.'  # Add back the punctuation
            sentence_length = len(sentence)

            if current_length + sentence_length > self.MAX_MICROLEARNING_SIZE and current_subunit:
                # Complete current subunit and start a new one
                sub_content = ' '.join(current_subunit).strip()
                if len(sub_content) >= self.MIN_MICROLEARNING_SIZE:
                    sub_units.append({
                        "title": f"{unit['title']} - Part {len(sub_units) + 1}",
                        "content": sub_content,
                        "segment_type": "subdivided",
                        "context": unit["context"]
                    })
                current_subunit = [sentence]
                current_length = sentence_length
            else:
                current_subunit.append(sentence)
                current_length += sentence_length

        # Add the last subunit
        if current_subunit:
            sub_content = ' '.join(current_subunit).strip()
            if len(sub_content) >= self.MIN_MICROLEARNING_SIZE:
                sub_units.append({
                    "title": f"{unit['title']} - Part {len(sub_units) + 1}",
                    "content": sub_content,
                    "segment_type": "subdivided",
                    "context": unit["context"]
                })

        return sub_units

    def _estimate_reading_time(self, content: str) -> float:
        """
        Estimate reading time for content in minutes.
        """
        word_count = len(content.split())
        reading_time = word_count / self.WORDS_PER_MINUTE
        return round(reading_time, 2)

    async def get_microlearning_analytics(self, student_id: str, chapter_id: str) -> Dict[str, Any]:
        """
        Get analytics for microlearning engagement in a chapter.

        Args:
            student_id: The ID of the student
            chapter_id: The ID of the chapter

        Returns:
            Analytics data for the student's microlearning engagement
        """
        units = await self.get_microlearning_path(student_id, chapter_id)

        if not units:
            return {"error": "No microlearning units found for this chapter"}

        total_units = len(units)
        completed_units = sum(1 for unit in units if unit["completed"])
        engagement_score = sum(unit["engagement_score"] for unit in units) / total_units if total_units > 0 else 0

        # Calculate time distribution
        time_spent = 0
        for unit in units:
            if unit["completed"] and "completed_at" in unit:
                # In a real implementation, we would track actual time spent
                time_spent += unit.get("estimated_duration", 5) * 60  # Convert to seconds

        return {
            "chapter_id": chapter_id,
            "student_id": student_id,
            "total_units": total_units,
            "completed_units": completed_units,
            "completion_rate": round((completed_units / total_units) * 100, 2) if total_units > 0 else 0,
            "engagement_score": round(engagement_score, 2),
            "estimated_time_spent": time_spent,
            "average_unit_duration": self.MICROLEARNING_DURATION,
            "recommendations": self._generate_microlearning_recommendations(
                completed_units, total_units, engagement_score
            )
        }

    def _generate_microlearning_recommendations(self, completed: int, total: int, engagement: float) -> List[str]:
        """
        Generate recommendations based on microlearning analytics.
        """
        recommendations = []

        completion_rate = (completed / total) * 100 if total > 0 else 0

        if completion_rate < 50:
            recommendations.append("Try to complete more microlearning units to build foundational knowledge.")
        elif completion_rate < 80:
            recommendations.append("You're making good progress. Try to maintain consistency in completing units.")
        else:
            recommendations.append("Excellent progress! Consider reviewing completed units to reinforce learning.")

        if engagement < 3:
            recommendations.append("Your engagement score is low. Try interacting more with the content through quizzes or exercises.")

        if total > 10:
            recommendations.append("With many microlearning units available, try spacing out your study sessions for better retention.")

        return recommendations

    async def create_microlearning_quiz(self, unit_id: str) -> List[Dict[str, Any]]:
        """
        Create a quiz for a microlearning unit to reinforce learning.

        Args:
            unit_id: The ID of the microlearning unit

        Returns:
            List of quiz questions for the unit
        """
        # Extract chapter_id from unit_id
        chapter_id = unit_id.split("_ml_")[0]

        # Get the microlearning unit content
        chapter_result = await self.db_session.execute(
            select(Chapter).where(Chapter.id == chapter_id)
        )
        chapter = chapter_result.scalar_one_or_none()

        if not chapter:
            raise ValueError(f"Chapter with ID {chapter_id} not found")

        # In a real implementation, this would use NLP to generate questions from the content
        # For now, we'll return a template quiz
        return [
            {
                "question_id": f"{unit_id}_q1",
                "question": "What was the main concept covered in this microlearning unit?",
                "type": "short_answer",
                "difficulty": "easy"
            },
            {
                "question_id": f"{unit_id}_q2",
                "question": "How might you apply this concept in practice?",
                "type": "essay",
                "difficulty": "medium"
            },
            {
                "question_id": f"{unit_id}_q3",
                "question": "Rate your understanding of this microlearning unit.",
                "type": "likert",
                "difficulty": "easy",
                "options": ["Poor", "Fair", "Good", "Very Good", "Excellent"]
            }
        ]