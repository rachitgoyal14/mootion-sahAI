from sqlalchemy import func
from sqlalchemy.orm import Session
from core.models import Chat, Message
from uuid import UUID
from datetime import datetime

def create_chat(db: Session, title: str | None = None) -> Chat:
    chat = Chat(title=title)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

def get_chat(db: Session, chat_id: UUID) -> Chat | None:
    return db.query(Chat).filter(Chat.chat_id == chat_id).first()

def list_chats_with_count(db: Session, limit: int = 50, offset: int = 0):
    return (
        db.query(
            Chat,
            func.count(Message.message_id).label("message_count")
        )
        .outerjoin(Message, Chat.chat_id == Message.chat_id)
        .group_by(Chat.chat_id)
        .order_by(Chat.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def update_chat_timestamp(db: Session, chat_id: UUID):
    db.query(Chat).filter(Chat.chat_id == chat_id).update({"updated_at": datetime.utcnow()})
    db.commit()

def delete_chat(db: Session, chat_id: UUID) -> bool:
    chat = db.query(Chat).filter(Chat.chat_id == chat_id).first()
    if chat:
        db.delete(chat)
        db.commit()
        return True
    return False

def get_message_count(db: Session, chat_id: UUID) -> int:
    return db.query(Message).filter(Message.chat_id == chat_id).count()

def generate_title_from_first_message(content: str, max_length: int = 50) -> str:
    """Generate a chat title from the first message"""
    if len(content) <= max_length:
        return content
    return content[:max_length].rsplit(' ', 1)[0] + "..."