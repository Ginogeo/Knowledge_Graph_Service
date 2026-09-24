from pinecone import Pinecone, ServerlessSpec

from app.core.config import get_settings


def get_index():
    settings = get_settings()
    client = Pinecone(api_key=settings.pinecone_api_key)
    if settings.pinecone_index_name not in [index["name"] for index in client.list_indexes()]:
        client.create_index(name=settings.pinecone_index_name, dimension=768, metric="cosine", spec=ServerlessSpec(cloud="aws", region="us-east-1"))
    return client.Index(settings.pinecone_index_name)
