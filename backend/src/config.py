from pydantic_settings import BaseSettings
from typing import List, Union
import secrets
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Physical AI & Humanoid Robotics Textbook"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql://username:password@localhost:5432/textbook"

    # Qdrant
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""

    # AI APIs
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # JWT
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Better Auth
    BETTER_AUTH_SECRET: str = secrets.token_urlsafe(32)
    BETTER_AUTH_URL: str = "http://localhost:3000"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost", "http://localhost:3000", "http://localhost:8000"]

    # Environment
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()