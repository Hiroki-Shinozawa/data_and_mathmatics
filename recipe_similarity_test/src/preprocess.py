import pandas as pd
import numpy as np
from sklearn.preprocessing import normalize

JAPANESE_TO_ENGLISH = {
    "じゃがいも": "potato",
    "玉ねぎ": "onion",
    "牛肉": "beef",
    "鶏肉": "chicken",
    "醤油": "soy sauce",
    "みりん": "mirin",
    "カレー粉": "curry powder",
    "にんじん": "carrot",
    "にんにく": "garlic",
    "トマト": "tomato",
}


def normalize_ingredient(name: str) -> str:
    name = name.strip().lower()
    return JAPANESE_TO_ENGLISH.get(name, name)


def load_recipes(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df["ingredients"] = df["ingredients"].astype(str)
    df["methods"] = df["methods"].astype(str)
    return df


def build_vocabulary(df: pd.DataFrame) -> tuple[list[str], list[str]]:
    ingredients = set()
    methods = set()
    for row in df.itertuples(index=False):
        for ingredient in row.ingredients.split(";"):
            ingredients.add(ingredient.strip().lower())
        for method in row.methods.split(";"):
            methods.add(method.strip().lower())
    return sorted(ingredients), sorted(methods)


def vectorize_ingredients(tokens: list[str], vocabulary: list[str]) -> np.ndarray:
    vector = np.zeros(len(vocabulary), dtype=float)
    token_set = {t.lower() for t in tokens if t}
    for i, word in enumerate(vocabulary):
        if word in token_set:
            vector[i] = 1.0
    return vector


def vectorize_methods(tokens: list[str], vocabulary: list[str]) -> np.ndarray:
    vector = np.zeros(len(vocabulary), dtype=float)
    token_set = {t.lower() for t in tokens if t}
    for i, word in enumerate(vocabulary):
        if word in token_set:
            vector[i] = 1.0
    return vector


def build_recipe_vectors(df: pd.DataFrame, alpha: float = 0.7, beta: float = 0.3) -> tuple[np.ndarray, list[str], list[str]]:
    ingredient_vocab, method_vocab = build_vocabulary(df)
    vectors = []
    for row in df.itertuples(index=False):
        ingredients = [i.strip().lower() for i in row.ingredients.split(";") if i.strip()]
        methods = [m.strip().lower() for m in row.methods.split(";") if m.strip()]
        i_vec = vectorize_ingredients(ingredients, ingredient_vocab)
        m_vec = vectorize_methods(methods, method_vocab)
        combined = np.concatenate([alpha * i_vec, beta * m_vec])
        vectors.append(combined)
    vectors = np.vstack(vectors)
    vectors = normalize(vectors, norm="l2")
    return vectors, ingredient_vocab, method_vocab


def prepare_input_vector(raw_input: str, ingredient_vocab: list[str], method_vocab: list[str], alpha: float = 0.7, beta: float = 0.3) -> np.ndarray:
    tokens = [normalize_ingredient(tok) for tok in raw_input.split(",") if tok.strip()]
    i_vec = vectorize_ingredients(tokens, ingredient_vocab)
    m_vec = np.zeros(len(method_vocab), dtype=float)
    combined = np.concatenate([alpha * i_vec, beta * m_vec])
    combined = normalize(combined.reshape(1, -1), norm="l2")[0]
    return combined
