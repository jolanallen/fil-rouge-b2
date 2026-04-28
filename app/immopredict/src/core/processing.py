import polars as pl
import requests
from src.core.interfaces import DataSource, Predictor

class ImmoGouvDataSource(DataSource):
    """
    Fetches real estate data from the official French API.
    Uses Data.gouv DVF (Demande de Valeur Foncière) API.
    """
    def __init__(self):
        # Base URL for the DVF API (standard public endpoint)
        self.base_url = "https://api.cquest.org/dvf" 

    def fetch_data(self, params: dict) -> pl.DataFrame:
        """
        Fetches data based on city code or department.
        Example params: {'code_postal': '75001'}
        """
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json().get("features", [])
            
            # Extract relevant fields for calculation (e.g., surface vs price)
            records = []
            for item in data:
                props = item.get("properties", {})
                valeur = props.get("valeur_fonciere")
                surface = props.get("surface_relle_bati")
                if valeur and surface:
                    records.append({
                        "surface": float(surface),
                        "prix": float(valeur)
                    })
            
            return pl.DataFrame(records)
        except Exception as e:
            print(f"Error fetching data: {e}")
            return pl.DataFrame()

class SimpleLinearPredictor(Predictor):
    """
    Performs a basic manual linear regression: y = ax + b
    No AI libraries used, just pure math.
    """
    def __init__(self):
        self.a = 0.0
        self.b = 0.0

    def train(self, df: pl.DataFrame):
        """
        Trains the model using the Least Squares Method.
        df must contain 'surface' (x) and 'prix' (y) columns.
        """
        if df.is_empty() or df.height < 2:
            return

        x = df["surface"]
        y = df["prix"]
        n = len(x)

        sum_x = x.sum()
        sum_y = y.sum()
        sum_xy = (x * y).sum()
        sum_xx = (x * x).sum()

        # Formula for 'a' (slope)
        denom = (n * sum_xx - (sum_x ** 2))
        if denom == 0:
            self.a = 0.0
        else:
            self.a = (n * sum_xy - (sum_x * sum_y)) / denom

        # Formula for 'b' (intercept)
        self.b = (sum_y - (self.a * sum_x)) / n

    def predict(self, x_value: float) -> float:
        """Predicts the price for a given surface."""
        return self.a * x_value + self.b

    def get_params(self) -> dict:
        return {"slope": self.a, "intercept": self.b}
