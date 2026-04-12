import numpy as np
import pandas as pd
import csv
from rdkit import Chem


def randomize_smile(sml, max_len=100):
    try:
        m = Chem.MolFromSmiles(sml)
        if m is None:
            return np.nan
        ans = list(range(m.GetNumAtoms()))
        np.random.shuffle(ans)
        nm = Chem.RenumberAtoms(m, ans)
        smiles = Chem.MolToSmiles(nm, canonical=False)

        i = 0
        while len(smiles) > max_len and i < 5:
            np.random.shuffle(ans)
            nm = Chem.RenumberAtoms(m, ans)
            smiles = Chem.MolToSmiles(nm, canonical=False)
            i += 1

        return smiles if len(smiles) <= max_len else sml
    except Exception:
        return np.nan


def canonical_smile(sml):
    try:
        m = Chem.MolFromSmiles(sml)
        if m is None:
            return np.nan
        return Chem.MolToSmiles(m, canonical=True)
    except Exception:
        return np.nan


def read_two_column_csv(path: str):
    df = pd.DataFrame()
    with open(path, "r", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)
        df["A"] = [r[0] for r in rows]
        df["B"] = [r[1] for r in rows]
    return df


def augment_data(
    train_path: str,
    test_path: str,
    output_path: str,
    n_times: int = 1,
):
    # 读取数据
    df_train = read_two_column_csv(train_path)
    df_test = read_two_column_csv(test_path)

    df_train_all = pd.DataFrame()

    # canonical
    df_can = df_train.copy(deep=True)
    df_can["A"] = df_can["A"].map(canonical_smile)
    df_train_all = pd.concat([df_train_all, df_can], ignore_index=True)

    # randomized
    for _ in range(n_times):
        df_rand = df_train.copy(deep=True)
        df_rand["A"] = df_rand["A"].map(randomize_smile)
        df_train_all = pd.concat([df_train_all, df_rand], ignore_index=True)

    # 拼接 test
    df_train_all = pd.concat([df_train_all, df_test], ignore_index=True)

    # 保存
    df_train_all.to_csv(output_path, header=False, index=False)

    return {
        "rows": len(df_train_all),
        "output": output_path,
    }
