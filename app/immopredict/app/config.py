from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = (
        "mysql+pymysql://immopredict:immopredict@localhost:3306/immopredict"
    )
    dvf_api_base_url: str = "https://files.data.gouv.fr/geo-dvf/latest/csv"
    dvf_api_timeout: int = 30
    log_level: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
