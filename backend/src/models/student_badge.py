from sqlalchemy import Column, String, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped
from typing import TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .student import Student
    from .badge import Badge


class StudentBadge(Base):
    __tablename__ = "student_badges"

    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    badge_id = Column(UUID(as_uuid=True), ForeignKey("badges.id"), nullable=False)
    earned_at = Column(String, nullable=False)  # ISO timestamp
    evidence = Column(JSON, default=dict)  # Optional proof of achievement

    # Relationships
    student: Mapped["Student"] = relationship("Student", back_populates="student_badges")
    badge: Mapped["Badge"] = relationship("Badge", back_populates="student_badges")