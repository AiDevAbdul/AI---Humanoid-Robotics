from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, Dict
from ..database.base import get_db
from ..auth.security import get_current_active_user
from ..models.student import Student
from ..models.chapter import Chapter
from ..services.personalization_service import PersonalizationService
from ..rag.chat_service import RAGChatService

router = APIRouter()


@router.post("/personalize-content")
async def get_personalized_content(
    request_data: Dict,
    current_student: Student = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get personalized content adaptation based on user profile.
    """
    chapter_id = request_data.get("chapter_id")
    content_type = request_data.get("content_type", "text")
    current_difficulty = request_data.get("current_difficulty", "beginner")

    if not chapter_id:
        raise HTTPException(status_code=400, detail="chapter_id is required")

    # Get the chapter from the database
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # Get personalized content
    personalization_result = await PersonalizationService.get_personalized_content(
        db, current_student, chapter, content_type, current_difficulty
    )

    return personalization_result


@router.post("/chat")
async def ask_question_to_chatbot(
    request_data: Dict,
    current_student: Student = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Ask questions to the RAG chatbot about textbook content.
    """
    question = request_data.get("question")
    context = request_data.get("context", {})
    selected_text = request_data.get("selected_text", "")

    if not question:
        raise HTTPException(status_code=400, detail="question is required")

    # Initialize and use the RAG chat service
    chat_service = RAGChatService()
    await chat_service.initialize_agents()

    response = await chat_service.answer_question(
        db=db,
        student=current_student,
        question=question,
        context=context,
        selected_text=selected_text
    )

    return response