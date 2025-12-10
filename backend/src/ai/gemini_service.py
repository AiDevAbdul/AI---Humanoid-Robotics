from typing import Dict, Any, List
import google.generativeai as genai
from ..config import settings


class GeminiService:
    """
    Google Gemini API service for content translation and adaptation.
    """

    def __init__(self):
        """
        Initialize the Gemini service with API key from settings.
        """
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")

        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    async def translate_content(
        self,
        content: str,
        target_language: str,
        source_language: str = "en"
    ) -> str:
        """
        Translate content from source language to target language using Gemini.

        Args:
            content: Content to be translated
            target_language: Target language code (e.g., 'ur', 'es', 'fr')
            source_language: Source language code (default 'en')

        Returns:
            Translated content as a string
        """
        prompt = f"""
        You are a professional translator. Please translate the following content from {source_language} to {target_language}.
        Maintain the technical accuracy and meaning of the content, especially for educational material.
        If translating to Urdu, use appropriate technical terminology in Urdu/English combination as needed.

        Content to translate:
        {content}

        Translation:
        """

        try:
            response = await self.model.generate_content_async(prompt)
            return response.text.strip()

        except Exception as e:
            # In case of error, return original content
            print(f"Error in Gemini translation: {str(e)}")
            return content

    async def adapt_content_for_level(
        self,
        content: str,
        target_level: str,
        student_background: str = "beginner"
    ) -> str:
        """
        Adapt content difficulty based on student background using Gemini.

        Args:
            content: Original content to be adapted
            target_level: Target difficulty level (beginner, intermediate, advanced)
            student_background: Student's background level

        Returns:
            Adapted content as a string
        """
        prompt = f"""
        You are an AI tutor adapting educational content for different learning levels.
        Please adapt the following content for a {target_level} level student with {student_background} background.

        Make appropriate changes to:
        - Explanation depth
        - Example complexity
        - Technical terminology usage
        - Concept introduction order

        Original Content:
        {content}

        Adapted Content:
        """

        try:
            response = await self.model.generate_content_async(prompt)
            return response.text.strip()

        except Exception as e:
            # In case of error, return original content
            print(f"Error in Gemini content adaptation: {str(e)}")
            return content

    async def generate_explanations(
        self,
        concept: str,
        student_profile: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """
        Generate multiple explanations for a concept based on student profile.

        Args:
            concept: The concept to explain
            student_profile: Student's profile with background, learning style, etc.

        Returns:
            List of explanations with different approaches
        """
        prompt = f"""
        You are an AI tutor generating explanations for a student with the following profile:
        - Technical Background: {student_profile.get('technicalBackground', 'unknown')}
        - Programming Experience: {student_profile.get('experienceLevel', 'unknown')}
        - Learning Style: {student_profile.get('learningStyle', 'visual')}
        - Hardware Access: {student_profile.get('hardwareAccess', 'none')}

        Please provide multiple explanations for this concept: {concept}

        Provide explanations that include:
        1. A technical explanation
        2. An analogy-based explanation
        3. A practical example
        4. A visual description (if applicable)

        Format the response as separate explanations.
        """

        try:
            response = await self.model.generate_content_async(prompt)
            # In a real implementation, we would parse the response to extract multiple explanations
            # For now, we'll return a mock response
            return [
                {
                    "type": "technical",
                    "content": f"Technical explanation of {concept}",
                    "difficulty": student_profile.get('technicalBackground', 'beginner')
                },
                {
                    "type": "analogy",
                    "content": f"Analogy-based explanation of {concept}",
                    "difficulty": student_profile.get('technicalBackground', 'beginner')
                }
            ]

        except Exception as e:
            # In case of error, return a default explanation
            print(f"Error in Gemini explanation generation: {str(e)}")
            return [{
                "type": "default",
                "content": f"Explanation for concept: {concept}",
                "difficulty": student_profile.get('technicalBackground', 'beginner')
            }]

    async def answer_question_with_context(
        self,
        question: str,
        context: str,
        student_profile: Dict[str, Any] = None
    ) -> str:
        """
        Answer a question based on context and student profile.

        Args:
            question: The question to answer
            context: Relevant context for the question
            student_profile: Optional student profile for personalized response

        Returns:
            Answer as a string
        """
        prompt = f"""
        You are an AI tutor helping a student with their question.
        """

        if student_profile:
            prompt += f"""
        The student has the following profile:
        - Technical Background: {student_profile.get('technicalBackground', 'unknown')}
        - Programming Experience: {student_profile.get('experienceLevel', 'unknown')}
        - Learning Style: {student_profile.get('learningStyle', 'visual')}
        """

        prompt += f"""
        Question: {question}
        Context: {context}

        Please provide a helpful, accurate, and clear answer appropriate for the student's level.
        """

        try:
            response = await self.model.generate_content_async(prompt)
            return response.text.strip()

        except Exception as e:
            # In case of error, return a generic response
            print(f"Error in Gemini question answering: {str(e)}")
            return "I'm sorry, I couldn't process your question at the moment. Please try again later."