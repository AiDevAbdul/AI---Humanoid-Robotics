from sqlalchemy import Column, String, Integer, Text, Boolean, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped
from typing import List, TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .course_module import CourseModule
    from .progress import Progress
    from .question import Question


class Chapter(Base):
    __tablename__ = "chapters"

    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    module = Column(String, nullable=False)  # enum: ros2, gazebo, nvidia_isaac, vla
    order = Column(Integer, nullable=False, index=True)
    prerequisites = Column(JSON, default=list)  # List of UUIDs of prerequisite chapters
    content = Column(JSON, default=dict)  # Contains text, html_content, translations
    interactive_elements = Column(JSON, default=list)  # Contains simulators, code playgrounds, etc.
    meta_data = Column(JSON, default=dict)  # Contains reading time, objectives, keywords, difficulty
    is_published = Column(Boolean, default=False, nullable=False)

    # Relationships
    module_rel: Mapped["CourseModule"] = relationship("CourseModule", back_populates="chapters")
    progresses: Mapped[List["Progress"]] = relationship("Progress", back_populates="chapter")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="chapter")