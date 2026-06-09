const express = require('express');
const router = express.Router();
const { getRecipes } = require('../services/loader');
const { toIngredientSet, toMethodSet } = require('../services/vectorize');
const { findTopSimilar } = require('../services/similarity');
const { translateToEnglish } = require('../services/translate');

router.post('/search', (req, res) => {
  const { ingredients = [], methods = [] } = req.body;

  const translatedIngredients = Array.isArray(ingredients)
    ? ingredients.map(translateToEnglish)
    : [];
  const translatedMethods = Array.isArray(methods)
    ? methods.map(translateToEnglish)
    : [];

  const hasIngredients = translatedIngredients.length > 0;
  const hasMethods = translatedMethods.length > 0;

  if (!hasIngredients && !hasMethods) {
    return res.status(400).json({ error: '材料または調理法を1つ以上入力してください' });
  }

  const ingredientSet = hasIngredients ? toIngredientSet(translatedIngredients) : new Set();
  const methodSet = hasMethods ? toMethodSet(translatedMethods) : new Set();
  const recipes = getRecipes();

  if (recipes.length === 0) {
    return res.status(503).json({ error: 'データ読み込み中です。しばらく後にリトライしてください。' });
  }

  const results = findTopSimilar({ ingredientSet, methodSet }, recipes);
  res.json({ results });
});

module.exports = router;
