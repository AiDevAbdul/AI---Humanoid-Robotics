from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Any
from .. import crud
from ..database.base import get_db
from ..auth import Token, StudentRegister, StudentLogin
from ..auth.security import verify_password, get_password_hash, create_access_token
from datetime import timedelta
from ..config import settings
from ..models.student import Student

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_student(student_data: StudentRegister, db: Session = Depends(get_db)) -> Any:
    """Register a new student account"""
    # Check if user already exists
    existing_student = crud.get_student_by_username(db, username=student_data.username)
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    existing_email = crud.get_student_by_email(db, email=student_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new student
    student = crud.create_student(
        db,
        email=student_data.email,
        username=student_data.username,
        password=student_data.password,
        background_info=student_data.background_info
    )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": student.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login_student(student_data: StudentLogin, db: Session = Depends(get_db)) -> Any:
    """Authenticate student and return access token"""
    student = crud.get_student_by_username(db, username=student_data.username)
    if not student or not verify_password(student_data.password, student.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last login
    crud.update_student_last_login(db, student.id)

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": student.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}