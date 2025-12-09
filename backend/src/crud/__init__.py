"""
CRUD operations for the Physical AI & Humanoid Robotics Textbook application
"""
from .student import (
    get_student_by_username,
    get_student_by_email,
    create_student,
    update_student_last_login
)

__all__ = [
    "get_student_by_username",
    "get_student_by_email",
    "create_student",
    "update_student_last_login"
]