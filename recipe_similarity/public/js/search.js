const form = document.getElementById('search-form');
const ingredientInput = document.getElementById('ingredients-input');
const methodInput = document.getElementById('methods-input');
const ingredientTagArea = document.getElementById('ingredient-tag-area');
const methodTagArea = document.getElementById('method-tag-area');
const searchBtn = document.getElementById('search-btn');
const commonIngredientButtons = document.getElementById('common-ingredient-buttons');
const commonMethodButtons = document.getElementById('common-method-buttons');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

const COMMON_INGREDIENTS = ['じゃがいも', '玉ねぎ', '牛肉', '豚肉', '鶏肉', 'にんじん', 'しょうゆ', 'みりん', '塩'];
const COMMON_METHODS = ['煮る', '炒める', '蒸す', '焼く', '揚げる', '煮込む', 'オーブン焼き', 'ロースト'];

let ingredientTags = [];
let methodTags = [];

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

function renderQuickButtons(container, items, type) {
  container.innerHTML = '';
  items.forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quick-button';
    button.dataset.type = type;
    button.dataset.value = item;
    button.textContent = item;
    container.appendChild(button);
  });
}

function switchTab(tabName) {
  tabButtons.forEach(button => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle('active', isActive);
  });
  tabPanels.forEach(panel => {
    panel.classList.toggle('hidden', panel.id !== tabName);
  });
}

function addTag(value, type) {
  const raw = value.trim();
  if (!raw) return;
  const query = window.translateValue(raw);
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

document.addEventListener('click', e => {
  if (e.target.matches('.quick-button')) {
    addTag(e.target.dataset.value, e.target.dataset.type);
    return;
  }

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

  if (e.target.matches('.tab-button')) {
    switchTab(e.target.dataset.tab);
  }
});

renderQuickButtons(commonIngredientButtons, COMMON_INGREDIENTS, 'ingredient');
renderQuickButtons(commonMethodButtons, COMMON_METHODS, 'method');
switchTab('search-tab');

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}


