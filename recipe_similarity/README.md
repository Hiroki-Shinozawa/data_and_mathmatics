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
│       ├── translate.js       # 日本語→英語変換マップ（index.html・results.html で共有）
│       ├── search.js          # フォーム操作・タグ管理・タブ切替 → results.html へリダイレクト
│       └── results.js         # APIコール・タイトル翻訳・結果描画
│
├── server/
│   ├── app.js                 # Expressサーバー起動・ルーティング設定
│   ├── routes/
│   │   └── search.js          # POST /api/search エンドポイント定義
│   └── services/
│       ├── loader.js          # 起動時にCSVを全件読み込みメモリに保持・調理法を directions から抽出
│       ├── vectorize.js       # 材料・調理法リスト → Set に変換（Bag of Ingredients）
│       ├── similarity.js      # コサイン類似度計算・Top10抽出
│       └── translate.js       # 日本語→英語変換（サーバー側）
│
├── package.json
└── README.md
```

---

## データの流れ

```
index.html（材料・調理法を入力）
  ↓ translate.js でタグを英語に変換しながら追加
  ↓ results.html?q=potato,onion,beef&m=boil&display=じゃがいも,玉ねぎ,牛肉&displayMethod=煮る にリダイレクト
results.html
  ↓ POST /api/search  { ingredients: ["potato","onion","beef"], methods: ["boil"] }
routes/search.js → similarity.js（Top10抽出）
  ↓
results.js（MyMemory APIでタイトルを日本語翻訳）
  ↓
results.html（日本語タイトル・スコア・共通材料・共通調理法を描画）
```

---

## データセットの形式

**ファイル:** `dataset/full_dataset.csv`（約223万件、全件使用）

| 列名 | 内容 | 例 |
|------|------|----|
| `title` | レシピ名 | `No-Bake Nut Cookies` |
| `ingredients` | 材料リスト（量・単位つき） | `["1 c. firmly packed brown sugar", ...]` |
| `NER` | 材料名のみ抽出済みリスト | `["brown sugar", "milk", "vanilla", ...]` |
| `directions` | 調理手順テキスト | `["Boil and stir 5 minutes...", ...]` |
| `link` | 元レシピURL | `www.cookbooks.com/...` |
| `source` | データ出典 | `Gathered` |

### 材料の読み込み（loader.js）

`NER` 列を優先して使用する。存在しない場合は `ingredients` 列をJSONまたは `;` で分割。

```
NER列あり → JSON.parse(record.NER)         → ["potato", "onion", "beef"]
NER列なし → JSON.parse(record.ingredients) → ["1 c. potato", "onion", ...]
```

### 調理法の抽出（loader.js）

データセットに `methods` 列は存在しない。`directions` テキストを正規表現でスキャンし、以下のキーワードを自動検出する：

| 内部キー | 検出パターン例 |
|----------|---------------|
| `boil`   | boil, boiled, boiling |
| `stew`   | stew, stewed, braise, braised |
| `steam`  | steam, steamed, steaming |
| `grill`  | grill, grilled, broil, broiled |
| `fry`    | fry, fried, sauté, stir-fry, deep-fry |
| `bake`   | bake, baked, baking |
| `roast`  | roast, roasted, roasting |

---

## 類似度計算の方法

**Bag of Ingredients によるコサイン類似度**を使用。密なベクトルを作らず集合演算のみで計算。

### 基本式

```
cos(A, B) = |A ∩ B| / (√|A| × √|B|)
```

| 記号 | 意味 |
|------|------|
| A | 入力材料（またはユーザー入力調理法）の集合 |
| B | レシピ側の材料（または調理法）の集合 |
| `\|A ∩ B\|` | 共通要素の数 |
| `√\|A\|` × `√\|B\|` | 集合サイズの幾何平均 |

### 具体例

```
入力材料:  A = {potato, onion, beef}    → |A| = 3
レシピB:   B = {potato, onion, carrot}  → |B| = 3
共通材料:  A ∩ B = {potato, onion}      → |A ∩ B| = 2

スコア = 2 / (√3 × √3) = 2 / 3 ≈ 0.667
```

### 複合スコア

材料と調理法の両方が入力され、かつレシピ側にも調理法データがある場合は平均：

```
score = (ingredientScore + methodScore) / 2
```

レシピ側に調理法データがない場合、または片方だけ入力の場合はそのスコアをそのまま使用。

---

## タイトル日本語翻訳

結果ページでは検索完了後に MyMemory 無料翻訳API を使い、10件のタイトルを並列で日本語に変換する。  
タイムアウト（4秒）やネットワークエラー時は英語タイトルをそのまま表示するためフォールバックあり。

- 翻訳済みタイトルをメインに表示
- 英語原題をグレーで小さく表示
- 無料枠: 5000文字/日（タイトル10件 × 約20文字 = 約200文字/検索）

---

## 翻訳マップ

日本語入力を英語クエリに変換するマップは `public/js/translate.js`（フロント）と `server/services/translate.js`（サーバー）で同じ内容を定義。  
フロントエンドでタグ追加時に英語変換済みのクエリをURLパラメータに渡すため、サーバー側での再変換はパススルーになる。

対応調理法: `煮る` → `boil` / `煮込む` → `stew` / `蒸す` → `steam` / `焼く` → `grill` / `炒める・揚げる` → `fry` / `オーブン焼き` → `bake` / `ロースト` → `roast`

---

## セットアップ・起動手順

### 1. 依存パッケージのインストール

```bash
cd recipe_similarity
npm install
```

### 2. データセットの確認

`../dataset/full_dataset.csv` が存在することを確認。

データパスを変えたい場合は環境変数で指定：

```bash
DATA_PATH=/path/to/your/recipes.csv npm start
```

### 3. サーバー起動

```bash
npm start
```

全223万件を読み込むため起動に数分かかる。

```
レシピデータを読み込み中...
  10000 件読み込み中...
  ...
2230000 件読み込み完了（全件読了）
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
- よく使う材料ボタン（じゃがいも, 玉ねぎ, 牛肉, 豚肉, 鶏肉, にんじん, しょうゆ, みりん, 塩）
- よく使う調理法ボタン（煮る, 炒める, 蒸す, 焼く, 揚げる, 煮込む, オーブン焼き, ロースト）
- テキスト入力：カンマ区切りまたはEnterでタグ追加（日本語・英語両対応）
- タグの `×` で削除、タグが1件以上で「検索する」ボタンが有効化

### 結果ページ（results.html）

- 類似度上位10件を表示
- タイトルは日本語翻訳済み（英語原題をグレーで併記）
- 共通材料・共通調理法を日本語で表示

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
      "commonMethods": ["boil"],
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
| タイトル翻訳 | MyMemory 無料翻訳API（クライアントサイド） |
| データセット | Kaggle: full_recipe_dataset（NER列を使用、約223万件） |
