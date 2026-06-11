from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

from app.utils.logging import get_logger

logger = get_logger("ml_predictor")


class PricePredictor:
    def __init__(self) -> None:
        self.model = LinearRegression()

    def train(self, df: pd.DataFrame) -> dict:
        if df.empty or len(df) < 5:
            logger.warning(
                "Not enough data to train model (need >= 5 rows, got %d)", len(df)
            )
            return {"slope": 0.0, "intercept": 0.0, "score": 0.0}

        df = df.copy()
        df["year"] = pd.to_datetime(df["mutation_date"]).dt.year
        df = df.dropna(subset=["year", "price_per_m2"])

        if df.empty or df["year"].nunique() < 2:
            logger.warning("Need at least 2 distinct years for training")
            return {"slope": 0.0, "intercept": 0.0, "score": 0.0}

        X = df[["year"]].values
        y = df["price_per_m2"].values

        self.model.fit(X, y)
        score = float(self.model.score(X, y))

        slope = float(self.model.coef_[0])
        intercept = float(self.model.intercept_)

        logger.info(
            "Model trained: slope=%.2f, intercept=%.2f, R²=%.4f",
            slope,
            intercept,
            score,
        )

        return {
            "slope": slope,
            "intercept": intercept,
            "score": score,
        }

    def predict_next_year(self, df: pd.DataFrame) -> float | None:
        if df.empty or len(df) < 5:
            return None

        df = df.copy()
        df["year"] = pd.to_datetime(df["mutation_date"]).dt.year
        df = df.dropna(subset=["year", "price_per_m2"])

        if df.empty or df["year"].nunique() < 2:
            return None

        max_year = int(df["year"].max())
        next_year = max_year + 1

        params = self.train(df)
        if params["slope"] == 0.0 and params["intercept"] == 0.0:
            return None

        predicted = params["slope"] * next_year + params["intercept"]
        return round(float(predicted), 2)

    def compute_yearly_growth(self, df: pd.DataFrame) -> float:
        if df.empty:
            return 0.0
        df = df.copy()
        df["year"] = pd.to_datetime(df["mutation_date"]).dt.year
        yearly_avg = df.groupby("year")["price_per_m2"].mean()
        if len(yearly_avg) < 2:
            return 0.0
        first, last = yearly_avg.iloc[0], yearly_avg.iloc[-1]
        if first == 0:
            return 0.0
        total_growth = (last - first) / first
        years_span = len(yearly_avg)
        return round(float(total_growth / years_span * 100), 2)
