import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:Lhw4bJEg8rCvMIm7d7gcY9uTesrDkqdr@dpg-d42gdhngi27c73c50650-a/ecommerce_w12zpostgresql://user:Lhw4bJEg8rCvMIm7d7gcY9uTesrDkqdr@dpg-d42gdhngi27c73c50650-a/ecommerce_w12z")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "5d0254f31c923e14d56914bd09441ae31fad7892fbc562d53497773eb24b698f")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings() 