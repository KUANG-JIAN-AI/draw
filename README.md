# 空中ジェスチャーお絵かきボード

MediaPipe Hands を使用したフロントエンドのジェスチャーお絵かきボードです。カメラを使ったハンドジェスチャーによる描画、色の選択、線の太さ変更、消しゴム、元に戻す、全消去、保存に対応しています。

## 実行方法

1. 仮想環境を作成して有効化（推奨）

```bash
cd /Users/kyo/Projects/python/draw

python3 -m venv venv

source venv/bin/activate
```

2. 依存パッケージをインストール

```bash
pip install -r requirements.txt
```

3. 設定ファイルを準備

```bash
cp .env.example .env
```

その後、`.env` を編集します。

```dotenv
AGNES_API_KEY="あなたの Agnes API Key"
```

4. Flask アプリケーションを起動

```bash
python app.py
```

5. ブラウザで開く

```text
http://127.0.0.1:5000
```

ポート 5000 が使用中の場合は、別のポートを指定できます。

```bash
python app.py --port 5001
```

## 複数人での共同作業

クライアントは Socket.IO を使用して同じルームに接続し、描画、全消去、元に戻す操作をリアルタイムで同期できます。

新しいユーザーが参加した際には、現在のキャンバスの描画履歴が自動的に送信されます。

## AI 画像生成

簡単なイラストを描いた後、右側の AI パネルでスタイル、サイズ、モデルを選択し、生成したいイメージを入力して「AI 生成」をクリックします。

バックエンドでは現在のキャンバスを白背景の PNG として書き出し、`AGNES_API_KEY` を使用して Agnes Image の image-to-image API を呼び出します。

4. ブラウザで開く

```text
http://127.0.0.1:5000
```

ポート 5000 がすでに使用されている場合は、別のポートを指定できます。

```bash
python app.py --port 5001
```

デバッグモードを有効にする場合：

```bash
python app.py --debug
```

## プロジェクト構成

* `app.py` - Flask のエントリーポイント
* `templates/index.html` - ページテンプレート
* `static/app.js` - フロントエンドロジック
* `static/styles.css` - スタイルシート
* `requirements.txt` - Python の依存パッケージ
