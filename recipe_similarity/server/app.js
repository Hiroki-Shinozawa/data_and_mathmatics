const express = require('express');
const path = require('path');
const { loadRecipes } = require('./services/loader');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = process.env.DATA_PATH ||
  path.join(__dirname, '..', '..', 'dataset', 'full_dataset.csv');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', searchRouter);

async function start() {
  console.log('レシピデータを読み込み中...');
  await loadRecipes(DATA_PATH);
  console.log('読み込み完了。サーバー起動します。');
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('起動エラー:', err.message);
  process.exit(1);
});
