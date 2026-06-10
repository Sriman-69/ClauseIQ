from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ClauseIQ"
    API_V1_STR: str = "/api/v1"
    
    # Backend CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]

    # Database
    DATABASE_URL: str = "sqlite:///./test.db"

    # Gemini
    GEMINI_API_KEY: str = "YOUR_GEMINI_API_KEY"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
