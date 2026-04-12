from rdkit import Chem
from rdkit.Chem import AllChem

def smiles_to_molblock(smiles: str) -> str:
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError("Invalid SMILES")

    mol = Chem.AddHs(mol)             # 必须
    AllChem.EmbedMolecule(mol, AllChem.ETKDG())
    AllChem.UFFOptimizeMolecule(mol)

    return Chem.MolToMolBlock(mol)
