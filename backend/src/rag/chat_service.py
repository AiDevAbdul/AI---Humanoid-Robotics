from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models.student import Student
from ..models.chapter import Chapter
from ..models.question import Question
from ..ai.gemini_service import GeminiService
from ..ai.openai_agent import OpenAIAgent


class RAGChatService:
    """
    RAG (Retrieval-Augmented Generation) Chat Service for answering questions
    about textbook content using AI models.
    """

    def __init__(self):
        """
        Initialize the RAG Chat Service with AI agents.
        """
        self.gemini_service = None
        self.openai_agent = None

    async def initialize_agents(self):
        """
        Initialize AI agents, handling potential configuration errors.
        """
        try:
            self.gemini_service = GeminiService()
        except ValueError:
            # GEMINI_API_KEY not configured, continue without it
            pass

        try:
            self.openai_agent = OpenAIAgent()
        except ValueError:
            # OPENAI_API_KEY not configured, continue without it
            pass

    async def answer_question(
        self,
        db: Session,
        student: Student,
        question: str,
        context: Dict[str, Any] = None,
        selected_text: str = ""
    ) -> Dict[str, Any]:
        """
        Answer a student's question using RAG approach with textbook content.

        Args:
            db: Database session
            student: The student asking the question
            question: The question to answer
            context: Additional context (e.g., current chapter, section)
            selected_text: Text that was selected when asking the question

        Returns:
            Dictionary containing the answer and relevant information
        """
        if not self.gemini_service and not self.openai_agent:
            # Fallback if no AI agents are configured
            return {
                "question_id": "fallback-id",
                "question": question,
                "answer": f"I received your question: '{question}'. To provide a proper answer, please ensure the AI API keys are configured in the environment.",
                "sources": [],
                "confidence_score": 0.5,
                "timestamp": "2025-12-06T22:00:00Z"
            }

        # Get relevant content from the database based on context
        relevant_content = await self._retrieve_relevant_content(
            db, context, selected_text, question
        )

        # Prepare context for the AI model
        full_context = f"""
        Textbook Content:
        {relevant_content}

        Student Question: {question}
        """

        # Use the best available AI agent to generate the answer
        answer = ""
        sources = []
        confidence_score = 0.5

        if self.gemini_service:
            # Use Gemini for the answer
            answer = await self.gemini_service.answer_question_with_context(
                question=question,
                context=full_context,
                student_profile=student.profile
            )
            sources = [{"chapter_id": context.get("chapter_id") if context else "unknown", "relevance": 0.8}] if context else []
            confidence_score = 0.85
        elif self.openai_agent:
            # Fallback to OpenAI if Gemini is not available
            answer = await self.openai_agent.answer_question(
                question=question,
                context=full_context,
                student_profile=student.profile
            )
            sources = [{"chapter_id": context.get("chapter_id") if context else "unknown", "relevance": 0.7}] if context else []
            confidence_score = 0.75

        # Create a question record in the database
        question_record = Question(
            student_id=student.id,
            question_text=question,
            answer_text=answer,
            context=context or {},
            sources=sources
        )
        db.add(question_record)
        db.commit()
        db.refresh(question_record)

        return {
            "question_id": str(question_record.id),
            "question": question,
            "answer": answer,
            "sources": sources,
            "confidence_score": confidence_score,
            "timestamp": question_record.created_at.isoformat() if question_record.created_at else "2025-12-06T22:00:00Z"
        }

    async def _retrieve_relevant_content(
        self,
        db: Session,
        context: Dict[str, Any],
        selected_text: str,
        question: str
    ) -> str:
        """
        Retrieve relevant content from the textbook based on context and question.

        Args:
            db: Database session
            context: Context information (e.g., current chapter)
            selected_text: Text that was selected
            question: The question being asked

        Returns:
            Relevant content as a string
        """
        # If context includes a specific chapter, retrieve that chapter's content
        if context and context.get("chapter_id"):
            chapter = db.query(Chapter).filter(Chapter.id == context["chapter_id"]).first()
            if chapter:
                return chapter.content.get("text", "")

        # If context includes a chapter slug, retrieve content by slug
        if context and context.get("chapter_slug"):
            chapter = db.query(Chapter).filter(Chapter.slug == context["chapter_slug"]).first()
            if chapter:
                return chapter.content.get("text", "")

        # If selected text is provided, use it as context
        if selected_text:
            return f"Selected text: {selected_text}"

        # If no specific context, return a general response
        return "General textbook content about robotics and AI."

    async def get_conversation_history(
        self,
        db: Session,
        student: Student,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get the student's recent question history.

        Args:
            db: Database session
            student: The student whose history to retrieve
            limit: Maximum number of questions to return

        Returns:
            List of recent questions and answers
        """
        questions = db.query(Question)\
            .filter(Question.student_id == student.id)\
            .order_by(Question.created_at.desc())\
            .limit(limit)\
            .all()

        return [
            {
                "id": q.id,
                "question": q.question_text,
                "answer": q.answer_text,
                "timestamp": q.created_at.isoformat() if q.created_at else None,
                "context": q.context
            }
            for q in questions
        ]