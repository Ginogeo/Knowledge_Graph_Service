from dataclasses import dataclass

from fastapi import Header, HTTPException, WebSocket, status

from app.core.config import get_settings


@dataclass(frozen=True)
class Identity:
    user_id: str
    role: str
    email: str | None = None


def require_identity(
    x_internal_key: str | None = Header(default=None),
    x_user_id: str | None = Header(default=None),
    x_user_role: str | None = Header(default=None),
    x_user_email: str | None = Header(default=None),
) -> Identity:
    settings = get_settings()
    if x_internal_key != settings.internal_service_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": "FORBIDDEN_DIRECT_ACCESS", "message": "Direct access is not allowed."})
    if not x_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": "MISSING_IDENTITY", "message": "User identity is required."})
    return Identity(user_id=x_user_id, role=x_user_role or "user", email=x_user_email)


async def require_websocket_identity(websocket: WebSocket) -> Identity:
    settings = get_settings()
    if websocket.headers.get("x-internal-key") != settings.internal_service_key:
        await websocket.close(code=1008, reason="FORBIDDEN_DIRECT_ACCESS")
        raise PermissionError("Forbidden direct access")
    user_id = websocket.headers.get("x-user-id")
    if not user_id:
        await websocket.close(code=1008, reason="MISSING_IDENTITY")
        raise PermissionError("Missing identity")
    return Identity(user_id=user_id, role=websocket.headers.get("x-user-role", "user"), email=websocket.headers.get("x-user-email"))
