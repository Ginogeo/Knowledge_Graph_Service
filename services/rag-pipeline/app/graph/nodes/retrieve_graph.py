import re

from app.graph.state import QAState
from app.db.neo4j_client import get_driver


async def retrieve_graph(state: QAState) -> QAState:
    terms = re.findall(r"\b[A-Z][A-Za-z0-9&.-]{2,}\b", state["rewritten_query"])
    if not terms:
        state["graph_context"] = []
        return state
    driver = get_driver()
    try:
        async with driver.session() as session:
            result = await session.run(
                "MATCH (entity:Entity {userId: $user_id})-[relation]-(related:Entity {userId: $user_id}) "
                "WHERE entity.name IN $names RETURN entity.name AS entity, type(relation) AS relation, related.name AS related LIMIT 20",
                user_id=state["user_id"], names=terms,
            )
            state["graph_context"] = [record async for record in result]
    finally:
        await driver.close()
    return state
