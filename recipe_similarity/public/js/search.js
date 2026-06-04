const form = document.getElementById('search-form');
const input = document.getElementById('ingredients-input');
const tagArea = document.getElementById('tag-area');
const searchBtn = document.getElementById('search-btn');

let ingredients = [];

function renderTags() {
  tagArea.innerHTML = '';
  ingredients.forEach((ing, i) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${ing} <button aria-label="削除" data-index="${i}">×</button>`;
    tagArea.appendChild(tag);
  });
  searchBtn.disabled = ingredients.length === 0;
}

function addIngredient(value) {
  const normalized = value.toLowerCase().trim();
  if (normalized && !ingredients.includes(normalized)) {
    ingredients.push(normalized);
    renderTags();
  }
}

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const values = input.value.split(',').map(v => v.trim()).filter(Boolean);
    values.forEach(addIngredient);
    input.value = '';
  }
});

input.addEventListener('blur', () => {
  if (input.value.trim()) {
    const values = input.value.split(',').map(v => v.trim()).filter(Boolean);
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
  const params = new URLSearchParams({ q: ingredients.join(',') });
  window.location.href = `results.html?${params}`;
});
