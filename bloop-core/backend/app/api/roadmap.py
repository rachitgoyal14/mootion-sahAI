from fastapi import APIRouter, Body, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from services.roadmap_service import generate_roadmap
from services import roadmap_db_service
from core.database import get_db
from core.schemas import RoadmapResponse, RoadmapListItem
from uuid import UUID

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

class RoadmapRequest(BaseModel):
    user_input: str
    document_id: Optional[str] = None
    save: bool = True  # Whether to save to database

@router.post("/", response_model=RoadmapResponse)
def get_roadmap(
    request: RoadmapRequest = Body(...),
    db: Session = Depends(get_db)
):
    """Generate a new roadmap and optionally save it"""
    # Generate roadmap using existing service
    roadmap_data = generate_roadmap(request.user_input, request.document_id)
    
    # Generate title from user input or first node
    title = request.user_input[:100] if request.user_input else "Untitled Roadmap"
    if roadmap_data.get("nodes") and len(roadmap_data["nodes"]) > 0:
        title = roadmap_data["nodes"][0]["data"]["label"]
    
    # Save to database if requested
    if request.save:
        saved_roadmap = roadmap_db_service.create_roadmap(
            db=db,
            title=title,
            roadmap_data=roadmap_data,
            user_input=request.user_input,
            document_id=request.document_id
        )
        
        return RoadmapResponse(
            roadmap_id=saved_roadmap.roadmap_id,
            title=saved_roadmap.title,
            user_input=saved_roadmap.user_input,
            document_id=saved_roadmap.document_id,
            roadmap_data=saved_roadmap.roadmap_data,
            created_at=saved_roadmap.created_at,
            updated_at=saved_roadmap.updated_at
        )
    else:
        # Return roadmap data without saving
        import uuid
        return RoadmapResponse(
            roadmap_id=uuid.uuid4(),
            title=title,
            user_input=request.user_input,
            document_id=UUID(request.document_id) if request.document_id else None,
            roadmap_data=roadmap_data,
            created_at=None,
            updated_at=None
        )

@router.get("/list", response_model=list[RoadmapListItem])
def list_roadmaps(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """List all saved roadmaps"""
    roadmaps = roadmap_db_service.list_roadmaps(db, limit=limit, offset=offset)
    return [
        RoadmapListItem(
            roadmap_id=rm.roadmap_id,
            title=rm.title,
            created_at=rm.created_at,
            updated_at=rm.updated_at
        )
        for rm in roadmaps
    ]

@router.get("/{roadmap_id}", response_model=RoadmapResponse)
def get_roadmap_by_id(
    roadmap_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a specific roadmap by ID"""
    roadmap = roadmap_db_service.get_roadmap(db, roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    return RoadmapResponse(
        roadmap_id=roadmap.roadmap_id,
        title=roadmap.title,
        user_input=roadmap.user_input,
        document_id=roadmap.document_id,
        roadmap_data=roadmap.roadmap_data,
        created_at=roadmap.created_at,
        updated_at=roadmap.updated_at
    )

@router.delete("/{roadmap_id}")
def delete_roadmap(
    roadmap_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a roadmap"""
    deleted = roadmap_db_service.delete_roadmap(db, roadmap_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return {"deleted": True}

@router.put("/{roadmap_id}", response_model=RoadmapResponse)
def update_roadmap(
    roadmap_id: UUID,
    title: str | None = None,
    roadmap_data: dict | None = None,
    db: Session = Depends(get_db)
):
    """Update a roadmap's title or data"""
    roadmap = roadmap_db_service.update_roadmap(
        db=db,
        roadmap_id=roadmap_id,
        title=title,
        roadmap_data=roadmap_data
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    return RoadmapResponse(
        roadmap_id=roadmap.roadmap_id,
        title=roadmap.title,
        user_input=roadmap.user_input,
        document_id=roadmap.document_id,
        roadmap_data=roadmap.roadmap_data,
        created_at=roadmap.created_at,
        updated_at=roadmap.updated_at
    )