from __future__ import annotations

from typing import Any

import pandas as pd

from app.utils.logging import get_logger

logger = get_logger("cleaning_service")

PROPERTY_TYPE_MAP = {
    "1": "Appartement",
    "2": "Maison",
    "3": "Dépendance",
    "4": "Local industriel",
    "5": "Terrain",
    "6": "Parking",
    "7": "Bureau",
}


class CleaningService:
    def clean_transactions(self, rows: list[dict[str, Any]]) -> pd.DataFrame:
        if not rows:
            return pd.DataFrame()

        df = pd.DataFrame(rows)

        df = self._parse_dates(df)
        df = self._parse_numeric(df)
        df = self._map_property_types(df)
        df = self._filter_invalid_coordinates(df)
        df = self._remove_duplicates(df)
        df = self._handle_missing_values(df)
        df = self._compute_price_per_m2(df)
        df = self._normalize_prices(df)

        logger.info("Cleaning complete: %d valid transactions", len(df))
        return df

    def _parse_dates(self, df: pd.DataFrame) -> pd.DataFrame:
        if "mutation_date" in df.columns:
            df["mutation_date"] = pd.to_datetime(
                df["mutation_date"], errors="coerce", dayfirst=True
            )
        return df

    def _parse_numeric(self, df: pd.DataFrame) -> pd.DataFrame:
        for col in ["price", "surface", "latitude", "longitude"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        return df

    def _map_property_types(self, df: pd.DataFrame) -> pd.DataFrame:
        if "property_type" in df.columns:
            df["property_type"] = (
                df["property_type"]
                .astype(str)
                .map(PROPERTY_TYPE_MAP)
                .fillna(df["property_type"])
            )
        return df

    def _filter_invalid_coordinates(self, df: pd.DataFrame) -> pd.DataFrame:
        before = len(df)
        if "latitude" in df.columns and "longitude" in df.columns:
            df = df[
                (df["latitude"].between(41.0, 52.0))
                & (df["longitude"].between(-5.0, 10.0))
            ]
        removed = before - len(df)
        if removed:
            logger.debug("Removed %d rows with invalid coordinates", removed)
        return df

    def _remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        before = len(df)
        subset = [
            c for c in ["id_mutation", "price", "surface", "city"] if c in df.columns
        ]
        if subset:
            df = df.drop_duplicates(subset=subset, keep="first")
        removed = before - len(df)
        if removed:
            logger.debug("Removed %d duplicate rows", removed)
        return df

    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        for col in ["mutation_date", "price"]:
            if col in df.columns:
                df = df.dropna(subset=[col])
        if "surface" in df.columns:
            df.loc[df["surface"] <= 0, "surface"] = None
        return df

    def _compute_price_per_m2(self, df: pd.DataFrame) -> pd.DataFrame:
        if "price" in df.columns and "surface" in df.columns:
            mask = df["price"].notna() & df["surface"].notna() & (df["surface"] > 0)
            df["price_per_m2"] = None
            df.loc[mask, "price_per_m2"] = (
                df.loc[mask, "price"] / df.loc[mask, "surface"]
            )
            df = df.dropna(subset=["price_per_m2"])
        return df

    def _normalize_prices(self, df: pd.DataFrame) -> pd.DataFrame:
        if "price" in df.columns:
            q_low = df["price"].quantile(0.01)
            q_high = df["price"].quantile(0.99)
            df = df[(df["price"] >= q_low) & (df["price"] <= q_high)]
        return df
