from datetime import datetime, timezone

from app.db.mongo import get_database
from app.db.neo4j_client import get_driver
from app.ingestion.chunker import chunk_pages
from app.ingestion.embedder import embed_and_upsert
from app.ingestion.kg_extractor import extract_entities, extract_relations, write_entities
from app.ingestion.loaders import load_text


async def ingest_document(document_id: str, user_id: str, filename: str, content: bytes) -> None:
    database = get_database()
    documents = database["documents"]
    try:
        await documents.update_one({"_id": document_id, "userId": user_id}, {"$set": {"status": "processing"}})
        pages = load_text(filename, content)
        chunks = chunk_pages(pages)
        text = "\n".join(str(page["text"]) for page in pages)
        entities = extract_entities(text)
        relations = extract_relations(text, entities)
        driver = get_driver()
        try:
            await write_entities(driver, user_id, document_id, entities, relations)
        finally:
            await driver.close()
        await embed_and_upsert(chunks, document_id, user_id)
        await documents.update_one(
            {"_id": document_id, "userId": user_id},
            {"$set": {"status": "ready", "chunkCount": len(chunks), "entityCount": len(entities), "relationCount": len(relations), "updatedAt": datetime.now(timezone.utc)}},
        )
    except Exception as error:
        await documents.update_one({"_id": document_id, "userId": user_id}, {"$set": {"status": "failed", "error": str(error)}})
