const express = require('express');
const router = express.Router();
const { getRecipes } = require('../services/loader');
const { toIngredientSet, toMethodSet } = require('../services/vectorize');
const { findTopSimilar } = require('../services/similarity');

router.post('/search', (req, res) => {
  const { ingredients = [], methods = [] } = req.body;

  const hasIngredients = Array.isArray(ingredients) && ingredients.length > 0;
  const hasMethods = Array.isArray(methods) && methods.length > 0;

  if (!hasIngredients && !hasMethods) {
    return res.status(400).json({ error: '材料または調理法を1つ以上入力してください' });
  }

  const ingredientSet = hasIngredients ? toIngredientSet(ingredients) : new Set();
  const methodSet = hasMethods ? toMethodSet(methods) : new Set();
  const recipes = getRecipes();

  if (recipes.length === 0) {
    return res.status(503).json({ error: 'データ読み込み中です。しばらく後にリトライしてください。' });
  }

  const results = findTopSimilar({ ingredientSet, methodSet }, recipes);
  res.json({ results });
});

module.exports = router;
