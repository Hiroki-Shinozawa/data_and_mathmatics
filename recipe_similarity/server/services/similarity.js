// Bag of Ingredients のコサイン類似度
// cos(A, B) = |A ∩ B| / (√|A| × √|B|)
// 密なベクトルを作らず集合演算で計算するため大規模データでも高速
function cosineSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  return intersection / (Math.sqrt(setA.size) * Math.sqrt(setB.size));
}

function findTopSimilar(inputSet, recipes, topN = 10) {
  const scored = recipes.map(recipe => {
    const recipeSet = new Set(recipe.ingredients);
    const score = cosineSimilarity(inputSet, recipeSet);
    const common = recipe.ingredients.filter(i => inputSet.has(i));
    return { title: recipe.title, score: Math.round(score * 1000) / 1000, common };
  });

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

module.exports = { cosineSimilarity, findTopSimilar };
