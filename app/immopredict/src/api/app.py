import os
from flask import Flask
from src.core.database import RedisStorage
from src.api.routes import configure_routes
from src.core.logger import setup_logger

def create_app():
    app = Flask(__name__)
    
    # Initialize logger
    logger = setup_logger("immopredict")
    
    # Initialize storage (Dependency Injection)
    # Using environment variables for Docker compatibility
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    
    storage = RedisStorage(host=redis_host, port=redis_port)
    
    # Inject dependency into routes
    configure_routes(app, storage)
    
    return app
