# STORY.md — 隔空手势画板 项目介绍 PPT

## ① 用户意图对齐

- **目标受众**：课程项目展示 / 技术分享场景，观众为同学、老师或技术评审，对 Web 全栈与 AI 应用感兴趣。
- **核心目标**：让观众在 5 分钟内理解「这是什么、能做什么、怎么做到的、亮点在哪」，并愿意亲自打开试玩。
- **PPT 长度**：12 页（封面 + 目录 + 9 内容 + 结束）。
- **视觉调性**：科技现代 / 活力清新 / 手势交互感；浅色背景 + 蓝紫渐变强调，带一点「创作」的温度。
- **内容边界**：
  - 必讲：项目定位、三大核心能力（隔空手势绘图 / 多人实时协作 / AI 图生图）、技术架构、部署。
  - 不讲：逐行源码、复杂的 Agnes API 鉴权细节、性能压测数据。
  - 禁碰：与项目无关的案例、过度营销辞令。

## ② 页面布局骨架

- **页面总数与分章**：
  - 开篇（01–02）：封面、目录
  - 认知（03–05）：项目定位、核心①隔空手势绘图、手势识别原理
  - 协作与智能（06–08）：核心②多人实时协作、实时同步机制、核心③AI 图生图
  - 工程（09–11）：技术架构、部署运行、项目亮点与价值
  - 收尾（12）：结束页
- **Hero 页定位**：01 封面（hero）、08 AI 图生图（hero，视觉高潮）、12 结束页（hero）。占比 3/12 = 25%，任意两 Hero 间隔 ≥1 个 Supporting 页（01→08 间隔 6 页，08→12 间隔 3 页）。
- **rhythm 曲线**：peak(01) → transition(02) → valley(03) → peak(04) → valley(05) → peak(06) → valley(07) → peak(08,hero) → valley(09) → valley(10) → peak(11) → peak(12,hero)。
- **非对称版式预算**：全篇 12 页中，非对称版式（全幅图骑线、左大图右文、上大图下卡、非对称双栏、左标题右内容、巨型数字洞察）占 9 页（75% ≥ 40%）。
- **对称版式预算**：仅目录(02)、图表洞察页(07)(09) 采用相对对称结构，共 3 页，未超 2 页「N卡片横排」限制（本篇不使用 N卡片横排）。

## ③ 页面大纲

| # | title | type | role | rhythm | layout | visual | visual_role | density | anti_pattern | description |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 01 | 隔空手势画板 | cover | hero | peak | 全幅图+骑线文字 | L1: hero_cover.png | anchor | 字数30/图1/留白35% | 禁止标题右上塞装饰小图；禁止均匀留白 | 全屏手势创作氛围图 + 左侧大字标题与副标 |
| 02 | 目录 | catalog | supporting | transition | 左标题+右内容 | — | — | 字数120/图0/留白25% | 禁止四卡片预览；禁止铺满正文 | 左侧大标题"目录"，右侧 4 个章节条目，每条 ≥30 字 |
| 03 | 项目定位 | content | supporting | valley | 非对称双栏(60:40) | — | evidence | 字数200/图0/留白28% | 禁止 50:50 等分双栏 | 左大标题块"用摄像头，把空气变成画布"；右列痛点→价值 3 条 |
| 04 | 核心① 隔空手势绘图 | content | supporting | peak | 左大图+右文字 | L1: gesture_drawing.png | anchor | 字数220/图1/留白26% | 禁止把产品图缩成 200×70 | 左侧手势绘图主视觉占 60%，右侧功能点列表（颜色/线宽/橡皮/撤销/清空/保存） |
| 05 | 手势识别原理 | content | supporting | valley | 上大图+下方卡片 | L2: hand_landmarks.svg | evidence | 字数210/图1(SVG)/留白24% | 禁止用文字堆砌代替原理图 | 上方 MediaPipe 21 关键点手部骨架 SVG，下方 3 张能力卡片 |
| 06 | 核心② 多人实时协作 | content | supporting | peak | 左大图+右文字 | L1: collaboration.png | anchor | 字数200/图1/留白26% | 禁止 50:50 等分双栏 | 左侧多人协作主视觉 60%，右侧讲房间/在线成员/实时同步 |
| 07 | 实时同步机制 | content | supporting | valley | 图表+洞察 | Diagram(SVG流程) | evidence | 字数160/图1(SVG)/留白22% | 禁止四卡片预览 | SVG 展示 加入房间→接收历史→draw_line 广播→undo/clear，右侧洞察 |
| 08 | 核心③ AI 图生图 | content | hero | peak | 左大图+右文字 | L1: ai_generation.png | anchor | 字数200/图1/留白30% | 禁止等宽卡片横排；禁止 L3 角标顶替 L1 | 左侧草图变艺术图主视觉占 60%，右侧讲导出白底 PNG → Agnes API → 风格/尺寸/模型 |
| 09 | 技术架构全景 | content | supporting | valley | 图表+洞察 | Diagram(SVG架构) | evidence | 字数170/图1(SVG)/留白22% | 禁止单栏线性列表 | 前端 MediaPipe+Canvas+Socket.IO / 后端 Flask+gevent / Agnes API 三层架构 SVG |
| 10 | 部署与运行 | content | supporting | valley | 左标题+右内容 | L3: icon | evidence | 字数180/图0/留白24% | 禁止装饰小图塞标题栏 | 左侧标题块，右侧三步运行说明 + Procfile/gunicorn 部署要点 |
| 11 | 项目亮点与价值 | content | supporting | peak | 巨型数字+洞察 | 大数字 | anchor | 字数150/图0/留白28% | 禁止把数字塞进图表卡角落 | 3 个锚点数字：21 关键点 / 实时毫秒级同步 / 1 个 API 接入 AI |
| 12 | 谢谢观看 | ending | hero | peak | 全幅图+骑线文字 | L3: 角标 | atmosphere | 字数30/图0/留白40% | 禁止铺满正文段落 | 收束金句 + 试玩地址提示 + 落款 |
