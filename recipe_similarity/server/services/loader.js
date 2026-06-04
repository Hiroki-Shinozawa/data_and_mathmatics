const fs = require('fs');
const { parse } = require('csv-parse');

let recipes = [];

const LOAD_LIMIT = 50000;

async function loadRecipes(filePath) {
  return new Promise((resolve, reject) => {
    const parser = parse({ columns: true, skip_empty_lines: true });
    const readStream = fs.createReadStream(filePath);

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        if (recipes.length >= LOAD_LIMIT) {
          // 上限に達したらストリームを即破棄して終了
          readStream.destroy();
          parser.destroy();
          console.log(`${recipes.length} 件読み込み完了（上限到達のため打ち切り）`);
          return resolve();
        }
        try {
          const ner = JSON.parse(record.NER);
          if (ner.length > 0) {
            recipes.push({
              title: record.title,
              ingredients: ner.map(i => i.toLowerCase().trim()),
            });
            if (recipes.length % 10000 === 0) {
              console.log(`  ${recipes.length} 件読み込み中...`);
            }
          }
        } catch (_) { /* 壊れた行はスキップ */ }
      }
    });

    parser.on('end', () => {
      console.log(`${recipes.length} 件読み込み完了（全件読了）`);
      resolve();
    });

    parser.on('error', err => {
      // destroyによるエラーは無視
      if (err.code !== 'ERR_STREAM_DESTROYED') reject(err);
    });

    readStream.pipe(parser);
  });
}

function getRecipes() {
  return recipes;
}

module.exports = { loadRecipes, getRecipes };
