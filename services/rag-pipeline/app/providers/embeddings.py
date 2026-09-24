from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.core.config import get_settings
from app.core.logging import logger


class FallbackEmbeddings:
    def __init__(self, models, api_key):
        self.models = models
        self.api_key = api_key

    def _provider(self, model_name):
        return GoogleGenerativeAIEmbeddings(model=model_name, google_api_key=self.api_key)

    async def aembed_documents(self, texts):
        last_error = None
        for model_name in self.models:
            try:
                logger.info("Trying Gemini embedding model", extra={"model": model_name})
                return await self._provider(model_name).aembed_documents(texts)
            except Exception as error:
                last_error = error
                logger.warning("Gemini embedding model failed; trying fallback", extra={"model": model_name, "error": str(error)})
        raise RuntimeError("All configured Gemini embedding models failed") from last_error

    async def aembed_query(self, text):
        last_error = None
        for model_name in self.models:
            try:
                logger.info("Trying Gemini query embedding model", extra={"model": model_name})
                return await self._provider(model_name).aembed_query(text)
            except Exception as error:
                last_error = error
                logger.warning("Gemini query embedding model failed; trying fallback", extra={"model": model_name, "error": str(error)})
        raise RuntimeError("All configured Gemini embedding models failed") from last_error


def get_embeddings():
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is required for embeddings")
    models = [model.strip() for model in settings.gemini_embedding_models.split(",") if model.strip()]
    if not models:
        raise RuntimeError("GEMINI_EMBEDDING_MODELS must contain at least one model")
    return FallbackEmbeddings(models, settings.gemini_api_key)
