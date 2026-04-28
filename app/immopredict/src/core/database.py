import json
import redis
from src.core.interfaces import DataStorage

class RedisStorage(DataStorage):
    """
    Implementation of DataStorage using Redis.
    Respects the Interface Segregation and Dependency Inversion principles.
    """
    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0):
        try:
            self.client = redis.Redis(
                host=host, 
                port=port, 
                db=db, 
                decode_responses=True
            )
        except Exception as e:
            # In a real scenario, we'd use the logger here
            print(f"Failed to connect to Redis: {e}")
            raise

    def save_stats(self, key: str, data: dict):
        """Serializes the dictionary to JSON and saves it in Redis."""
        try:
            self.client.set(key, json.dumps(data))
        except redis.RedisError as e:
            print(f"Error saving to Redis: {e}")

    def get_stats(self, key: str) -> dict:
        """Retrieves and deserializes the JSON data from Redis."""
        try:
            data = self.client.get(key)
            if data:
                return json.loads(data)
            return {}
        except (redis.RedisError, json.JSONDecodeError) as e:
            print(f"Error retrieving from Redis: {e}")
            return {}
