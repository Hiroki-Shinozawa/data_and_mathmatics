# レシピ類似度検索アプリ

材料をコサイン類似度でベクトル比較し、世界の似た料理を探すWebアプリ。

---

## ファイル構成

```
recipe_similarity/
├── public/                    # フロントエンド（静的ファイル）
│   ├── index.html             # 検索ページ（材料入力フォーム）
│   ├── results.html           # 結果ページ（類似レシピ Top10 表示）
│   ├── css/
│   │   └── style.css          # 全ページ共通スタイル
│   └── js/
│       ├── search.js          # フォーム操作・API呼び出し → results.html へリダイレクト
│       └── results.js         # URLパラメータからAPIを呼び出し・結果描画
│
├── server/
│   ├── app.js                 # Expressサーバー起動・ルーティング設定
│   ├── routes/
│   │   └── search.js          # POST /api/search エンドポイント定義
│   └── services/
│       ├── loader.js          # 起動時にCSVを読み込みメモリに保持（上限50,000件）
│       ├── vectorize.js       # 材料リスト → Set に変換（Bag of Ingredients）
│       └── similarity.js      # コサイン類似度計算・Top10抽出
│
├── package.json
└── README.md
```

---

## データの流れ

```
index.html（材料入力）
  ↓ results.html?q=potato,onion,beef にリダイレクト
results.html
  ↓ POST /api/search  { ingredients: ["potato","onion","beef"] }
routes/search.js
  ↓
loader.js（メモリ上のレシピデータを取得）
  ↓
vectorize.js（入力材料を Set に変換）
  ↓
similarity.js（全レシピとのコサイン類似度を計算し Top10 を返す）
  ↓
results.html（スコア・共通材料を描画）
```

---

## 類似度計算の方法

Bag of Ingredients（材料集合）でのコサイン類似度。  
密なベクトルを生成せず集合演算で計算するため、大規模データでも高速。

```
cos(A, B) = |A ∩ B| / (√|A| × √|B|)
```

材料の重みα・調理法の重みβは企画書仕様（α=0.7, β=0.3）として将来対応予定。

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

起動すると CSV の読み込みが始まります（初回は数十秒かかります）。

```
レシピデータを読み込み中...
50000 件のレシピを読み込みました
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

## API

### POST /api/search

**リクエスト**
```json
{ "ingredients": ["potato", "onion", "beef"] }
```

**レスポンス**
```json
{
  "results": [
    {
      "title": "Irish Stew",
      "score": 0.87,
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
| データセット | Kaggle: full_recipe_dataset（NER列を使用） |
