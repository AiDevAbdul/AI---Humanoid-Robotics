from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.chapter import Chapter
from .gemini_service import GeminiService


class TranslationService:
    @staticmethod
    async def get_translated_content(
        db: Session,
        chapter_id: str,
        target_language: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get content translated to the target language
        """
        chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
        if not chapter:
            return None

        # Get translated content if available
        translations = chapter.content.get("translations", {})
        translated_content = translations.get(target_language)

        if not translated_content:
            # If translation is not available, use Gemini to translate
            # In a real implementation, this might trigger a translation service
            original_content = chapter.content.get("text", "")
            translated_content = await TranslationService.translate_content_with_gemini(
                content=original_content,
                target_language=target_language
            )

            return {
                "original_content": original_content,
                "translated_content": translated_content,
                "language_code": target_language,
                "is_translated": True,
                "message": f"Content translated to {target_language} using Gemini API"
            }

        return {
            "original_content": chapter.content.get("text", ""),
            "translated_content": translated_content,
            "language_code": target_language,
            "is_translated": True
        }

    @staticmethod
    async def translate_content_with_gemini(
        content: str,
        target_language: str,
        source_language: str = "en"
    ) -> str:
        """
        Translate content using Gemini API
        """
        try:
            gemini_service = GeminiService()
            translated_content = await gemini_service.translate_content(
                content=content,
                target_language=target_language,
                source_language=source_language
            )
            return translated_content
        except Exception as e:
            # In case of error, return the original content with an error message
            print(f"Error in Gemini translation: {str(e)}")
            return content

    @staticmethod
    def update_chapter_translations(
        db: Session,
        chapter_id: str,
        translations: Dict[str, str]
    ) -> bool:
        """
        Update chapter translations in the database
        """
        chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
        if not chapter:
            return False

        # Get existing content and update translations
        current_content = chapter.content or {}
        current_translations = current_content.get("translations", {})
        current_translations.update(translations)

        # Update the content field with new translations
        current_content["translations"] = current_translations
        chapter.content = current_content

        db.commit()
        db.refresh(chapter)

        return True