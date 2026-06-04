function toIngredientSet(ingredientList) {
  return new Set(ingredientList.map(i => i.toLowerCase().trim()).filter(Boolean));
}

module.exports = { toIngredientSet };
