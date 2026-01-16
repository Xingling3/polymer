from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import User
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from GCN.predict import predict_property
from jose import jwt
from auth import get_current_user, SECRET_KEY, ALGORITHM
from models import User, PredictionHistory

import sqlite3
Base.metadata.create_all(bind=engine)  # 创建表

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 依赖：获取数据库 session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 请求体
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class PredictRequest(BaseModel):
    smiles: str
    model: int
@app.post("/api/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = jwt.encode(
        {"user_id": user.id},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.post("/api/register")
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # 1. 检查用户名是否存在
    user = db.query(User).filter(User.username == data.username).first()
    if user:
        raise HTTPException(status_code=400, detail="用户名已存在")

    # 2. 创建用户（暂时不加密，先跑通）
    new_user = User(
        username=data.username,
        password=data.password
    )
    db.add(new_user)
    db.commit()

    return {"message": "注册成功"}

@app.post("/api/predict")
def predict(
    data: PredictRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        result = predict_property(data.smiles, data.model)

        history = PredictionHistory(
            user_id=user.id,
            smiles=data.smiles,
            model=data.model,
            result=str(result),
        )

        db.add(history)
        db.commit()

        return {"result": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/api/history")
def get_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == user.id)
        .order_by(PredictionHistory.created_at.desc())
        .all()
    )

    return [
        {
            "smiles": r.smiles,
            "model": r.model,
            "result": r.result,
            "time": r.created_at,
        }
        for r in records
    ]
