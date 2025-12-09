from sqlalchemy import Column, String, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .student import Student
    from .chapter import Chapter


class Question(Base):
    __tablename__ = "questions"

    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id"), nullable=True)  # nullable because questions might be general
    question_text = Column(Text, nullable=False)
    context = Column(JSON, default=dict)  # Contains current_page, selected_text, learning_path
    ai_response = Column(JSON, default=dict)  # Contains response_text, source_chunks, confidence_score, timestamp
    feedback = Column(JSON, default=dict)  # Contains is_helpful, rating, comments
    session_id = Column(String, nullable=True)  # For conversation history

    # Relationships
    student: Mapped["Student"] = relationship("Student", back_populates="questions")
    chapter: Mapped["Chapter"] = relationship("Chapter", back_populates="questions")