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

3. 运行 Flask 应用

```bash
python app.py
```

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
