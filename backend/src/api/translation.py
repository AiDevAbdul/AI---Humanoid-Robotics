from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, Dict
from ..database.base import get_db
from ..auth.security import get_current_active_user
from ..models.student import Student
from ..ai.translation_service import TranslationService

router = APIRouter()


@router.post("/switch-language")
async def switch_language(
    request_data: Dict,
    current_student: Student = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Switch the language for content delivery.
    """
    language_code = request_data.get("language_code")
    translate_content = request_data.get("translate_content", True)

    if not language_code:
        raise HTTPException(status_code=400, detail="language_code is required")

    # Update user's language preference
    current_student.preferences["ui_language"] = language_code
    if translate_content:
        current_student.preferences["content_difficulty"] = language_code

    # In a real implementation, this would also update the user's content language preference
    # For now, we'll just return a success message

    # Get language name (simplified)
    language_names = {
        "en": "English",
        "ur": "Urdu",
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "zh": "Chinese",
        "ja": "Japanese",
        "ko": "Korean",
        "ar": "Arabic"
    }
    language_name = language_names.get(language_code, language_code)

    return {
        "language_code": language_code,
        "language_name": language_name,
        "content_translated": translate_content,
        "message": f"Language switched to {language_name}. Content translation {'enabled' if translate_content else 'disabled'}."
    }


@router.post("/translate-content")
async def get_translated_content(
    request_data: Dict,
    current_student: Student = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get content translated to the specified language.
    """
    chapter_id = request_data.get("chapter_id")
    target_language = request_data.get("target_language")

    if not chapter_id:
        raise HTTPException(status_code=400, detail="chapter_id is required")
    if not target_language:
        raise HTTPException(status_code=400, detail="target_language is required")

    # Get translated content using the translation service
    translation_result = await TranslationService.get_translated_content(
        db, chapter_id, target_language
    )

    if not translation_result:
        raise HTTPException(status_code=404, detail="Chapter not found")

    return translation_result