import re


def extract_entities(text: str) -> list[dict[str, str]]:
    names = sorted(set(re.findall(r"\b[A-Z][A-Za-z0-9&.-]{2,}(?:\s+[A-Z][A-Za-z0-9&.-]{2,})*", text)))
    return [{"name": name, "type": "organization"} for name in names]


def extract_relations(text: str, entities: list[dict[str, str]]) -> list[dict[str, str]]:
    names = [entity["name"] for entity in entities]
    relations: list[dict[str, str]] = []
    for sentence in re.split(r"[.!?]", text):
        present = [name for name in names if name in sentence]
        for source, target in zip(present, present[1:]):
            relations.append({"source": source, "target": target, "type": "mentioned_with"})
    return relations


async def write_entities(driver, user_id: str, document_id: str, entities: list[dict[str, str]], relations: list[dict[str, str]]) -> None:
    async with driver.session() as session:
        for entity in entities:
            await session.run(
                "MERGE (e:Entity {name: $name, userId: $user_id}) SET e.type = $type, e.sourceDocId = $document_id",
                name=entity["name"], user_id=user_id, type=entity["type"], document_id=document_id,
            )
        for relation in relations:
            await session.run(
                "MATCH (source:Entity {name: $source, userId: $user_id}), (target:Entity {name: $target, userId: $user_id}) "
                "MERGE (source)-[r:MENTIONED_WITH {sourceDocId: $document_id}]->(target) SET r.type = $type",
                source=relation["source"], target=relation["target"], user_id=user_id,
                document_id=document_id, type=relation["type"],
            )
