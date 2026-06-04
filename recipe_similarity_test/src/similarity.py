import numpy as np


def cosine_similarity_matrix(query: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    return matrix.dot(query)


def top_k_similarities(similarities: np.ndarray, k: int = 10) -> np.ndarray:
    if len(similarities) <= k:
        return np.argsort(-similarities)
    return np.argsort(-similarities)[:k]


def common_ingredients(input_tokens: list[str], recipe_ingredients: str) -> list[str]:
    input_set = {token.strip().lower() for token in input_tokens if token.strip()}
    recipe_set = {token.strip().lower() for token in recipe_ingredients.split(";") if token.strip()}
    return sorted(input_set & recipe_set)
