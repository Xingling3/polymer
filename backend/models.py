# models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    smiles = Column(String)
    model = Column(Integer)
    result = Column(String)
    created_at = Column(DateTime, server_default=func.now())
