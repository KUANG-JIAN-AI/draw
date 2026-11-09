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

## 協作與操作說明

- 未加入房间时绘画仅保存在当前页面；加入房间会载入该房间画布。
- 切换房间会退出原房间；断线期间暂停同步绘画，重连后重新载入服务器历史。
- 撤销以完整笔画为单位，仅撤销当前连接自己的操作；清空也可以撤销。
- 房间历史保存在内存中，最后一位成员离开或服务器重启后释放。需要保留的内容请先下载。
- 每个房间最多保留 30,000 个绘画线段；达到上限后请保存并清空。清空保留一份可恢复的历史。
- AI 面板可由顶部按钮展开；摄像头开启后，同一按钮可关闭摄像头。
- 图片保存接口仅接受 PNG、JPEG、WebP data URL，不接受远程地址；请求体上限 16 MiB，单图上限 10 MiB。
- AI 生成按来源 IP 限制为每分钟一次。公网部署仍需在入口配置用户认证和用量配额。

验证协作逻辑：`python -m unittest discover -s tests -v`
