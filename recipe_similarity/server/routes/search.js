const express = require('express');
const router = express.Router();
const { getRecipes } = require('../services/loader');
const { toIngredientSet } = require('../services/vectorize');
const { findTopSimilar } = require('../services/similarity');

router.post('/search', (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: '材料を1つ以上入力してください' });
  }

  const inputSet = toIngredientSet(ingredients);
  const recipes = getRecipes();

  if (recipes.length === 0) {
    return res.status(503).json({ error: 'データ読み込み中です。しばらく後にリトライしてください。' });
  }

  const results = findTopSimilar(inputSet, recipes);
  res.json({ results });
});

module.exports = router;
