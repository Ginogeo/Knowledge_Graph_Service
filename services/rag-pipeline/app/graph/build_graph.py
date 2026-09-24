from langgraph.graph import END, START, StateGraph

from app.graph.nodes.analyze_query import analyze_query
from app.graph.nodes.fuse_context import fuse_context
from app.graph.nodes.generate_answer import generate_answer
from app.graph.nodes.handle_error import handle_error
from app.graph.nodes.retrieve_graph import retrieve_graph
from app.graph.nodes.retrieve_vector import retrieve_vector
from app.graph.state import QAState
from app.core.logging import logger


def build_graph():
    async def guarded(node, state: QAState) -> QAState:
        try:
            return await node(state)
        except Exception as error:
            logger.exception("RAG graph node failed", extra={"node": getattr(node, "__name__", "unknown"), "conversation_id": state.get("conversation_id")})
            state["error"] = str(error)
            return state

    def guarded_node(node):
        async def run(state: QAState) -> QAState:
            return await guarded(node, state)

        return run

    graph = StateGraph(QAState)
    graph.add_node("analyze_query", guarded_node(analyze_query))
    graph.add_node("retrieve_graph", guarded_node(retrieve_graph))
    graph.add_node("retrieve_vector", guarded_node(retrieve_vector))
    graph.add_node("fuse_context", guarded_node(fuse_context))
    graph.add_node("generate_answer", guarded_node(generate_answer))
    graph.add_node("handle_error", handle_error)
    graph.add_edge(START, "analyze_query")
    graph.add_edge("analyze_query", "retrieve_graph")
    graph.add_edge("retrieve_graph", "retrieve_vector")
    graph.add_edge("retrieve_vector", "fuse_context")
    graph.add_edge("fuse_context", "generate_answer")
    graph.add_conditional_edges("generate_answer", lambda state: "handle_error" if state.get("error") else END, {"handle_error": "handle_error", END: END})
    graph.add_edge("handle_error", END)
    return graph.compile()
