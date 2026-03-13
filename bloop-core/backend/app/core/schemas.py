from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Any

class ChatCreate(BaseModel):
    title: str | None = None

class ChatResponse(BaseModel):
    chat_id: UUID
    title: str | None
    created_at: datetime
    updated_at: datetime
    message_count: int | None = None

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    role: str
    content: str
    document_ids: list[str] | None = None
    video_ids: list[str] | None = None

class MessageResponse(BaseModel):
    message_id: UUID
    chat_id: UUID
    role: str
    content: str
    created_at: datetime
    document_ids: list[str] | None
    video_ids: list[str] | None

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    document_id: UUID
    chat_id: UUID | None
    file_name: str | None
    file_type: str | None
    file_path: str
    storage_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True

class VideoResponse(BaseModel):
    video_id: UUID
    chat_id: UUID
    storage_url: str
    file_path: str | None
    thumbnail_url: str | None
    duration_seconds: int | None
    created_at: datetime

    class Config:
        from_attributes = True

class RoadmapCreate(BaseModel):
    title: str
    user_input: str | None = None
    document_id: str | None = None
    roadmap_data: dict[str, Any]

class RoadmapResponse(BaseModel):
    roadmap_id: UUID
    title: str
    user_input: str | None
    document_id: UUID | None
    roadmap_data: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoadmapListItem(BaseModel):
    roadmap_id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True