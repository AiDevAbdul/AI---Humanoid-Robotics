"""
RAG (Retrieval-Augmented Generation) module for the Physical AI & Humanoid Robotics Textbook
"""
from qdrant_client import QdrantClient
from ..config import settings

# Initialize Qdrant client
if settings.QDRANT_URL and settings.QDRANT_API_KEY:
    qdrant_client = QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )
else:
    # For development/local testing
    qdrant_client = QdrantClient(":memory:")

__all__ = ["qdrant_client"]