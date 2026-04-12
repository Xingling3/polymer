# models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey,Float
from datetime import datetime
from database import Base
from sqlalchemy.sql import func
from sqlalchemy import UniqueConstraint

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

class Model(Base):
    __tablename__ = "user_models"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uix_user_model_name"),
    )
    id = Column(Integer, primary_key=True, index=True)
    user_id= Column(Integer, ForeignKey("users.id"))
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    epoch=Column(Integer)
    batch=Column(Integer)
    learning_rate=Column(Float)
    hidden_layer=Column(Integer)
    cross_validate=Column(String)
    test_proportion=Column(Float)
    patience=Column(Integer)
    rmse_path=Column(String)
    predict_path=Column(String)

class   Dataset(Base):
    __tablename__ = "dataset"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    url = Column(String)

class   AugmentDataset(Base):
    __tablename__ = "augment_dataset"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)
    url = Column(String)

class   Poly(Base):
    __tablename__ = "poly"
    id = Column(Integer, primary_key=True, index=True)
    smiles = Column(String)
    tg=Column(Float)

class   Administer(Base):
    __tablename__ = "administer"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

class MLModel(Base):
    __tablename__ = "ml_models"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class TrainingResult(Base):
    __tablename__ = "training_results"
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    model_id = Column(Integer, ForeignKey("ml_models.id"))
    rmse = Column(Float)
    r_squared = Column(Float)

class DatasetFeature(Base):
    __tablename__ = "dataset_features"
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("augment_dataset.id"))
    mean = Column(Float)
    max = Column(Float)
    min = Column(Float)
    median = Column(Float)
    pcd = Column(Float)

