const form = document.getElementById('search-form');
const ingredientInput = document.getElementById('ingredients-input');
const methodInput = document.getElementById('methods-input');
const ingredientTagArea = document.getElementById('ingredient-tag-area');
const methodTagArea = document.getElementById('method-tag-area');
const searchBtn = document.getElementById('search-btn');

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
  '茹でる': 'boil'
};

let ingredientTags = [];
let methodTags = [];

function translateValue(value) {
  const normalized = value.toLowerCase().trim().replace(/　/g, ' ');
  if (TRANSLATION_MAP[normalized]) {
    return TRANSLATION_MAP[normalized];
  }
  if (/[ぁ-んァ-ン一-龥]/.test(normalized)) {
    return normalized;
  }
  return normalized;
}

function renderTags(area, tags) {
  area.innerHTML = '';
  tags.forEach((entry, i) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${escapeHtml(entry.raw)} <button aria-label="削除" data-index="${i}" data-type="${entry.type}">×</button>`;
    area.appendChild(tag);
  });
  searchBtn.disabled = ingredientTags.length === 0 && methodTags.length === 0;
}

function addTag(value, type) {
  const raw = value.trim();
  if (!raw) return;
  const query = translateValue(raw);
  if (!query) return;

  const tags = type === 'ingredient' ? ingredientTags : methodTags;
  if (tags.some(item => item.query === query)) return;
  tags.push({ raw, query, type });
  updateTagAreas();
}

function updateTagAreas() {
  renderTags(ingredientTagArea, ingredientTags);
  renderTags(methodTagArea, methodTags);
}

function parseInput(value) {
  return value.split(',').map(v => v.trim()).filter(Boolean);
}

function handleInput(inputElement, type) {
  const values = parseInput(inputElement.value);
  values.forEach(value => addTag(value, type));
  inputElement.value = '';
}

ingredientInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    handleInput(ingredientInput, 'ingredient');
  }
});

methodInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    handleInput(methodInput, 'method');
  }
});

ingredientInput.addEventListener('blur', () => {
  if (ingredientInput.value.trim()) {
    handleInput(ingredientInput, 'ingredient');
  }
});

methodInput.addEventListener('blur', () => {
  if (methodInput.value.trim()) {
    handleInput(methodInput, 'method');
  }
});

document.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON' && e.target.dataset.index != null) {
    const index = Number(e.target.dataset.index);
    const type = e.target.dataset.type;
    if (type === 'ingredient') {
      ingredientTags.splice(index, 1);
    } else {
      methodTags.splice(index, 1);
    }
    updateTagAreas();
  }
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (ingredientTags.length === 0 && methodTags.length === 0) return;
  const ingredientQuery = ingredientTags.map(item => item.query).join(',');
  const methodQuery = methodTags.map(item => item.query).join(',');
  const displayIngredients = ingredientTags.map(item => item.raw).join(',');
  const displayMethods = methodTags.map(item => item.raw).join(',');
  const params = new URLSearchParams();
  if (ingredientQuery) params.set('q', ingredientQuery);
  if (methodQuery) params.set('m', methodQuery);
  if (displayIngredients) params.set('display', displayIngredients);
  if (displayMethods) params.set('displayMethod', displayMethods);
  window.location.href = `results.html?${params}`;
});

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}


