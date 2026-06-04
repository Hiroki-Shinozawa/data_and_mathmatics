const form = document.getElementById('search-form');
const input = document.getElementById('ingredients-input');
const tagArea = document.getElementById('tag-area');
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
  'レモン': 'lemon'
};

let ingredients = [];

function translateIngredient(value) {
  const normalized = value.toLowerCase().trim().replace(/　/g, ' ');
  if (TRANSLATION_MAP[normalized]) {
    return TRANSLATION_MAP[normalized];
  }
  if (/[ぁ-んァ-ン一-龥]/.test(normalized)) {
    return normalized;
  }
  return normalized;
}

function renderTags() {
  tagArea.innerHTML = '';
  ingredients.forEach((entry, i) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${escapeHtml(entry.raw)} <button aria-label="削除" data-index="${i}">×</button>`;
    tagArea.appendChild(tag);
  });
  searchBtn.disabled = ingredients.length === 0;
}

function addIngredient(value) {
  const raw = value.trim();
  if (!raw) return;
  const query = translateIngredient(raw);
  if (!query) return;
  if (ingredients.some(item => item.query === query)) return;
  ingredients.push({ raw, query });
  renderTags();
}

function parseInput(value) {
  return value.split(',').map(v => v.trim()).filter(Boolean);
}

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const values = parseInput(input.value);
    values.forEach(addIngredient);
    input.value = '';
  }
});

input.addEventListener('blur', () => {
  if (input.value.trim()) {
    const values = parseInput(input.value);
    values.forEach(addIngredient);
    input.value = '';
  }
});

tagArea.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    ingredients.splice(Number(e.target.dataset.index), 1);
    renderTags();
  }
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (ingredients.length === 0) return;
  const q = ingredients.map(item => item.query).join(',');
  const display = ingredients.map(item => item.raw).join(',');
  const params = new URLSearchParams({ q, display });
  window.location.href = `results.html?${params}`;
});

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

