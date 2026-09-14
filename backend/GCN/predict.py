# predict.py
# -*- coding: utf-8 -*-
import torch
import numpy as np
import pickle
import importlib.util
import os
import sys

# ================ 关键修改 ================
# 获取当前脚本所在目录的绝对路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))  # backend/GNN
# 获取backend目录的路径
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)  # backend

print(f"脚本目录 (GNN): {SCRIPT_DIR}")
print(f"后端目录: {BACKEND_DIR}")

# 将GNN目录添加到Python路径
sys.path.insert(0, SCRIPT_DIR)
print(f"Python路径已添加: {SCRIPT_DIR}")
# ========================================

# 全局变量用于缓存模型
_model_instance = None
_device_instance = None

# 现在可以直接导入同目录的模块
try:
    from model_GNN_predict import GCNReg
    from generate_graph_dataset import graph_dataset, collate

    print("成功导入所有模块")
except ImportError as e:
    print(f"导入模块失败: {e}")
    print("尝试其他导入方式...")

    # 备用方案：使用importlib
    try:
        # 导入模型文件
        model_file_path = os.path.join(SCRIPT_DIR, 'model_GNN_predict.py')
        spec = importlib.util.spec_from_file_location("model_GNN_predict", model_file_path)
        model_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(model_module)
        GCNReg = model_module.GCNReg

        # 导入数据集生成文件
        gen_file_path = os.path.join(SCRIPT_DIR, 'generate_graph_dataset.py')
        spec_gen = importlib.util.spec_from_file_location("generate_graph_dataset", gen_file_path)
        gen_module = importlib.util.module_from_spec(spec_gen)
        spec_gen.loader.exec_module(gen_module)
        graph_dataset = gen_module.graph_dataset
        collate = gen_module.collate

        print("通过importlib导入成功")
    except Exception as e2:
        print(f"备用导入也失败: {e2}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


# 1. 加载模型
def load_model():
    """加载模型，自动选择设备"""
    global _model_instance, _device_instance

    # 如果已经加载过，直接返回
    if _model_instance is not None:
        return _model_instance, _device_instance

    # 检查GPU可用性
    if torch.cuda.is_available():
        device = torch.device('cuda:0')
        print(f"使用GPU: {torch.cuda.get_device_name(0)}")
    else:
        device = torch.device('cpu')
        print("使用CPU")

    # 模型文件路径 - gnn_logs在backend目录下
    model_filename = 'ep500bs5lr0.005kf5hu256cvid4.pth.tar'
    model_path = os.path.join(BACKEND_DIR, 'gnn_logs', model_filename)

    print(f"加载模型从: {model_path}")

    if not os.path.exists(model_path):
        print(f"错误: 模型文件不存在")
        print(f"尝试在以下位置查找:")
        print(f"1. {model_path}")

        # 尝试其他可能的位置
        alt_path = os.path.join(SCRIPT_DIR, model_filename)
        print(f"2. {alt_path}")

        # 列出backend目录内容
        print(f"backend目录内容: {os.listdir(BACKEND_DIR) if os.path.exists(BACKEND_DIR) else '目录不存在'}")

        return None, None

    try:
        # 加载训练好的模型权重
        checkpoint = torch.load(model_path, map_location=device)

        # 创建模型实例
        model = GCNReg(74, 256, 1, True)  # 参数和训练一致
        model.load_state_dict(checkpoint['state_dict'])
        model.to(device)
        model.eval()

        print(f"模型加载成功，设备: {device}")

        # 缓存模型
        _model_instance = model
        _device_instance = device

        return model, device
    except Exception as e:
        print(f"加载模型失败: {e}")
        import traceback
        traceback.print_exc()
        return None, None


# 2. 预测函数
def predict_smiles(model, device, smiles_list):
    """预测SMILES"""
    if model is None or device is None:
        print("模型或设备未初始化")
        return None

    predictions = []

    try:
        from torch.utils.data import DataLoader

        dummy_labels = np.zeros(len(smiles_list))
        dataset = graph_dataset(smiles_list, dummy_labels)

        dataloader = DataLoader(dataset, batch_size=5, collate_fn=collate, shuffle=False)

        with torch.no_grad():
            for graphs, _ in dataloader:
                graphs = graphs.to(device)
                outputs, _ = model(graphs)
                predictions.extend(outputs.cpu().numpy().flatten())

    except Exception as e:
        print(f"预测过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return None

    return predictions


# 3. 主函数 - 用于测试
def main():
    test_smiles = [
        "CCCCO",
        "CCCCCCCCCC",
        "CCO",
    ]

    print("加载模型...")
    model, device = load_model()

    if model is None:
        print("模型加载失败，退出")
        return

    print("开始预测...")
    results = predict_smiles(model, device, test_smiles)

    if results is not None:
        print("\n预测结果:")
        for smiles, pred in zip(test_smiles, results):
            print(f"{smiles}: {pred:.4f}")
    else:
        print("预测失败")


# 4. API接口函数 - 单例模式，自动缓存模型
def predict_property(smiles: str, model: int):
    """API接口函数 - 自动缓存模型，供Flask等后端调用"""
    try:
        print(f"收到预测请求，SMILES: {smiles}")

        # 加载模型（使用缓存）
        model, device = load_model()

        if model is None:
            return {"error": "模型加载失败", "smiles": smiles}

        # 预测
        results = predict_smiles(model, device, [smiles])

        if results is None or len(results) == 0:
            return {"error": "预测失败", "smiles": smiles}

        # 返回预测值
        return float(results[0])


    except Exception as e:
        print(f"预测过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "smiles": smiles}


# 5. 批量预测函数
def predict_property_batch(smiles_list: list):
    """批量预测"""
    try:
        print(f"收到批量预测请求，数量: {len(smiles_list)}")

        # 加载模型（使用缓存）
        model, device = load_model()

        if model is None:
            return {"error": "模型加载失败"}

        # 预测
        results = predict_smiles(model, device, smiles_list)

        if results is None or len(results) == 0:
            return {"error": "预测失败"}

        # 返回预测值
        predictions = []
        for smiles, pred in zip(smiles_list, results):
            predictions.append({
                "smiles": smiles,
                "prediction": float(pred)
            })

        return {
            "success": True,
            "predictions": predictions,
            "count": len(predictions),
            "device": str(device)
        }

    except Exception as e:
        print(f"批量预测过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


# 6. 模型信息函数
def get_model_info():
    """获取模型信息"""
    model, device = load_model()

    if model is None:
        return {"error": "模型未加载"}

    info = {
        "device": str(device),
        "model_loaded": model is not None,
        "model_path": os.path.join(BACKEND_DIR, 'gnn_logs', 'ep500bs5lr0.005kf5hu256cvid4.pth.tar'),
        "gpu_available": torch.cuda.is_available(),
        "cuda_device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0
    }

    if torch.cuda.is_available():
        info["gpu_name"] = torch.cuda.get_device_name(0)

    return info


if __name__ == "__main__":
    # 直接运行测试
    print("=" * 50)
    print("GNN预测模型测试")
    print("=" * 50)

    # 测试模型信息
    print("\n1. 模型信息:")
    info = get_model_info()
    for key, value in info.items():
        print(f"  {key}: {value}")

    # 测试单个预测
    print("\n2. 单个预测测试:")
    result = predict_property("CCCCO",1)
    print(f"  结果: {result}")

    # 测试批量预测
    print("\n3. 批量预测测试:")
    batch_result = predict_property_batch(["CCCCCCCCCC", "CCO", "CC(=O)O"])
    print(f"  结果: 成功预测 {batch_result.get('count', 0)} 个分子")

    print("\n测试完成!")







