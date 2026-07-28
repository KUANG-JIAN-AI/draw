# DESIGN.md — 隔空手势画板 项目介绍 PPT

## 1. 画布与全局母版（A/B/C 三区）

- 画布：1280×720，padding 上下 20、左右 64。
- **A 标题块** 0–120px：主标题 34px bold；章节/内容页统一此区。
- **B 内容区** 120–660px：正文/图/卡；禁止挤占 A/C。
- **C 页脚条** 660–720px：左侧项目名「隔空手势画板」+ 右侧页码 `NN / 12`，14px 灰字 #94A3B8。
- 封面(01)/结束(12) 可自定义版式，省略 C 区或弱化。

## 2. 颜色系统（4 hex + 中性）

| 角色 | hex | 用途 | 面积 |
| :--- | :--- | :--- | :--- |
| 主色 primary | `#4F46E5` | 标题块底色、大色块、主视觉蒙版 | ≤60% |
| 辅色 secondary | `#06B6D4` | 卡片背景、第二系列、分隔线 | ≤30% |
| 强调色 accent | `#F97316` | 巨型数字、CTA、核心数据标注 | ≤10%（Hero 可 15-20%） |
| 文本 text | `#1E293B` / 正文 `#475569` / 页脚 `#94A3B8` | 文字、页脚、边框 | 剩余 |

背景主色：`#FFFFFF`；浅色分区底 `#F1F5F9`。
**色彩节奏**：01/08/12 Hero 强调色可达 15-20%；03/05/07/09/10/11 Supporting 强调色 ≤5%、辅色 ≤20%；禁止全篇比例雷同（04/06 用图片主视觉，主色占比不同于纯文字页）。

## 3. 字体系统

- 标题：`'PingFang SC', 'Noto Sans SC', sans-serif`，bold，字距 letterSpacing 1–2px。
- 正文：`'PingFang SC', 'Noto Sans SC', sans-serif`，regular。
- 西文/数字强调：`'Inter', 'Helvetica Neue', sans-serif`（巨型数字用 bold）。
- 字号阶梯：封面主标 64–72；章节大字 56–64；页面主标 34；卡片小标 24；正文 22；引文 20；脚注 14；巨型数字 72–96。

## 4. 信息密度门禁

- 常规内容页留白 ≤ 35%（04/06/08 因图片主视觉，留白约 26-30%）。
- 内容页正文下限 ≥180 字；卡片组每卡 ≥100 字（3 卡合计 ≥300）。
- 每个视觉锚点（≥44px 元素或 ≥40% B 区图）周围留白 ≥40px。

## 5. 配图系统

- **图像风格统一**：全篇主视觉均为「科技现代 / 插画感」风格，蓝紫渐变 + 暖橙点缀，禁止摄影/插画/3D 混用。
- L1 主视觉（生图，落地 resources/images/）：
  - `hero_cover.png` — 人隔空手势作画，发光数字画布，科技氛围（01 封面）
  - `gesture_drawing.png` — 手部捏合/绘制手势 + 手部骨架跟踪叠层 + 彩色笔迹（04）
  - `collaboration.png` — 多人围绕屏幕在同一画布协作、多光标（06）
  - `ai_generation.png` — 左侧草图化为右侧精致 AI 艺术图，魔法过渡（08）
- L2 / SVG（结构化，可手写）：`hand_landmarks.svg`（05 手部 21 关键点骨架）、`sync_flow.svg`（07 同步流程）、`arch.svg`（09 三层架构）。
- L3 角标：页脚项目名 + 结束页印章式徽标（统一位置）。

## 6. 渐变与半透明策略

- 标题块 / Hero 蒙版：`linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)`。
- 图片上叠 `rgba(15,23,42,0.35)` 蒙版保证白字清晰（封面/结束）。
- 卡片浅色底：`rgba(79,70,229,0.06)`；浮起感 `boxShadow: 0 4px 20px rgba(0,0,0,0.08)`。

## 7. 页面映射表（契约）

| # | 文件 | 类型 | 角色 | 版式 | L1 文件 | 字数 | 留白 | 色彩分配 | 关键约束 |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 01 | slide_01_cover.jsx | cover | hero | 全幅图+骑线文字 | hero_cover.png | 30 | 35% | 主60%+辅30%+强调15% | 全屏底图+左侧大标题 |
| 02 | slide_02_catalog.jsx | catalog | supporting | 左标题+右内容 | — | 120 | 25% | 主40%+辅25% | 每项≥30字 |
| 03 | slide_03_position.jsx | content | supporting | 非对称双栏 | — | 200 | 28% | 主45%+辅20% | 60:40，禁等分 |
| 04 | slide_04_gesture.jsx | content | supporting | 左大图+右文字 | gesture_drawing.png | 220 | 26% | 图主视觉+强5% | 图占60%宽 |
| 05 | slide_05_principle.jsx | content | supporting | 上大图+下方卡片 | hand_landmarks.svg | 210 | 24% | 主40%+辅25% | SVG 骨架占上55% |
| 06 | slide_06_collab.jsx | content | supporting | 左大图+右文字 | collaboration.png | 200 | 26% | 图主视觉+强5% | 图占60%宽 |
| 07 | slide_07_sync.jsx | content | supporting | 图表+洞察 | sync_flow.svg | 160 | 22% | 主40%+辅20% | 流程SVG+洞察框 |
| 08 | slide_08_ai.jsx | content | hero | 左大图+右文字 | ai_generation.png | 200 | 30% | 主50%+强18% | 图占60%宽 |
| 09 | slide_09_arch.jsx | content | supporting | 图表+洞察 | arch.svg | 170 | 22% | 主40%+辅20% | 三层架构SVG |
| 10 | slide_10_deploy.jsx | content | supporting | 左标题+右内容 | — | 180 | 24% | 主40%+辅25% | 三步+部署要点 |
| 11 | slide_11_highlight.jsx | content | supporting | 巨型数字+洞察 | 大数字 | 150 | 28% | 强15%爆发 | ≥72px 锚点数字 |
| 12 | slide_12_end.jsx | ending | hero | 全幅图+骑线文字 | L3 角标 | 30 | 40% | 主50%+强15% | 收束金句 |
