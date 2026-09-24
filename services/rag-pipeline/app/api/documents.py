from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile

from app.core.security import Identity, require_identity
from app.db.mongo import get_database
from app.ingestion.pipeline import ingest_document
from app.models.schemas import DocumentResponse, DocumentStatusResponse

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=DocumentResponse, status_code=201)
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...), identity: Identity = Depends(require_identity)):
    document_id = str(uuid4())
    filename = file.filename or "upload"
    content = await file.read()
    await get_database()["documents"].insert_one({"_id": document_id, "userId": identity.user_id, "filename": filename, "fileType": filename.rsplit(".", 1)[-1].lower() if "." in filename else "", "status": "pending", "uploadedAt": datetime.now(timezone.utc)})
    background_tasks.add_task(ingest_document, document_id, identity.user_id, filename, content)
    return {"documentId": document_id, "status": "pending"}


@router.get("")
async def list_documents(identity: Identity = Depends(require_identity)):
    documents = await get_database()["documents"].find(
        {"userId": identity.user_id},
        {"filename": 1, "status": 1, "error": 1},
    ).to_list(length=100)
    return [{**document, "documentId": document.pop("_id")} for document in documents]


@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
async def document_status(document_id: str, identity: Identity = Depends(require_identity)):
    document = await get_database()["documents"].find_one({"_id": document_id, "userId": identity.user_id}, {"status": 1, "error": 1, "_id": 0})
    if not document:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail={"code": "DOCUMENT_NOT_FOUND", "message": "Document was not found."})
    return document
