from typing import List

from fastapi import APIRouter, Depends, File, Request, UploadFile
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.schemas import DocumentResponse, IndexOperationResponse
from app.services.search_service import DocumentService

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await DocumentService.upload_document(file, db, request.app.state.index)


@router.get("", response_model=List[DocumentResponse])
def list_documents(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return DocumentService.list_documents(db, skip, limit)


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = DocumentService.get_document(doc_id, db)
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.put("/{doc_id}")
async def update_document(
    doc_id: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await DocumentService.update_document(doc_id, file, db, request.app.state.index)


@router.delete("/{doc_id}")
def delete_document(doc_id: int, request: Request, db: Session = Depends(get_db)):
    return DocumentService.delete_document(doc_id, db, request.app.state.index)


@router.get("/{doc_id}/history", response_model=List[IndexOperationResponse])
def document_history(doc_id: int, db: Session = Depends(get_db)):
    return DocumentService.get_document_history(doc_id, db)
