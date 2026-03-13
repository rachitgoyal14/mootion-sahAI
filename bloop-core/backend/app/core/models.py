from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, ARRAY, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from core.database import Base
import uuid

class Chat(Base):
    __tablename__ = "chats"
    
    chat_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Message(Base):
    __tablename__ = "messages"
    
    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.chat_id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    video_ids = Column(ARRAY(Text))
    document_ids = Column(ARRAY(Text))

class Document(Base):
    __tablename__ = "documents"
    
    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.chat_id", ondelete="CASCADE"), nullable=True)  # Made nullable
    file_name = Column(String(500))
    file_type = Column(String(50))
    file_path = Column(Text, nullable=False)
    storage_url = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

class Video(Base):
    __tablename__ = "videos"
    
    video_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = Column(UUID(as_uuid=True), ForeignKey("chats.chat_id", ondelete="CASCADE"), nullable=False)
    storage_url = Column(Text, nullable=False)
    file_path = Column(Text)
    thumbnail_url = Column(Text)
    duration_seconds = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

class Roadmap(Base):
    __tablename__ = "roadmaps"
    
    roadmap_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    user_input = Column(Text)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.document_id", ondelete="SET NULL"), nullable=True)
    roadmap_data = Column(JSON, nullable=False)  # Store the nodes and edges JSON
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())