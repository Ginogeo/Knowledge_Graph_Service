from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


DocumentStatus = Literal["pending", "processing", "ready", "failed"]


class DocumentResponse(BaseModel):
    document_id: str = Field(alias="documentId")
    status: DocumentStatus

    model_config = {"populate_by_name": True}


class DocumentStatusResponse(BaseModel):
    status: DocumentStatus
    error: str | None = None


class Source(BaseModel):
    type: Literal["graph", "chunk"]
    entity: str | None = None
    document_id: str | None = None
    page: int | None = None


class ConversationTurn(BaseModel):
    question: str
    answer: str
    sources: list[Source]
    created_at: datetime | None = None


class QuestionMessage(BaseModel):
    type: Literal["question"]
    text: str


class DoneMessage(BaseModel):
    type: Literal["done"]
    message_id: str
    sources: list[dict[str, Any]]
