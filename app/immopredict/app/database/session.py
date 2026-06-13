from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

_async_engine = create_async_engine(
    settings.database_url.replace("mysql+pymysql://", "mysql+aiomysql://"),
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    echo=False,
)

_async_session_factory = async_sessionmaker(
    _async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with _async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    return _async_session_factory
