# Recipe Similarity

材料と調理法をベクトル化して、コサイン類似度で似た料理を検索するアプリです。

## 構成

- `data/recipes.csv`: レシピデータセット
- `src/preprocess.py`: データ前処理・ベクトル化
- `src/similarity.py`: コサイン類似度計算
- `src/main.py`: CLIエントリーポイント

## 実行方法

1. 仮想環境を作成して依存をインストール

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. 検索を実行

```bash
python src/main.py
```

3. 材料をカンマ区切りで入力すると、類似料理Top10を表示します。
