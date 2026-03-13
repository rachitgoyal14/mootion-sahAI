from sqlalchemy.orm import Session
from core.models import Roadmap
from uuid import UUID
import uuid

def create_roadmap(
    db: Session,
    title: str,
    roadmap_data: dict,
    user_input: str | None = None,
    document_id: str | None = None
) -> Roadmap:
    """Create a new roadmap in the database"""
    roadmap = Roadmap(
        roadmap_id=uuid.uuid4(),
        title=title,
        user_input=user_input,
        document_id=UUID(document_id) if document_id else None,
        roadmap_data=roadmap_data
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)
    return roadmap

def get_roadmap(db: Session, roadmap_id: UUID) -> Roadmap | None:
    """Get a specific roadmap by ID"""
    return db.query(Roadmap).filter(Roadmap.roadmap_id == roadmap_id).first()

def list_roadmaps(db: Session, limit: int = 50, offset: int = 0) -> list[Roadmap]:
    """List all roadmaps ordered by most recent"""
    return (
        db.query(Roadmap)
        .order_by(Roadmap.updated_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

def update_roadmap(
    db: Session,
    roadmap_id: UUID,
    title: str | None = None,
    roadmap_data: dict | None = None
) -> Roadmap | None:
    """Update an existing roadmap"""
    roadmap = get_roadmap(db, roadmap_id)
    if not roadmap:
        return None
    
    if title:
        roadmap.title = title
    if roadmap_data:
        roadmap.roadmap_data = roadmap_data
    
    db.commit()
    db.refresh(roadmap)
    return roadmap

def delete_roadmap(db: Session, roadmap_id: UUID) -> bool:
    """Delete a roadmap"""
    roadmap = get_roadmap(db, roadmap_id)
    if not roadmap:
        return False
    
    db.delete(roadmap)
    db.commit()
    return True