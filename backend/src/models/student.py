from sqlalchemy import Column, String, Text, Boolean, JSON
from sqlalchemy.orm import relationship, Mapped
from typing import List, TYPE_CHECKING
from .base import Base

if TYPE_CHECKING:
    from .progress import Progress
    from .student_badge import StudentBadge
    from .question import Question


class Student(Base):
    __tablename__ = "students"

    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Profile information
    profile = Column(JSON, default=dict)  # Contains first_name, last_name, technical_background, etc.

    # Preferences
    preferences = Column(JSON, default=dict)  # Contains ui_language, content_difficulty, etc.

    # Authentication
    auth_provider = Column(String, default="local")  # e.g., "google", "github", "local"
    last_login = Column(String)  # ISO timestamp

    # Relationships
    progresses: Mapped[List["Progress"]] = relationship("Progress", back_populates="student")
    student_badges: Mapped[List["StudentBadge"]] = relationship("StudentBadge", back_populates="student")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="student")