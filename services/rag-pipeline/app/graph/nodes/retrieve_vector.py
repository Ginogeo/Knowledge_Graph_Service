from app.graph.state import QAState
from app.ingestion.embedder import similarity_search


async def retrieve_vector(state: QAState) -> QAState:
    state["vector_context"] = await similarity_search(state["rewritten_query"], state["user_id"])
    return state
