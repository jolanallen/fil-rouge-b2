from __future__ import annotations

import json
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.api.routes import router
from app.database.base import Base
from app.database.session import get_session_factory
from app.utils.logging import get_logger, setup_logging

logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Starting Immopredict API")
    async with get_session_factory()() as session:
        pass
    yield
    logger.info("Shutting down Immopredict API")


class TextPlainToJSONMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = MutableHeaders(scope=scope)
        content_type = headers.get("content-type", "")

        if "text/plain" in content_type:
            body_chunks: list[bytes] = []
            more_body = True

            while more_body:
                message = await receive()
                body_chunks.append(message.get("body", b""))
                more_body = message.get("more_body", False)

            body = b"".join(body_chunks)

            try:
                json.loads(body)
                headers["content-type"] = "application/json"
            except (json.JSONDecodeError, UnicodeDecodeError):
                pass

            async def wrapped_receive() -> Message:
                return {"type": "http.request", "body": body, "more_body": False}

            await self.app(scope, wrapped_receive, send)
        else:
            await self.app(scope, receive, send)


app = FastAPI(
    title="Immopredict API",
    description="French real estate analysis & prediction API using DVF data",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TextPlainToJSONMiddleware)

app.include_router(router, prefix="/api/v1")
