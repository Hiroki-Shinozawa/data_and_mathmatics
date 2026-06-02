import os
from preprocess import load_recipes, build_recipe_vectors, prepare_input_vector, normalize_ingredient
from similarity import cosine_similarity_matrix, top_k_similarities, common_ingredients


def main() -> None:
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, "..", "data", "recipes.csv")
    df = load_recipes(data_path)
    recipe_vectors, ingredient_vocab, method_vocab = build_recipe_vectors(df)

    user_input = input("材料をカンマ区切りで入力してください: ")
    normalized_input = ",".join([normalize_ingredient(tok) for tok in user_input.split(",") if tok.strip()])
    query_vector = prepare_input_vector(normalized_input, ingredient_vocab, method_vocab)
    similarities = cosine_similarity_matrix(query_vector, recipe_vectors)
    indices = top_k_similarities(similarities, k=10)

    print("\nTop10 類似料理:")
    for rank, idx in enumerate(indices, start=1):
        score = similarities[idx]
        row = df.iloc[idx]
        input_tokens = [tok.strip().lower() for tok in normalized_input.split(",") if tok.strip()]
        common = common_ingredients(input_tokens, row.ingredients)
        print(f"{rank}. {row.name}（{row.country}） 類似度: {score:.2f} 共通材料: {', '.join(common) if common else 'なし'}")


if __name__ == "__main__":
    main()
