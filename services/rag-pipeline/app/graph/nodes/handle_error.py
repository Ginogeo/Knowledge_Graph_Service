from app.graph.state import QAState


async def handle_error(state: QAState) -> QAState:
    if not state.get("error"):
        state["error"] = "Question generation failed."
    state["answer"] = ""
    state["sources"] = []
    return state
