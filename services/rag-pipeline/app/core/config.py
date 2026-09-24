from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    port: int = 8000
    mongodb_uri: str
    mongodb_database_name: str = "financial-knowledge-graph"
    neo4j_uri: str
    neo4j_user: str
    neo4j_password: str
    pinecone_api_key: str
    pinecone_index_name: str = "financial-kg"
    llm_provider: Literal["gemini", "openrouter", "nvidia_nim"] = "gemini"
    gemini_chat_models: str = "gemini-2.5-flash,gemini-2.5-flash-lite,gemini-3.5-flash"
    gemini_embedding_models: str = "gemini-embedding-001,text-embedding-004"
    gemini_api_key: str | None = None
    openrouter_api_key: str | None = None
    nvidia_nim_api_key: str | None = None
    nvidia_nim_base_url: str = "https://integrate.api.nvidia.com/v1"
    internal_service_key: str

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
