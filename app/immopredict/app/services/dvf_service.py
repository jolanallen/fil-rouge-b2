from __future__ import annotations

import asyncio
import csv
import gzip
import io
from typing import Any

import httpx

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger("dvf_service")

DVF_COLUMNS = {
    "id_mutation": "id_mutation",
    "date_mutation": "mutation_date",
    "valeur_fonciere": "price",
    "surface_reelle_bati": "surface",
    "type_local": "property_type",
    "nom_commune": "city",
    "code_postal": "postal_code",
    "code_departement": "department",
    "latitude": "latitude",
    "longitude": "longitude",
}

YEARS = range(2021, 2026)


class DVFService:
    def __init__(self) -> None:
        self.base_url = settings.dvf_api_base_url
        self.timeout = settings.dvf_api_timeout
        self.client = httpx.AsyncClient(timeout=httpx.Timeout(self.timeout), follow_redirects=True)

    async def close(self) -> None:
        await self.client.aclose()

    async def fetch_department_data(self, department: str, year: int) -> list[dict[str, Any]]:
        url = f"{self.base_url}/{year}/departements/{department}.csv.gz"
        logger.info("Fetching DVF data for department %s, year %d", department, year)
        return await self._fetch_csv(url, department)

    async def fetch_all_years(self, department: str) -> list[dict[str, Any]]:
        all_rows: list[dict[str, Any]] = []
        for year in YEARS:
            rows = await self.fetch_department_data(department, year)
            if not rows:
                logger.warning("No data for department %s, year %d", department, year)
            all_rows.extend(rows)
        logger.info(
            "Fetched %d total rows for department %s across years %d-%d",
            len(all_rows),
            department,
            YEARS[0],
            YEARS[-1],
        )
        return all_rows

    async def _fetch_csv(
        self, url: str, department: str
    ) -> list[dict[str, Any]]:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self.client.get(url)
                response.raise_for_status()
                content = response.content
                if content[:2] == b"\x1f\x8b":
                    try:
                        content = gzip.decompress(content)
                    except gzip.BadGzipFile as e:
                        logger.error("Bad gzip content from %s: %s", url, e)
                        return []
                text = content.decode("utf-8")
                return self._parse_csv(text, department)
            except (httpx.HTTPStatusError, httpx.RequestError) as e:
                if isinstance(e, httpx.HTTPStatusError) and e.response.status_code == 404:
                    logger.warning("No data found at %s (404)", url)
                    return []
                logger.error(
                    "HTTP error fetching %s (attempt %d/%d): %s",
                    url,
                    attempt + 1,
                    max_retries,
                    e,
                )
            except (UnicodeDecodeError, ValueError) as e:
                logger.error(
                    "Parse error for %s (attempt %d/%d): %s",
                    url,
                    attempt + 1,
                    max_retries,
                    e,
                )
            if attempt < max_retries - 1:
                wait = 2**attempt
                logger.info("Retrying in %ds...", wait)
                await asyncio.sleep(wait)
        logger.error("Failed to fetch %s after %d attempts", url, max_retries)
        return []

    def _parse_csv(
        self, text: str, department: str
    ) -> list[dict[str, Any]]:
        reader = csv.DictReader(io.StringIO(text))
        rows: list[dict[str, Any]] = []
        for row in reader:
            mapped: dict[str, Any] = {
                "department": department,
            }
            for csv_col, model_col in DVF_COLUMNS.items():
                val = row.get(csv_col, "").strip()
                if val == "":
                    mapped[model_col] = None
                else:
                    mapped[model_col] = val
            rows.append(mapped)
        return rows
