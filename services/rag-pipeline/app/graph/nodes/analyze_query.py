from app.graph.state import QAState


async def analyze_query(state: QAState) -> QAState:
    llm = state.get("llm")
    if llm is None:
        state["rewritten_query"] = state["question"].strip()
        return state
    result = await llm.ainvoke(f"Rewrite this financial question for retrieval, preserving meaning:\n{state['question']}")
    state["rewritten_query"] = str(getattr(result, "content", result)).strip()
    return state
