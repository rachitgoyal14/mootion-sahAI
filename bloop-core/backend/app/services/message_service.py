from sqlalchemy.orm import Session
from core.models import Message
from uuid import UUID

def create_message(
    db: Session,
    chat_id: UUID,
    role: str,
    content: str,
    document_ids: list[str] | None = None,
    video_ids: list[str] | None = None
) -> Message:
    message = Message(
        chat_id=chat_id,
        role=role,
        content=content,
        document_ids=document_ids,
        video_ids=video_ids
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_messages(db: Session, chat_id: UUID) -> list[Message]:
    return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.asc()).all()

def get_message(db: Session, message_id: UUID) -> Message | None:
    return db.query(Message).filter(Message.message_id == message_id).first()

def build_context_for_llm(messages: list[Message]) -> list[dict]:
    """Convert database messages to LLM context format"""
    return [{"role": msg.role, "content": msg.content} for msg in messages]