# predict_gpu.py
# -*- coding: utf-8 -*-
import torch
import numpy as np
import pickle


# 1. 加载模型
def load_model(model_path):
    """加载模型到GPU"""
    device = torch.device('cuda:0')  # GPU

    # 加载训练好的模型权重
    checkpoint = torch.load(model_path, map_location=device)

    # 导入模型类
    from model_GNN_predict import GCNReg  # 根据你的模型类修改
    model = GCNReg(74, 256, 1, True)  # 参数和训练一致

    model.load_state_dict(checkpoint['state_dict'])
    model.to(device)
    model.eval()

    return model, device


# 2. 预测函数
def predict_smiles(model, device, smiles_list):
    """用GPU预测SMILES"""
    predictions = []

    from generate_graph_dataset import graph_dataset, collate
    from torch.utils.data import DataLoader

    dummy_labels = np.zeros(len(smiles_list))
    dataset = graph_dataset(smiles_list, dummy_labels)  # 这里生成的图会在GPU上

    dataloader = DataLoader(dataset, batch_size=5, collate_fn=collate, shuffle=False)

    with torch.no_grad():
        for graphs, _ in dataloader:
            # 这里保证图数据和模型在同一设备
            graphs = graphs.to(device)
            outputs, _ = model(graphs)  # 输出预测值
            predictions.extend(outputs.cpu().numpy().flatten())  # 拿回CPU

    return predictions


# 3. 主函数
def main():
    model_path = "../gnn_logs/ep500bs5lr0.005kf5hu256cvid4.pth.tar"  # 改成你的模型文件
    test_smiles = [
        "CCCCO",
        "CCCCCCCCCC",
        "CCO",
    ]

    print("加载模型到GPU...")
    model, device = load_model(model_path)

    print("开始预测...")
    results = predict_smiles(model, device, test_smiles)

    if results is not None:
        print("\n预测结果:")
        for smiles, pred in zip(test_smiles, results):
            print(f"{smiles}: {pred:.4f}")

        # 保存结果
        with open('predictions_gpu.pkl', 'wb') as f:
            pickle.dump({
                'smiles': test_smiles,
                'predictions': results
            }, f)
        print("\n结果已保存到 predictions_gpu.pkl")


if __name__ == "__main__":
    main()
