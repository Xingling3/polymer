import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from pathlib import Path

from rdkit import Chem
from rdkit.Chem import AllChem

from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import MinMaxScaler


class MLPModelTrainer:
    def __init__(self, model_name: str = "mlp_model"):
        self.model_name = model_name
        self.model = None
        self.scaler = MinMaxScaler()
        self.model_path = None
        self.scaler_path = None
        self.results = {}

    def smiles2morgan(self, smiles_list):
        """将 SMILES 字符串转换为 Morgan 指纹"""
        fingerprints = []
        for smiles in smiles_list:
            try:
                mol = Chem.MolFromSmiles(smiles)
                if mol is not None:
                    fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=1024)
                    fingerprints.append(fp)
                else:
                    raise ValueError(f"Invalid SMILES: {smiles}")
            except Exception as e:
                raise ValueError(f"Error processing SMILES '{smiles}': {str(e)}")
        return fingerprints

    def train(self, train_data_path: str, test_data_path: str, 
              n_splits: int = 2, max_iter: int = 1000, 
              hidden_layer_sizes: tuple = (100, 50)):
        """
        训练模型
        
        Args:
            train_data_path: 训练数据 CSV 文件路径
            test_data_path: 测试数据 CSV 文件路径
            n_splits: 交叉验证折数
            max_iter: 最大迭代次数
            hidden_layer_sizes: 隐藏层大小配置
        
        Returns:
            dict: 包含训练结果的字典
        """
        try:
            # 读取数据
            train_data = pd.read_csv(train_data_path)
            test_data = pd.read_csv(test_data_path)
            
            # 合并数据用于训练
            data = pd.concat([train_data, test_data], ignore_index=True)
            
            if 'smiles' not in data.columns or 'tg' not in data.columns:
                raise ValueError("数据必须包含 'smiles' 和 'tg' 列")
            
            rmse_scores = []
            r2_scores = []
            
            # n-fold 交叉验证
            for i in range(n_splits):
                # 分割数据
                train_fold, val_fold = train_test_split(data, test_size=0.2, random_state=i)
                
                X_train, y_train = train_fold['smiles'], train_fold['tg']
                X_val, y_val = val_fold['smiles'], val_fold['tg']
                
                # 转换为 Morgan 指纹
                X_train_fp = self.smiles2morgan(X_train.tolist())
                X_val_fp = self.smiles2morgan(X_val.tolist())
                
                # 转换为 NumPy 数组
                X_train_array = np.array([np.array(fp) for fp in X_train_fp])
                X_val_array = np.array([np.array(fp) for fp in X_val_fp])
                y_train_array = y_train.values
                y_val_array = y_val.values
                
                # 数据归一化
                X_train_scaled = self.scaler.fit_transform(X_train_array)
                X_val_scaled = self.scaler.transform(X_val_array)
                
                # 训练模型
                self.model = MLPRegressor(
                    hidden_layer_sizes=hidden_layer_sizes,
                    max_iter=max_iter,
                    early_stopping=True,
                    validation_fraction=0.1,
                    random_state=i
                )
                self.model.fit(X_train_scaled, y_train_array)
                
                # 预测
                pred = self.model.predict(X_val_scaled)
                
                # 评估
                rmse = np.sqrt(mean_squared_error(y_val_array, pred))
                r2 = r2_score(y_val_array, pred)
                
                rmse_scores.append(rmse)
                r2_scores.append(abs(r2))
            
            # 保存最终模型（使用全部数据重新训练）
            X_all = data['smiles'].tolist()
            y_all = data['tg'].values
            
            X_all_fp = self.smiles2morgan(X_all)
            X_all_array = np.array([np.array(fp) for fp in X_all_fp])
            X_all_scaled = self.scaler.fit_transform(X_all_array)
            
            self.model = MLPRegressor(
                hidden_layer_sizes=hidden_layer_sizes,
                max_iter=max_iter,
                early_stopping=True,
                random_state=42
            )
            self.model.fit(X_all_scaled, y_all)
            
            self.results = {
                'avg_rmse': np.mean(rmse_scores),
                'avg_r2': np.mean(r2_scores),
                'rmse_scores': rmse_scores,
                'r2_scores': r2_scores,
                'n_splits': n_splits,
                'model_name': self.model_name,
                'train_time': datetime.now().isoformat()
            }
            
            return self.results
            
        except Exception as e:
            raise Exception(f"训练失败: {str(e)}")

    def save_model(self, save_dir: str = "E:/project1/backend/machine"):
        """保存模型和 scaler"""
        try:
            Path(save_dir).mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            model_filename = f"{self.model_name}_{timestamp}.pkl"
            scaler_filename = f"{self.model_name}_scaler_{timestamp}.pkl"
            
            self.model_path = os.path.join(save_dir, model_filename)
            self.scaler_path = os.path.join(save_dir, scaler_filename)
            
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            
            return {
                'model_path': self.model_path,
                'scaler_path': self.scaler_path,
                'message': '模型保存成功'
            }
        except Exception as e:
            raise Exception(f"保存模型失败: {str(e)}")

    def load_model(self, model_path: str, scaler_path: str):
        """加载保存的模型"""
        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.model_path = model_path
            self.scaler_path = scaler_path
            return True
        except Exception as e:
            raise Exception(f"加载模型失败: {str(e)}")

    def predict(self, smiles: str):
        """
        使用训练好的模型进行预测
        
        Args:
            smiles: SMILES 字符串
            
        Returns:
            float: 预测的 tg 温度值
        """
        if self.model is None or self.scaler is None:
            raise ValueError("模型未加载。请先训练或加载模型。")
        
        try:
            # 转换为 Morgan 指纹
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                raise ValueError(f"无效的 SMILES: {smiles}")
            
            fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=1024)
            X = np.array([np.array(fp)])
            
            # 归一化
            X_scaled = self.scaler.transform(X)
            
            # 预测
            prediction = self.model.predict(X_scaled)[0]
            
            return float(prediction)
        except Exception as e:
            raise ValueError(f"预测失败: {str(e)}")
