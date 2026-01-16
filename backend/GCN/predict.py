def predict_property(smiles: str, model: int):
    model1 = {'C': 0, 'O': 1, 'N': 2, 'F': 3, 'P': 4, 'S': 5, 'Cl': 6, 'Br': 7, 'I': 8, 'H': 9}
    model2 = {'C': 1, 'O': 2, 'N': 3, 'F': 4, 'P': 5, 'S': 6, 'Cl': 7, 'Br': 8, 'I': 9, 'H': 10}
    predict = [model1, model2]
    if model not in [0, 1]:
        raise ValueError("Model must be 0 or 1")
    if smiles not in predict[model]:
        raise ValueError("Invalid SMILES")
    return predict[model][smiles]

# For testing
if __name__ == "__main__":
    smiles = input()
    model = int(input())
    print(predict_property(smiles, model))