from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from app.core.config import get_settings
from app.core.logging import logger


class FallbackChatModel:
    def __init__(self, models):
        self.models = models

    async def ainvoke(self, prompt):
        last_error = None
        for model_name in self.models:
            try:
                logger.info("Trying Gemini chat model", extra={"model": model_name})
                return await ChatGoogleGenerativeAI(model=model_name, google_api_key=get_settings().gemini_api_key, streaming=True).ainvoke(prompt)
            except Exception as error:
                last_error = error
                logger.warning("Gemini chat model failed; trying fallback", extra={"model": model_name, "error": str(error)})
        raise RuntimeError("All configured Gemini chat models failed") from last_error

    async def astream(self, prompt):
        last_error = None
        for model_name in self.models:
            try:
                logger.info("Trying Gemini streaming chat model", extra={"model": model_name})
                async for chunk in ChatGoogleGenerativeAI(model=model_name, google_api_key=get_settings().gemini_api_key, streaming=True).astream(prompt):
                    yield chunk
                return
            except Exception as error:
                last_error = error
                logger.warning("Gemini streaming model failed; trying fallback", extra={"model": model_name, "error": str(error)})
        raise RuntimeError("All configured Gemini chat models failed") from last_error


def get_llm():
    settings = get_settings()
    if settings.llm_provider == "gemini":
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is required for gemini")
        models = [model.strip() for model in settings.gemini_chat_models.split(",") if model.strip()]
        if not models:
            raise RuntimeError("GEMINI_CHAT_MODELS must contain at least one model")
        return FallbackChatModel(models)
    if settings.llm_provider == "openrouter":
        if not settings.openrouter_api_key:
            raise RuntimeError("OPENROUTER_API_KEY is required for openrouter")
        return ChatOpenAI(api_key=settings.openrouter_api_key, base_url="https://openrouter.ai/api/v1", model="openai/gpt-4o-mini", streaming=True)
    if not settings.nvidia_nim_api_key:
        raise RuntimeError("NVIDIA_NIM_API_KEY is required for nvidia_nim")
    return ChatOpenAI(api_key=settings.nvidia_nim_api_key, base_url=settings.nvidia_nim_base_url, model="meta/llama-3.1-8b-instruct", streaming=True)
