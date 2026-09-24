from app.graph.state import QAState


async def generate_answer(state: QAState) -> QAState:
    state["sources"] = [
        {"type": "graph", "entity": item["entity"]}
        for item in state["graph_context"]
    ] + [
        {"type": "chunk", "documentId": item.get("documentId"), "page": item.get("page")}
        for item in state["vector_context"]
    ]
    llm = state.get("llm")
    if llm is None:
        state["answer"] = "I could not generate an answer because no language model is configured."
        return state
    prompt = f"Answer the question using only this context. Cite no facts outside it.\nContext:\n{state['fused_context']}\nQuestion: {state['question']}"
    parts: list[str] = []
    async for chunk in llm.astream(prompt):
        content = str(getattr(chunk, "content", chunk))
        parts.append(content)
        if state.get("token_callback"):
            await state["token_callback"](content)
    state["answer"] = "".join(parts)
    state["error"] = None
    return state
