const fs = require('fs');
const { parse } = require('csv-parse');

let recipes = [];

const LOAD_LIMIT = Infinity;

const METHOD_KEYWORDS = {
  boil:  /\bboil(ed|ing)?\b/i,
  stew:  /\b(stew(ed|ing)?|brais(ed|ing|e))\b/i,
  steam: /\bsteam(ed|ing)?\b/i,
  grill: /\b(grill(ed|ing)?|broil(ed|ing)?)\b/i,
  fry:   /\b(fry|fr(ied|ying)|saut[eé](ed|ing)?|stir.?fr(y|ied|ying)|deep.?fr(y|ied|ying)|pan.?fr(y|ied|ying))\b/i,
  bake:  /\bbak(ed?|ing)\b/i,
  roast: /\broast(ed|ing)?\b/i,
};

function extractMethods(directionsStr) {
  if (!directionsStr) return [];
  let text = directionsStr;
  try {
    const parsed = JSON.parse(directionsStr);
    if (Array.isArray(parsed)) text = parsed.join(' ');
  } catch { /* use raw string */ }
  return Object.entries(METHOD_KEYWORDS)
    .filter(([, re]) => re.test(text))
    .map(([method]) => method);
}

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
          const ingredientsStr = record.ingredients || '';
          const methodsStr = record.methods || '';
          let ingredients = [];
          let methods = [];

          if (record.NER) {
            const ner = JSON.parse(record.NER);
            ingredients = Array.isArray(ner) ? ner.map(i => i.toLowerCase().trim()).filter(Boolean) : [];
          } else if (ingredientsStr) {
            try {
              const parsed = JSON.parse(ingredientsStr);
              ingredients = Array.isArray(parsed)
                ? parsed.map(i => i.toLowerCase().trim()).filter(Boolean)
                : ingredientsStr.split(';').map(i => i.toLowerCase().trim()).filter(Boolean);
            } catch {
              ingredients = ingredientsStr.split(';').map(i => i.toLowerCase().trim()).filter(Boolean);
            }
          }

          methods = extractMethods(record.directions || methodsStr);

          if (ingredients.length > 0 || methods.length > 0) {
            recipes.push({
              title: record.name || record.title || '無題のレシピ',
              country: record.country || '',
              ingredients,
              methods,
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
