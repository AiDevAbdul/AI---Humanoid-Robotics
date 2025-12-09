from sqlalchemy import Column, String, Integer, Text, Boolean, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .student import Student
    from .chapter import Chapter


class Progress(Base):
    __tablename__ = "progresses"

    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id"), nullable=False)
    status = Column(String, default="not_started", nullable=False)  # enum: not_started, in_progress, completed
    completion_percentage = Column(Integer, default=0, nullable=False)  # 0-100
    time_spent = Column(Integer, default=0, nullable=False)  # in seconds
    scores = Column(JSON, default=dict)  # Contains quiz_score, practical_score, overall_score
    attempts = Column(Integer, default=1, nullable=False)
    last_accessed = Column(String)  # ISO timestamp
    completed_at = Column(String)  # ISO timestamp, nullable
    personalized_path = Column(JSON, default=dict)  # Tracks adaptive learning path

    # Ensure unique constraint on student_id and chapter_id combination
    __table_args__ = (
        UniqueConstraint('student_id', 'chapter_id', name='unique_student_chapter_progress'),
    )

    # Relationships
    student: Mapped["Student"] = relationship("Student", back_populates="progresses")
    chapter: Mapped["Chapter"] = relationship("Chapter", back_populates="progresses")