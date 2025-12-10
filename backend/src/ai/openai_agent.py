from typing import Dict, Any, List
import openai
from ..config import settings


class OpenAIAgent:
    """
    OpenAI Agent for content personalization and AI-powered features.
    """

    def __init__(self):
        """
        Initialize the OpenAI Agent with API key from settings.
        """
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")

        openai.api_key = settings.openai_api_key

    async def personalize_content(
        self,
        content: str,
        student_profile: Dict[str, Any],
        difficulty_level: str = "beginner"
    ) -> str:
        """
        Personalize content based on student profile and difficulty level.

        Args:
            content: Original content to be personalized
            student_profile: Student's profile with background, experience, etc.
            difficulty_level: Desired difficulty level (beginner, intermediate, advanced)

        Returns:
            Personalized content as a string
        """
        # Construct the prompt for content personalization
        prompt = f"""
        You are an AI tutor helping to personalize educational content for a student.
        Please adapt the following content based on the student's profile:

        Student Profile:
        - Technical Background: {student_profile.get('technicalBackground', 'unknown')}
        - Programming Experience: {student_profile.get('experienceLevel', 'unknown')}
        - Hardware Access: {student_profile.get('hardwareAccess', 'none')}
        - Learning Style: {student_profile.get('learningStyle', 'visual')}
        - Interests: {', '.join(student_profile.get('interests', []))}

        Difficulty Level: {difficulty_level}

        Original Content:
        {content}

        Please return the personalized content that matches the student's profile and learning needs.
        Include explanations appropriate to their level, relevant examples, and adjust complexity accordingly.
        """

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2000
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            # In case of error, return original content
            print(f"Error in OpenAI content personalization: {str(e)}")
            return content

    async def answer_question(
        self,
        question: str,
        context: str = "",
        student_profile: Dict[str, Any] = None
    ) -> str:
        """
        Answer a student's question based on context and potentially student profile.

        Args:
            question: The question asked by the student
            context: Relevant context for the question
            student_profile: Optional student profile for personalized response

        Returns:
            Answer to the question as a string
        """
        prompt = f"""
        You are an AI tutor helping a student with their questions about robotics and AI.
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
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1000
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            # In case of error, return a generic response
            print(f"Error in OpenAI question answering: {str(e)}")
            return "I'm sorry, I couldn't process your question at the moment. Please try again later."

    async def generate_learning_path(
        self,
        student_profile: Dict[str, Any],
        current_topic: str,
        goals: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Generate a personalized learning path for the student.

        Args:
            student_profile: Student's profile with background, experience, etc.
            current_topic: The topic the student is currently studying
            goals: List of learning goals the student wants to achieve

        Returns:
            A list of learning path steps with topics, resources, and difficulty
        """
        prompt = f"""
        You are an AI tutor creating a personalized learning path for a student.

        Student Profile:
        - Technical Background: {student_profile.get('technicalBackground', 'unknown')}
        - Programming Experience: {student_profile.get('experienceLevel', 'unknown')}
        - Hardware Access: {student_profile.get('hardwareAccess', 'none')}

        Current Topic: {current_topic}
        Learning Goals: {', '.join(goals)}

        Please create a structured learning path with the following information for each step:
        - topic: The topic to learn
        - difficulty: The difficulty level
        - estimated_time: Estimated time to complete (in minutes)
        - prerequisites: Any prerequisites needed
        - resources: Recommended resources

        Return the learning path as a list of steps.
        """

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1500
            )

            # In a real implementation, we would parse the response to extract the learning path
            # For now, we'll return a mock response
            return [
                {
                    "topic": "Introduction to the topic",
                    "difficulty": "beginner",
                    "estimated_time": 30,
                    "prerequisites": [],
                    "resources": ["textbook_chapter_1", "video_1"]
                }
            ]

        except Exception as e:
            # In case of error, return an empty path
            print(f"Error in OpenAI learning path generation: {str(e)}")
            return []