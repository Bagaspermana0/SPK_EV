import os

class Config:
    # Database connection
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 
        'postgresql://postgres:pemalang123@localhost:5432/spk_mobil_listrik'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
