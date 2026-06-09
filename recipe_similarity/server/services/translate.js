const TRANSLATION_MAP = {
  'じゃがいも': 'potato',
  'じゃが芋': 'potato',
  'ジャガイモ': 'potato',
  '玉ねぎ': 'onion',
  'たまねぎ': 'onion',
  '玉葱': 'onion',
  '牛肉': 'beef',
  '豚肉': 'pork',
  '鶏肉': 'chicken',
  'にんじん': 'carrot',
  '人参': 'carrot',
  'キャベツ': 'cabbage',
  'ほうれん草': 'spinach',
  'トマト': 'tomato',
  '茄子': 'eggplant',
  'ナス': 'eggplant',
  'しょうゆ': 'soy sauce',
  '醤油': 'soy sauce',
  'みりん': 'mirin',
  '砂糖': 'sugar',
  '塩': 'salt',
  'にんにく': 'garlic',
  'ニンニク': 'garlic',
  'ごま油': 'sesame oil',
  'ごま': 'sesame',
  'バター': 'butter',
  '小麦粉': 'flour',
  '牛乳': 'milk',
  '卵': 'egg',
  '味噌': 'miso',
  'しょうが': 'ginger',
  '生姜': 'ginger',
  'ココナッツミルク': 'coconut milk',
  'カレーパウダー': 'curry powder',
  'カレー粉': 'curry powder',
  'バジル': 'basil',
  'オリーブオイル': 'olive oil',
  'モッツァレラ': 'mozzarella',
  'チーズ': 'cheese',
  'レモン': 'lemon',
  '煮る': 'boil',
  '煮込み': 'stew',
  '煮込む': 'stew',
  '蒸す': 'steam',
  '蒸し': 'steam',
  '焼く': 'grill',
  '焼き': 'grill',
  '炒める': 'fry',
  '炒め': 'fry',
  '揚げる': 'fry',
  '茹でる': 'boil',
  '焼く（オーブン）': 'bake',
  'オーブン': 'bake',
  'ロースト': 'roast',
  '蒸し焼き': 'roast'
};

const DISPLAY_MAP = {
  'potato': 'じゃがいも',
  'onion': '玉ねぎ',
  'beef': '牛肉',
  'pork': '豚肉',
  'chicken': '鶏肉',
  'carrot': 'にんじん',
  'cabbage': 'キャベツ',
  'spinach': 'ほうれん草',
  'tomato': 'トマト',
  'eggplant': 'ナス',
  'soy sauce': 'しょうゆ',
  'mirin': 'みりん',
  'sugar': '砂糖',
  'salt': '塩',
  'garlic': 'にんにく',
  'sesame oil': 'ごま油',
  'sesame': 'ごま',
  'butter': 'バター',
  'flour': '小麦粉',
  'milk': '牛乳',
  'egg': '卵',
  'miso': '味噌',
  'ginger': 'しょうが',
  'coconut milk': 'ココナッツミルク',
  'curry powder': 'カレーパウダー',
  'basil': 'バジル',
  'olive oil': 'オリーブオイル',
  'mozzarella': 'モッツァレラ',
  'cheese': 'チーズ',
  'lemon': 'レモン',
  'boil': '煮る',
  'stew': '煮込む',
  'steam': '蒸す',
  'grill': '焼く',
  'fry': '炒める',
  'bake': 'オーブン焼き',
  'roast': 'ロースト'
};

function normalizeValue(value) {
  return String(value)
    .trim()
    .replace(/　/g, ' ')
    .replace(/[。、]/g, '')
    .toLowerCase();
}

function translateToEnglish(value) {
  const normalized = normalizeValue(value);
  return TRANSLATION_MAP[normalized] || normalized;
}

function displayJapanese(value) {
  const normalized = normalizeValue(value);
  return DISPLAY_MAP[normalized] || value;
}

module.exports = { translateToEnglish, displayJapanese };
