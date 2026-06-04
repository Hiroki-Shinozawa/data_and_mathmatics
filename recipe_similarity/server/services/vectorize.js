function toIngredientSet(ingredientList) {
  return new Set(ingredientList.map(i => i.toLowerCase().trim()).filter(Boolean));
}

function toMethodSet(methodList) {
  return new Set(methodList.map(m => m.toLowerCase().trim()).filter(Boolean));
}

module.exports = { toIngredientSet, toMethodSet };
