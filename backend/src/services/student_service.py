from typing import Optional
from sqlalchemy.orm import Session
from ..models.student import Student


class StudentService:
    @staticmethod
    def get_student_profile(db: Session, student_id: str) -> Optional[dict]:
        """
        Get student profile information
        """
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return None

        return {
            "id": str(student.id),
            "email": student.email,
            "username": student.username,
            "profile": student.profile,
            "preferences": student.preferences,
            "auth_provider": student.auth_provider,
            "last_login": student.last_login,
            "is_active": student.is_active
        }

    @staticmethod
    def update_student_profile(db: Session, student_id: str, profile_updates: dict) -> Optional[dict]:
        """
        Update student profile information
        """
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return None

        # Update profile information
        if "profile" in profile_updates:
            student.profile.update(profile_updates["profile"])

        if "preferences" in profile_updates:
            student.preferences.update(profile_updates["preferences"])

        # Update other fields as needed
        if "email" in profile_updates:
            student.email = profile_updates["email"]

        db.commit()
        db.refresh(student)

        return {
            "id": str(student.id),
            "email": student.email,
            "username": student.username,
            "profile": student.profile,
            "preferences": student.preferences,
            "auth_provider": student.auth_provider,
            "last_login": student.last_login,
            "is_active": student.is_active
        }