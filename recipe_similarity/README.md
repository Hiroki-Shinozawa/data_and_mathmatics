# レシピ類似度検索アプリ

材料をコサイン類似度でベクトル比較し、世界の似た料理を探すWebアプリ。

---

## ファイル構成

```
recipe_similarity/
├── public/                    # フロントエンド（静的ファイル）
│   ├── index.html             # 検索ページ（材料入力フォーム・タブUI）
│   ├── results.html           # 結果ページ（類似レシピ Top10 表示）
│   ├── css/
│   │   └── style.css          # 全ページ共通スタイル
│   └── js/
│       ├── translate.js       # 日本語→英語変換マップ（フロント・サーバー共通定義）
│       ├── search.js          # フォーム操作・タグ管理・タブ切替 → results.html へリダイレクト
│       └── results.js         # URLパラメータからAPIを呼び出し・結果描画
│
├── server/
│   ├── app.js                 # Expressサーバー起動・ルーティング設定
│   ├── routes/
│   │   └── search.js          # POST /api/search エンドポイント定義
│   └── services/
│       ├── loader.js          # 起動時にCSVを読み込みメモリに保持（全件）
│       ├── vectorize.js       # 材料リスト → Set に変換（Bag of Ingredients）
│       ├── similarity.js      # コサイン類似度計算・Top10抽出
│       └── translate.js       # 日本語→英語変換（サーバー側）
│
├── package.json
└── README.md
```

---

## データの流れ

```
index.html（材料入力）
  ↓ translate.js でタグを英語に変換しながら追加
  ↓ results.html?q=potato,onion,beef&m=boil&display=じゃがいも,玉ねぎ,牛肉&displayMethod=煮る にリダイレクト
results.html
  ↓ POST /api/search  { ingredients: ["potato","onion","beef"], methods: ["boil"] }
routes/search.js
  ↓
loader.js（メモリ上のレシピデータを取得）
  ↓
vectorize.js（入力材料・調理法を Set に変換）
  ↓
similarity.js（全レシピとのコサイン類似度を計算し Top10 を返す）
  ↓
results.html（スコア・共通材料・共通調理法を描画）
```

---

## データセットの形式

**ファイル:** `dataset/full_dataset.csv`（約223万件、全件使用）

CSVの列構成は以下のとおり：

| 列名 | 内容 | 例 |
|------|------|----|
| `title` | レシピ名 | `No-Bake Nut Cookies` |
| `ingredients` | 材料リスト（量・単位つき） | `"1 c. firmly packed brown sugar", "1/2 c. evaporated milk", ...` |
| `NER` | 材料名のみ抽出済みリスト（Named Entity Recognition） | `["brown sugar", "milk", "vanilla", "nuts", ...]` |
| `directions` | 調理手順 | `"In a heavy 2-quart saucepan, mix brown sugar..."` |
| `link` | 元レシピURL | `www.cookbooks.com/...` |
| `source` | データ出典 | `Gathered` |

**アプリが使う列は `NER` 優先。**  
`NER` 列が存在する場合はJSONパースして配列を取得し、存在しない場合は `ingredients` 列をJSONまたは `;` で分割する（`loader.js` 参照）。  
`methods` 列はデータセットに存在しないため、調理法スコアはレシピ側にデータがある場合のみ平均に含める。

```
// loader.js の処理イメージ
NER列あり → JSON.parse(record.NER)  → ["potato", "onion", "beef"]
NER列なし → JSON.parse(record.ingredients) または split(";") → ["potato", "onion", "beef"]
```

---

## 類似度計算の方法

**Bag of Ingredients（材料集合）によるコサイン類似度**を使う。  
密なベクトルを作らず集合演算のみで計算するため、大規模データでも高速。

### 基本式

```
cos(A, B) = |A ∩ B| / (√|A| × √|B|)
```

| 記号 | 意味 |
|------|------|
| A | 入力材料の集合（ユーザーが入力した材料） |
| B | データセット内レシピの材料集合 |
| `\|A ∩ B\|` | 共通材料の数 |
| `√\|A\|` × `√\|B\|` | 集合サイズの幾何平均（ノルムの代わり） |

### 具体例

```
入力材料:  A = {potato, onion, beef}    → |A| = 3
レシピB:   B = {potato, onion, carrot}  → |B| = 3
共通材料:  A ∩ B = {potato, onion}      → |A ∩ B| = 2

スコア = 2 / (√3 × √3) = 2 / 3 ≈ 0.667
```

### 材料＋調理法の複合スコア

`ingredients`（材料）と `methods`（調理法）の両方が入力され、かつレシピ側にも調理法データがある場合は平均を取る：

```
score = (ingredientScore + methodScore) / 2
```

レシピ側に調理法データがない場合（現在のデータセットは該当なし）、または片方だけ入力された場合はそのスコアをそのまま使う。

---

## 翻訳マップ

日本語入力を英語に変換するマップは `public/js/translate.js`（フロントエンド用）と `server/services/translate.js`（サーバー用）で共通定義。  
フロントエンドではタグ追加時に変換済み英語クエリをURLパラメータに渡すため、サーバー側での再変換はパススルーになる。

---

## セットアップ・起動手順

### 1. 依存パッケージのインストール

```bash
cd recipe_similarity
npm install
```

### 2. データセットの確認

`../dataset/full_dataset.csv` が存在することを確認してください。  
（`data_and_mathmatics/dataset/full_dataset.csv`）

データパスを変えたい場合は環境変数で指定できます：

```bash
DATA_PATH=/path/to/your/recipes.csv npm start
```

### 3. サーバー起動

```bash
npm start
```

起動すると CSV の全件読み込みが始まります（約223万件のため数分かかります）。

```
レシピデータを読み込み中...
  10000 件読み込み中...
  20000 件読み込み中...
...
2230000 件読み込み完了（全件読了）
読み込み完了。サーバー起動します。
http://localhost:3000
```

### 4. 開発時（ファイル変更を自動検知）

```bash
npm run dev
```

### 5. ブラウザでアクセス

```
http://localhost:3000
```

---

## UI

### 検索ページ（index.html）

- **検索 / 使い方** タブで切り替え
- よく使う材料ボタン（じゃがいも, 玉ねぎ, 牛肉 など）をクリックしてタグ追加
- よく使う調理法ボタン（煮る, 炒める, 蒸す など）をクリックしてタグ追加
- テキスト入力でカンマ区切りまたはEnterでもタグ追加可能（日本語・英語両対応）
- タグの `×` ボタンで削除
- タグが1件以上で「検索する」ボタンが有効になる

---

## API

### POST /api/search

**リクエスト**
```json
{
  "ingredients": ["potato", "onion", "beef"],
  "methods": ["boil"]
}
```

**レスポンス**
```json
{
  "results": [
    {
      "title": "Irish Stew",
      "score": 0.87,
      "commonIngredients": ["potato", "onion", "beef"],
      "commonMethods": [],
      "common": ["potato", "onion", "beef"]
    }
  ]
}
```

---

## 使用技術

| 項目 | 内容 |
|------|------|
| ランタイム | Node.js |
| サーバー | Express |
| CSVパース | csv-parse |
| フロントエンド | Vanilla HTML / CSS / JS（フレームワーク不使用） |
| データセット | Kaggle: full_recipe_dataset（NER列を使用、約223万件） |
