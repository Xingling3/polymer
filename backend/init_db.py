from database import SessionLocal, engine
from models import Base, Administer, Dataset, AugmentDataset, Poly, MLModel, TrainingResult, DatasetFeature


Base.metadata.create_all(bind=engine)

db = SessionLocal()

# 插入数据
# db.add(Administer(username="admin", password="123456"))
# db.add(Dataset(user_id=1, url="/data/train.csv"))
# db.add(AugmentDataset(user_id=1, type="x2", url="/data/aug.csv"))
# db.add(Poly(smiles="CCO", tg=120.5))

# 示例数据
db.add(MLModel(name="MLP Model 1", user_id=1, path="/models/mlp1.pkl"))
db.add(TrainingResult(model_name="MLP Model 1", model_id=1, rmse=0.5, r_squared=0.85))
db.add(DatasetFeature(dataset_id=1, mean=10.5, max=20.0, min=5.0, median=10.0, pcd=1.2))

db.commit()
db.close()

print("初始化完成！")