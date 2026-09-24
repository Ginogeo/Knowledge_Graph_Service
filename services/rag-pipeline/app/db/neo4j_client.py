from neo4j import AsyncGraphDatabase

from app.core.config import get_settings


def get_driver():
    settings = get_settings()
    return AsyncGraphDatabase.driver(settings.neo4j_uri, auth=(settings.neo4j_user, settings.neo4j_password))
