from sqlalchemy import Column, String, Integer, Text, JSON
from sqlalchemy.orm import relationship, Mapped
from typing import List, TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .chapter import Chapter


class CourseModule(Base):
    __tablename__ = "course_modules"

    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    order = Column(Integer, nullable=False, index=True)
    learning_objectives = Column(JSON, default=list)
    duration_estimate = Column(Integer, nullable=True)  # in hours

    # Relationships
    chapters: Mapped[List["Chapter"]] = relationship("Chapter", back_populates="module_rel", order_by="Chapter.order")