import pandas as pd
import numpy as np
from scipy.stats import entropy


def analyze_original_vs_augmented(original_csv: str, augmented_csv: str, bins=20):
    """
    对比原始数据与增强数据的统计特性和分布
    默认假设：
      - 第 2 列是标签（如 Tg）
    """

    df_orig = pd.read_csv(original_csv, header=None)
    df_aug = pd.read_csv(augmented_csv, header=None)

    y_orig = df_orig.iloc[:, 1].dropna().astype(float)
    y_aug = df_aug.iloc[:, 1].dropna().astype(float)

    # ---------- 基本统计 ----------
    def stats(x):
        return {
            "平均值": float(np.mean(x)),
            "中位数": float(np.median(x)),
            "最小值": float(np.min(x)),
            "最大值": float(np.max(x)),
            "标准差": float(np.std(x)),
            "方差": float(np.var(x)),
        }

    # ---------- 分布（统一 bins） ----------
    min_v = min(y_orig.min(), y_aug.min())
    max_v = max(y_orig.max(), y_aug.max())
    bin_edges = np.linspace(min_v, max_v, bins + 1)

    hist_orig, _ = np.histogram(y_orig, bins=bin_edges, density=True)
    hist_aug, _ = np.histogram(y_aug, bins=bin_edges, density=True)

    # 防止 KL / PCD 出现 0
    eps = 1e-8
    hist_orig += eps
    hist_aug += eps

    # ---------- 分布相似性 ----------
    pcd = float(np.linalg.norm(hist_orig - hist_aug))
    kl_div = float(entropy(hist_orig, hist_aug))

    return {
        "stats": {
            "original": stats(y_orig),
            "augmented": stats(y_aug),
        },
        "distribution": {
            "bins": bin_edges[:-1].round(3).tolist(),
            "original": hist_orig.round(6).tolist(),
            "augmented": hist_aug.round(6).tolist(),
        },
        "similarity": {
            "pcd": pcd,
            "label_kl": kl_div,
        },
    }
