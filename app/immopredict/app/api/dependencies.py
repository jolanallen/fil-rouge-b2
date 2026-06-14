from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.database.session import get_async_session, get_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_async_session():
        yield session


def get_session_factory_dependency() -> async_sessionmaker[AsyncSession]:
    return get_session_factory()
