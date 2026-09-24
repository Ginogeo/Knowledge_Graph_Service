import time

from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.responses import JSONResponse

from app.api.conversations import router as conversation_router
from app.api.documents import router as document_router
from app.ws.questions import router as questions_router
from app.core.logging import configure_logging, logger

configure_logging()

app = FastAPI(title="Financial Knowledge Graph RAG Pipeline")


@app.middleware("http")
async def request_logging(request: Request, call_next):
    started = time.perf_counter()
    try:
        response = await call_next(request)
        logger.info("HTTP request", extra={"method": request.method, "path": request.url.path, "status_code": response.status_code, "duration_ms": round((time.perf_counter() - started) * 1000, 2)})
        return response
    except Exception:
        logger.exception("HTTP request failed", extra={"method": request.method, "path": request.url.path, "duration_ms": round((time.perf_counter() - started) * 1000, 2)})
        raise


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request: Request, _error: RequestValidationError):
    return JSONResponse(status_code=400, content={"error": {"code": "VALIDATION_ERROR", "message": "Request is invalid."}})


@app.exception_handler(HTTPException)
async def http_error_handler(_request: Request, error: HTTPException):
    detail = error.detail if isinstance(error.detail, dict) else {"code": "HTTP_ERROR", "message": str(error.detail)}
    return JSONResponse(status_code=error.status_code, content={"error": detail})


@app.exception_handler(Exception)
async def error_handler(_request: Request, error: Exception):
    logger.exception("Unhandled application error", exc_info=error)
    return JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": str(error)}})


app.include_router(document_router)
app.include_router(conversation_router)
app.include_router(questions_router)


def run() -> None:
    import uvicorn
    from app.core.config import get_settings
    uvicorn.run(app, host="0.0.0.0", port=get_settings().port)
