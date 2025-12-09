from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class StudentRegister(BaseModel):
    email: str
    username: str
    password: str
    background_info: Optional[dict] = None


class StudentLogin(BaseModel):
    username: str
    password: str