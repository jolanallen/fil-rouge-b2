from __future__ import annotations

import asyncio
import json
from typing import AsyncGenerator


async def event_stream(
    task_id: str,
    progress_getter,
    poll_interval: float = 0.5,
) -> AsyncGenerator[str, None]:
    yield f"event: connected\ndata: {json.dumps({'task_id': task_id})}\n\n"
    while True:
        data = await progress_getter(task_id)
        if data is None:
            yield f"event: error\ndata: {json.dumps({'message': 'task not found'})}\n\n"
            break
        event = {
            "status": data.get("status", "unknown"),
            "progress": data.get("progress", 0),
            "current_city": data.get("current_city", ""),
            "message": data.get("message", ""),
            "department": data.get("department", ""),
        }
        yield f"event: progress\ndata: {json.dumps(event)}\n\n"
        if data.get("status") in ("completed", "failed"):
            if data.get("status") == "completed":
                yield f"event: completed\ndata: {json.dumps(event)}\n\n"
            else:
                yield f"event: failed\ndata: {json.dumps(event)}\n\n"
            break
        await asyncio.sleep(poll_interval)
