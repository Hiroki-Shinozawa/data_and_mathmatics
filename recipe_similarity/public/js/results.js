const queryDisplay = document.getElementById('query-display');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error-msg');
const resultsList = document.getElementById('results-list');

const params = new URLSearchParams(window.location.search);
const raw = params.get('q') || '';
const methodRaw = params.get('m') || '';
const display = params.get('display') || raw;
const displayMethod = params.get('displayMethod') || methodRaw;
const ingredients = raw.split(',').map(s => s.trim()).filter(Boolean);
const methods = methodRaw.split(',').map(s => s.trim()).filter(Boolean);
const displayIngredients = display.split(',').map(s => s.trim()).filter(Boolean);
const displayMethods = displayMethod.split(',').map(s => s.trim()).filter(Boolean);

if (ingredients.length === 0 && methods.length === 0) {
  window.location.href = '/';
}

queryDisplay.textContent = `入力材料: ${displayIngredients.join(', ') || 'なし'}`;
const methodDisplay = document.getElementById('method-display');
methodDisplay.textContent = `入力調理法: ${displayMethods.join(', ') || 'なし'}`;

async function translateTitle(title) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(title)}&langpair=en|ja`,
      { signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
  } catch { /* タイムアウト・ネットワークエラー時は原文を使用 */ }
  return title;
}

async function translateAllTitles(results) {
  const translated = await Promise.all(results.map(r => translateTitle(r.title)));
  return results.map((r, i) => ({ ...r, titleJa: translated[i] }));
}

async function search() {
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients, methods }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '検索に失敗しました');
    }

    loading.textContent = 'タイトルを翻訳中...';
    const translatedResults = await translateAllTitles(data.results);
    renderResults(translatedResults);
  } catch (err) {
    loading.classList.add('hidden');
    errorMsg.textContent = err.message;
    errorMsg.classList.remove('hidden');
  }
}

function renderResults(results) {
  loading.classList.add('hidden');

  if (!Array.isArray(results) || results.length === 0) {
    errorMsg.textContent = '一致するレシピが見つかりませんでした。';
    errorMsg.classList.remove('hidden');
    return;
  }

  results.forEach((r, i) => {
    const li = document.createElement('li');
    li.className = 'result-card';
    const ingredientCommon = (r.commonIngredients || r.common || []).length > 0
      ? (r.commonIngredients || r.common).map(displayJapanese).join(', ')
      : 'なし';
    const methodCommon = (r.commonMethods || []).length > 0
      ? r.commonMethods.map(displayJapanese).join(', ')
      : 'なし';

    const titleJa = r.titleJa && r.titleJa !== r.title ? r.titleJa : null;

    li.innerHTML = `
      <div class="result-card">
        <h3>${i + 1}. ${escapeHtml(titleJa || r.title)}</h3>
        ${titleJa ? `<div class="title-original">${escapeHtml(r.title)}</div>` : ''}
        <div class="score">類似度: ${r.score.toFixed(3)}</div>
        <div class="common"><strong>共通材料:</strong> ${escapeHtml(ingredientCommon)}</div>
        <div class="common"><strong>共通調理法:</strong> ${escapeHtml(methodCommon)}</div>
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
