const queryDisplay = document.getElementById('query-display');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error-msg');
const resultsList = document.getElementById('results-list');

const params = new URLSearchParams(window.location.search);
const raw = params.get('q') || '';
const display = params.get('display') || raw;
const ingredients = raw.split(',').map(s => s.trim()).filter(Boolean);
const displayIngredients = display.split(',').map(s => s.trim()).filter(Boolean);

if (ingredients.length === 0) {
  window.location.href = '/';
}

queryDisplay.textContent = `入力材料: ${displayIngredients.join(', ')}`;

async function search() {
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '検索に失敗しました');
    }

    renderResults(data.results);
  } catch (err) {
    loading.classList.add('hidden');
    errorMsg.textContent = err.message;
    errorMsg.classList.remove('hidden');
  }
}

function renderResults(results) {
  loading.classList.add('hidden');

  if (results.length === 0) {
    errorMsg.textContent = '一致するレシピが見つかりませんでした。';
    errorMsg.classList.remove('hidden');
    return;
  }

  results.forEach((r, i) => {
    const li = document.createElement('li');
    li.className = 'result-card';
    li.innerHTML = `
      <div class="result-card">
        <h3>${i + 1}. ${escapeHtml(r.title)}</h3>
        <div class="score">類似度: ${r.score.toFixed(3)}</div>
        <div class="common">共通材料: ${r.common.length > 0 ? r.common.join(', ') : 'なし'}</div>
      </div>
    `;
    resultsList.appendChild(li);
  });

  resultsList.classList.remove('hidden');
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

search();
