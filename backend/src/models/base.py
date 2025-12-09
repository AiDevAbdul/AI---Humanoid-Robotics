from sqlalchemy import Column, DateTime, func, String, UUID
from sqlalchemy.ext.declarative import as_declarative
from sqlalchemy.orm import declared_attr
import uuid
from datetime import datetime


@as_declarative()
class Base:
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False
    )
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()