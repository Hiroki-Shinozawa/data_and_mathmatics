// Bag of Ingredients / Methods のコサイン類似度
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

function findTopSimilar({ ingredientSet, methodSet }, recipes, topN = 10) {
  const scored = recipes.map(recipe => {
    const recipeIngredientSet = new Set(recipe.ingredients);
    const recipeMethodSet = new Set(recipe.methods || []);
    const ingredientScore = ingredientSet.size > 0 ? cosineSimilarity(ingredientSet, recipeIngredientSet) : 0;
    const methodScore = methodSet.size > 0 ? cosineSimilarity(methodSet, recipeMethodSet) : 0;

    let score = 0;
    if (ingredientSet.size > 0 && methodSet.size > 0) {
      score = (ingredientScore + methodScore) / 2;
    } else {
      score = ingredientScore + methodScore;
    }

    const commonIngredients = recipe.ingredients.filter(i => ingredientSet.has(i));
    const commonMethods = (recipe.methods || []).filter(m => methodSet.has(m));

    return {
      title: recipe.title,
      score: Math.round(score * 1000) / 1000,
      commonIngredients,
      commonMethods,
      common: commonIngredients,
    };
  });

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

module.exports = { cosineSimilarity, findTopSimilar };
