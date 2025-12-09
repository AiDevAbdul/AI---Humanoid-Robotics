from sqlalchemy.orm import Session
from typing import Optional
from ..models.student import Student
from ..auth.security import get_password_hash
from datetime import datetime


def get_student_by_username(db: Session, username: str) -> Optional[Student]:
    """Get a student by username"""
    return db.query(Student).filter(Student.username == username).first()


def get_student_by_email(db: Session, email: str) -> Optional[Student]:
    """Get a student by email"""
    return db.query(Student).filter(Student.email == email).first()


def create_student(
    db: Session,
    email: str,
    username: str,
    password: str,
    background_info: Optional[dict] = None
) -> Student:
    """Create a new student"""
    # Hash the password
    hashed_password = get_password_hash(password)

    # Prepare profile data
    profile = {
        "technical_background": background_info.get("technical_experience", "beginner") if background_info else "beginner",
        "hardware_access": background_info.get("hardware_access", "none") if background_info else "none",
        "primary_language": background_info.get("primary_language", "en") if background_info else "en",
        "learning_preferences": background_info.get("learning_preferences", []) if background_info else [],
        "career_goals": background_info.get("career_goals", []) if background_info else []
    }

    # Create student object
    db_student = Student(
        email=email,
        username=username,
        hashed_password=hashed_password,
        profile=profile,
        preferences={
            "ui_language": profile["primary_language"],
            "content_difficulty": "adaptive"
        }
    )

    # Add to database
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    return db_student


def update_student_last_login(db: Session, student_id: str) -> Student:
    """Update the last login time for a student"""
    student = db.query(Student).filter(Student.id == student_id).first()
    if student:
        student.last_login = datetime.utcnow().isoformat()
        db.commit()
        db.refresh(student)
    return student