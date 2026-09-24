from app.graph.state import QAState


async def fuse_context(state: QAState) -> QAState:
    graph_lines = [f"Entity {item['entity']} {item['relation']} {item['related']}" for item in state["graph_context"]]
    vector_lines = [f"Document {item.get('documentId')} page {item.get('page')}: {item.get('text', '')}" for item in state["vector_context"]]
    state["fused_context"] = "\n".join(dict.fromkeys([*graph_lines, *vector_lines]))[:12000]
    return state
