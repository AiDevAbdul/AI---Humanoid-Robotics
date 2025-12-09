from sqlalchemy.orm import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator

Base = declarative_base()

def get_db() -> Generator:
    """
    Dependency to get database session
    """
    from .session import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()