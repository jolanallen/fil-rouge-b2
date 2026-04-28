from abc import ABC, abstractmethod

class DataStorage(ABC):
    @abstractmethod
    def save_stats(self, key: str, data: dict):
        pass

    @abstractmethod
    def get_stats(self, key: str) -> dict:
        pass

class DataSource(ABC):
    @abstractmethod
    def fetch_data(self, params: dict) -> any:
        pass

class Predictor(ABC):
    @abstractmethod
    def train(self, data: any):
        pass

    @abstractmethod
    def predict(self, input_data: any) -> any:
        pass
