from collections.abc import Awaitable, Callable
from typing import Any, TypedDict


class QAState(TypedDict):
    question: str
    conversation_id: str
    user_id: str
    rewritten_query: str
    graph_context: list
    vector_context: list
    fused_context: str
    answer: str
    sources: list
    error: str | None
    token_callback: Callable[[str], Awaitable[None]] | None
    llm: Any
