from fastapi import APIRouter, Depends, HTTPException

from app.core.security import Identity, require_identity
from app.db.mongo import get_database

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("")
async def list_conversations(identity: Identity = Depends(require_identity)):
    return await get_database()["conversations"].find({"userId": identity.user_id}, {"userId": 0}).sort("createdAt", -1).to_list(length=100)


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str, identity: Identity = Depends(require_identity)):
    database = get_database()
    conversation = await database["conversations"].find_one({"_id": conversation_id, "userId": identity.user_id}, {"userId": 0})
    if not conversation:
        raise HTTPException(status_code=404, detail={"code": "CONVERSATION_NOT_FOUND", "message": "Conversation was not found."})
    conversation["turns"] = await database["conversationturns"].find({"conversationId": conversation_id, "userId": identity.user_id}, {"_id": 0, "userId": 0}).sort("createdAt", 1).to_list(length=500)
    return conversation
