from collections.abc import Sequence

from app.db.pinecone_client import get_index
from app.providers.embeddings import get_embeddings


async def embed_and_upsert(chunks: Sequence, document_id: str, user_id: str) -> int:
    if not chunks:
        return 0
    embeddings = get_embeddings()
    vectors = await embeddings.aembed_documents([chunk.text for chunk in chunks])
    index = get_index()
    records = [
        {
            "id": f"{document_id}:{chunk.position}",
            "values": vector,
            "metadata": {
                "documentId": document_id,
                "userId": user_id,
                "chunkText": chunk.text,
                "page": chunk.page,
                "position": chunk.position,
            },
        }
        for chunk, vector in zip(chunks, vectors, strict=True)
    ]
    index.upsert(vectors=records, namespace=user_id)
    return len(records)


async def similarity_search(query: str, user_id: str, top_k: int = 5) -> list[dict]:
    embeddings = get_embeddings()
    query_vector = (await embeddings.aembed_query(query))
    matches = get_index().query(vector=query_vector, top_k=top_k, include_metadata=True, namespace=user_id).get("matches", [])
    return [
        {"text": match.get("metadata", {}).get("chunkText", ""), "documentId": match.get("metadata", {}).get("documentId"), "page": match.get("metadata", {}).get("page"), "score": match.get("score", 0)}
        for match in matches
    ]
