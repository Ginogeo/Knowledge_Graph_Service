import json
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.security import require_websocket_identity
from app.db.mongo import get_database
from app.graph.build_graph import build_graph
from app.core.logging import logger
from app.providers.llm import get_llm

router = APIRouter()


@router.websocket("/ws/questions")
async def questions(websocket: WebSocket):
    try:
        identity = await require_websocket_identity(websocket)
    except PermissionError:
        logger.warning("WebSocket authentication failed")
        return
    await websocket.accept()
    conversation_id = websocket.query_params.get("conversationId") or str(uuid4())
    logger.info("WebSocket connected", extra={"user_id": identity.user_id, "conversation_id": conversation_id})
    while True:
        try:
            database = get_database()
            await database["conversations"].update_one(
                {"_id": conversation_id, "userId": identity.user_id},
                {"$setOnInsert": {"_id": conversation_id, "userId": identity.user_id, "title": "New conversation", "createdAt": datetime.now(timezone.utc)}},
                upsert=True,
            )
            graph = build_graph()
            payload = json.loads(await websocket.receive_text())
            if payload.get("type") != "question" or not isinstance(payload.get("text"), str) or not payload["text"].strip():
                await websocket.send_json({"type": "error", "code": "INVALID_MESSAGE", "message": "A question message with non-empty text is required."})
                continue
            async def send_token(content: str) -> None:
                await websocket.send_json({"type": "token", "content": content})

            state = await graph.ainvoke({"question": payload["text"], "conversation_id": conversation_id, "user_id": identity.user_id, "rewritten_query": "", "graph_context": [], "vector_context": [], "fused_context": "", "answer": "", "sources": [], "error": None, "token_callback": send_token, "llm": get_llm()})
            if state.get("error"):
                await websocket.send_json({"type": "error", "code": "GENERATION_FAILED", "message": state["error"]})
                continue
            message_id = str(uuid4())
            await websocket.send_json({"type": "done", "messageId": message_id, "sources": state["sources"]})
            await database["conversationturns"].insert_one({"conversationId": conversation_id, "userId": identity.user_id, "question": payload["text"], "answer": state["answer"], "sources": state["sources"], "createdAt": datetime.now(timezone.utc)})
        except WebSocketDisconnect:
            logger.info("WebSocket disconnected", extra={"user_id": identity.user_id, "conversation_id": conversation_id})
            return
        except Exception as error:
            logger.exception("Question stream failed", extra={"user_id": identity.user_id, "conversation_id": conversation_id})
            await websocket.send_json({"type": "error", "code": "GENERATION_FAILED", "message": str(error)})
