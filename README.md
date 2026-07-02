# 隔空手势画板

这是一个使用 MediaPipe Hands 的前端手势画板，支持摄像头手势画画、颜色选择、线宽切换、橡皮、撤销、清空和保存。

## 运行方式

1. 创建并激活虚拟环境（推荐）

```bash
cd /Users/kyo/Projects/python/draw
python3 -m venv venv
source venv/bin/activate
```

2. 安装依赖

```bash
pip install -r requirements.txt
```

3. 设置配置文件

```bash
cp .env.example .env
```

然后编辑 `.env`：

```dotenv
AGNES_API_KEY="你的 Agnes API Key"
```

4. 运行 Flask 应用

```bash
python app.py
```

5. 在浏览器中打开

```bash
http://127.0.0.1:5000
```

如果端口 5000 被占用，可指定其它端口：

```bash
python app.py --port 5001
```

## 多人协作

客户端现在可通过 Socket.IO 连接同一个房间，实时同步绘画、清空和撤销操作。新用户加入时会自动接收当前画布历史。 

## AI 图生图

画完简笔画后，在右侧 AI 面板选择风格、尺寸和模型，输入想要的效果，然后点击“AI 生成”。后端会把当前画布导出为白底 PNG，并通过 `AGNES_API_KEY` 调用 Agnes Image 图生图接口。

4. 在浏览器中打开

```
http://127.0.0.1:5000
```

如果端口 5000 已被占用，可指定其他端口：

```bash
python app.py --port 5001
```

如需启用调试模式：

```bash
python app.py --debug
```

## 项目结构

- `app.py` - Flask 入口
- `templates/index.html` - 页面模板
- `static/app.js` - 前端逻辑
- `static/styles.css` - 样式
- `requirements.txt` - Python 依赖
