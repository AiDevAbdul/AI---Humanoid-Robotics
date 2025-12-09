from sqlalchemy import Column, String, Integer, Text, Boolean, JSON
from sqlalchemy.orm import relationship, Mapped
from typing import List, TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .student_badge import StudentBadge


class Badge(Base):
    __tablename__ = "badges"

    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String, nullable=True)  # URL to icon
    category = Column(String, nullable=False)  # enum: completion, skill, milestone, achievement
    points_value = Column(Integer, default=10, nullable=False)
    criteria = Column(JSON, default=dict)  # Defines requirements to earn this badge
    is_visible = Column(Boolean, default=True, nullable=False)

    # Relationships
    student_badges: Mapped[List["StudentBadge"]] = relationship("StudentBadge", back_populates="badge")