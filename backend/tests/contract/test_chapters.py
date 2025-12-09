"""
Contract tests for chapters endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import MagicMock

from src.main import app  # Assuming main.py contains the FastAPI app
from src.database.session import SessionLocal, engine
from src.models import Base

# Create a test client
client = TestClient(app)

@pytest.fixture
def db_session():
    """Create a test database session"""
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

def test_get_chapters_endpoint_contract():
    """Test the GET /chapters endpoint contract"""
    response = client.get("/api/v1/chapters")

    # Verify response structure and status code
    assert response.status_code == 200

    # Verify response body structure
    data = response.json()
    assert "chapters" in data
    assert "total" in data
    assert "limit" in data
    assert "offset" in data

    # Verify chapters is a list
    assert isinstance(data["chapters"], list)

    # If there are chapters, verify their structure
    if len(data["chapters"]) > 0:
        chapter = data["chapters"][0]
        assert "id" in chapter
        assert "title" in chapter
        assert "slug" in chapter
        assert "module" in chapter
        assert "order" in chapter
        assert "difficulty" in chapter
        assert "estimated_reading_time" in chapter
        assert "learning_objectives" in chapter
        assert "prerequisites" in chapter
        assert "is_locked" in chapter
        assert "progress" in chapter

def test_get_chapter_by_slug_endpoint_contract():
    """Test the GET /chapters/{slug} endpoint contract"""
    # Test with a mock slug
    response = client.get("/api/v1/chapters/intro-ros2")

    # For this test, we expect either 200 (found) or 404 (not found)
    # Both are valid responses for the contract test
    assert response.status_code in [200, 404]

    if response.status_code == 200:
        # Verify response body structure when chapter is found
        data = response.json()
        assert "id" in data
        assert "title" in data
        assert "slug" in data
        assert "module" in data
        assert "order" in data
        assert "content" in data
        assert "interactive_elements" in data
        assert "metadata" in data
        assert "prerequisites" in data
        assert "progress" in data
        assert "created_at" in data
        assert "updated_at" in data