from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.schemas import ChatCreate, ChatResponse, MessageResponse
from services import chat_service, message_service
from uuid import UUID

router = APIRouter(prefix="/chats", tags=["Chat History"])

@router.post("", response_model=ChatResponse)
def create_chat(chat: ChatCreate, db: Session = Depends(get_db)):
    """Create a new chat session"""
    new_chat = chat_service.create_chat(db, title=chat.title)
    return ChatResponse(
        chat_id=new_chat.chat_id,
        title=new_chat.title,
        created_at=new_chat.created_at,
        updated_at=new_chat.updated_at,
        message_count=0
    )

@router.get("", response_model=list[ChatResponse])
def list_chats(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    chats = chat_service.list_chats_with_count(db, limit, offset)

    return [
        ChatResponse(
            chat_id=chat.Chat.chat_id,
            title=chat.Chat.title,
            created_at=chat.Chat.created_at,
            updated_at=chat.Chat.updated_at,
            message_count=chat.message_count
        )
        for chat in chats
    ]

@router.get("/{chat_id}", response_model=ChatResponse)
def get_chat(chat_id: UUID, db: Session = Depends(get_db)):
    """Get a specific chat session"""
    chat = chat_service.get_chat(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    msg_count = chat_service.get_message_count(db, chat_id)
    return ChatResponse(
        chat_id=chat.chat_id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        message_count=msg_count
    )

@router.get("/{chat_id}/messages", response_model=list[MessageResponse])
def get_messages(chat_id: UUID, db: Session = Depends(get_db)):
    """Get all messages for a chat session"""
    chat = chat_service.get_chat(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    messages = message_service.get_messages(db, chat_id)
    return [MessageResponse.from_orm(msg) for msg in messages]

@router.delete("/{chat_id}")
def delete_chat(chat_id: UUID, db: Session = Depends(get_db)):
    """Delete a chat session and all its messages"""
    deleted = chat_service.delete_chat(db, chat_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"deleted": True}