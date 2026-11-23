// Translation mappings for Chinese and Japanese
const translations = {
  zh: {
    toolbar_room: "房间",
    toolbar_more: "更多",
    // Toolbar
    title: "隔空手势画板",
    camera_button: "开启摄像头",
    room_placeholder: "房间名 (默认 lobby)",
    name_placeholder: "昵称 (可选)",
    join_room_button: "加入房间",
    color_label: "颜色",
    black: "黑色",
    pink: "玫红",
    amber: "琥珀",
    green: "绿色",
    blue: "蓝色",
    custom_color: "自定义颜色",
    line_thickness: "线条粗细",
    thin: "细",
    thick: "粗",
    operations: "操作",
    eraser: "橡皮",
    undo: "撤销",
    clear: "清空",
    save: "保存",
    ai_generate: "AI 生成",
    ai_panel_title: "AI 图生图",
    ai_idle: "准备就绪",
    ai_generating: "正在生成",
    ai_done: "生成完成",
    ai_failed: "生成失败",
    ai_download: "下载结果",
    ai_result_loading: "正在生成图片",
    ai_style_label: "风格",
    ai_size_label: "尺寸",
    ai_model_label: "模型",
    ai_prompt_placeholder: "比如：一朵可爱的小花，保留原始形状，变成精致插画",
    style_children: "儿童绘本",
    style_watercolor: "水彩插画",
    style_cartoon3d: "3D 卡通",
    style_sticker: "贴纸图标",
    style_realistic: "写实照片",

    // Status messages
    loading_gesture_lib: "手势识别库还没有加载完成，请稍后再试",
    requesting_camera: "正在请求摄像头权限",
    put_hand: "把手放进画面：食指停在工具上一会儿可选择，捏合画画，张开手掌拖动画布",
    camera_ready: "食指停在工具上一会儿可选择，捏合画画，张开手掌拖动画布",
    move_to_toolbar: "移到中间工具条停住可选择；捏合画画，张开手掌拖动画布",
    select_hover: "停住选择",
    drawing: "正在绘画",
    panning_canvas: "正在拖动画布",
    erasing: "正在擦除",
    color_selected: "已选择颜色",
    line_thin: "已切换为细线",
    line_thick: "已切换为粗线",
    eraser_mode: "已切换到橡皮",
    brush_mode: "已切换到画笔",
    undo_done: "已撤销一步",
    canvas_cleared: "画布已清空",
    image_saved: "已保存图片",
    ai_generation_started: "正在用 AI 美化当前画布",
    ai_generation_done: "AI 图片已生成",
    ai_generation_failed: "AI 生成失败，请检查 API Key 或稍后重试",
    ai_empty_canvas: "请先画一点内容，再使用 AI 生成",
    camera_error: "无法开启摄像头，请检查浏览器权限或使用 localhost 打开",
    room_joined: "已加入房间",
    hud_members: "房间成员",
    hud_empty: "(空)",

    // Gesture actions
    gesture_label: "手势工具栏",
    stage_label: "キャンバス",
    camera_preview: "カメラプレビュー",
  },
  ja: {
    toolbar_room: "ルーム",
    toolbar_more: "その他",
    // Toolbar
    title: "エアジェスチャー画板",
    camera_button: "カメラを開く",
    room_placeholder: "ルーム名 (デフォルト lobby)",
    name_placeholder: "ニックネーム (オプション)",
    join_room_button: "ルームに参加",
    color_label: "色",
    black: "黒",
    pink: "ピンク",
    amber: "琥珀色",
    green: "緑",
    blue: "青",
    custom_color: "カスタムカラー",
    line_thickness: "線の太さ",
    thin: "細い",
    thick: "太い",
    operations: "操作",
    eraser: "消しゴム",
    undo: "やり直す",
    clear: "クリア",
    save: "保存",
    ai_generate: "AI生成",
    ai_panel_title: "AI画像生成",
    ai_idle: "準備完了",
    ai_generating: "生成中",
    ai_done: "生成完了",
    ai_failed: "生成失敗",
    ai_download: "結果を保存",
    ai_result_loading: "画像を生成中",
    ai_style_label: "スタイル",
    ai_size_label: "サイズ",
    ai_model_label: "モデル",
    ai_prompt_placeholder: "例：かわいい小さな花。元の形を保ち、丁寧なイラストにする",
    style_children: "絵本風",
    style_watercolor: "水彩イラスト",
    style_cartoon3d: "3Dカートゥーン",
    style_sticker: "ステッカー",
    style_realistic: "写実写真",

    // Status messages
    loading_gesture_lib: "ジェスチャー認識ライブラリがまだロードされていません。もう少しお待ちください。",
    requesting_camera: "カメラの権限をリクエスト中です",
    put_hand: "手をカメラの前に置いてください。人差し指をツールの上に置くと自動的に選択されます。ピンチで描画、手を開くとキャンバスを移動できます。",
    camera_ready: "人差し指をツールの上に置くと自動的に選択されます。ピンチで描画、手を開くとキャンバスを移動できます。",
    move_to_toolbar: "ツールバーの中央に移動して停止すると選択できます。ピンチで描画、手を開くとキャンバスを移動できます。",
    select_hover: "選択するために停止",
    drawing: "描画中",
    panning_canvas: "キャンバスを移動中",
    erasing: "消去中",
    color_selected: "色を選択しました",
    line_thin: "細線に切り替えました",
    line_thick: "太線に切り替えました",
    eraser_mode: "消しゴムに切り替えました",
    brush_mode: "ブラシに切り替えました",
    undo_done: "一歩戻しました",
    canvas_cleared: "キャンバスをクリアしました",
    image_saved: "画像を保存しました",
    ai_generation_started: "AIで現在のキャンバスを仕上げています",
    ai_generation_done: "AI画像を生成しました",
    ai_generation_failed: "AI生成に失敗しました。API Keyを確認するか、しばらくしてから再試行してください。",
    ai_empty_canvas: "先に少し描いてからAI生成を使ってください",
    camera_error: "カメラを開くことができません。ブラウザのアクセス許可を確認するか、localhostを使用してください。",
    room_joined: "ルームに参加しました",
    hud_members: "ルームメンバー",
    hud_empty: "(空)",

    // Gesture actions
    gesture_label: "ジェスチャーツールバー",
    stage_label: "ジェスチャー画布",
    camera_preview: "カメラプレビュー",
  },
};

Object.assign(translations.zh, {
  ai_preview: "图片预览",
  comparison_original: "绘画原图", comparison_generated: "AI 生成图",
  comparison_original_empty: "生成后展示本次绘画快照", comparison_generated_empty: "生成后在这里查看效果",
  zoom_feedback_active: "双手缩放中", zoom_feedback_ready: "已识别双手",
  zoom_feedback_move: "← 拉开放大 · 靠近缩小 →  松开结束", zoom_feedback_pinch: "两手各捏合拇指和食指，开始缩放",
  zoom_two_hands_hint: "双手各自捏合拇指和食指，拉开放大、靠近缩小；单手继续绘画",
  zoom_two_hands_active: "双手缩放中：拉开放大，靠近缩小；松开结束",
  zoom_controls: "画布缩放", zoom_in: "放大", zoom_out: "缩小", zoom_reset: "恢复 100%", zoom_fit: "适应窗口",
  camera_stop: "关闭摄像头", camera_stopped: "摄像头已关闭", anonymous: "匿名",
  room_error: "加入房间失败，请检查名称长度", room_disconnected: "连接已断开，正在重连；暂时停止同步绘画",
  history_limit: "房间历史已达上限，请保存后清空画布", ai_saved: "生成结果和原图已保存",
  ai_save_failed: "图片已生成，自动保存失败，可下载结果",
});
Object.assign(translations.ja, {
  ai_preview: "画像プレビュー",
  comparison_original: "描いた原画", comparison_generated: "AI 生成画像",
  comparison_original_empty: "生成に使った原画をここに表示", comparison_generated_empty: "生成後に結果をここに表示",
  zoom_feedback_active: "ズーム中", zoom_feedback_ready: "両手を検出",
  zoom_feedback_move: "離すと拡大・近づけると縮小・開いて終了", zoom_feedback_pinch: "両手で親指と人差し指をつまむと開始",
  zoom_two_hands_hint: "両手で親指と人差し指をつまみ、離すと拡大、近づけると縮小。片手で描画",
  zoom_two_hands_active: "両手でズーム中：離すと拡大、近づけると縮小。指を開くと終了",
  zoom_controls: "キャンバスのズーム", zoom_in: "拡大", zoom_out: "縮小", zoom_reset: "100% に戻す", zoom_fit: "全体を表示",
  camera_stop: "カメラを停止", camera_stopped: "カメラを停止しました", anonymous: "匿名",
  room_error: "ルームに参加できませんでした", room_disconnected: "接続が切れました。再接続中です",
  history_limit: "履歴の上限です。保存してからキャンバスをクリアしてください", ai_saved: "生成画像と原画を保存しました",
  ai_save_failed: "生成できましたが自動保存に失敗しました。ダウンロードできます",
});

Object.assign(translations.zh, {
  menu_fist_hold: "已识别握拳，请保持半秒", menu_fist_release: "请先张开手掌，再握拳打开工具",
  menu_tools: "工具", menu_title: "快捷工具", menu_hint: "松开拳头，食指指向按钮停留选择；再次握拳关闭",
  menu_back: "返回画画", menu_confirm: "确认", menu_cancel: "取消",
  menu_opening: "打开工具", menu_closing: "关闭工具", menu_resume: "工具已关闭，松开捏合后重新捏合画画",
  menu_clear_confirm: "确认清空画布？可以撤销。", menu_generate_confirm: "确认使用以下设置生成图片？",
  menu_canvas_hint: "松开捏合后握拳打开工具；捏合画画；张掌拖动；双手捏合缩放",
  precision: "精细", fill: "填色", precision_mode: "精细模式",
  smoothing: "防抖", smoothing_off: "关闭", smoothing_medium: "适中", smoothing_strong: "强",
  fill_hint: "填色模式：指向封闭区域，捏合一次；可撤销。未封闭区域会填到外面。",
  precision_hint: "精细模式：笔尖移动减半。松手后可重新摆位，再捏合落笔。", normal_mode: "普通绘画模式",
  camera_ready: "摄像头已开启：松开捏合后握拳约半秒打开工具，捏合画画",
});
Object.assign(translations.ja, {
  menu_fist_hold: "握った手を認識しました。約0.5秒保持してください", menu_fist_release: "一度手を開いてから、握ってツールを開いてください",
  menu_tools: "ツール", menu_title: "クイックツール", menu_hint: "手を開き、人差し指をボタンに重ねて選択。もう一度握ると閉じます",
  menu_back: "描画に戻る", menu_confirm: "確認", menu_cancel: "キャンセル",
  menu_opening: "ツールを開く", menu_closing: "ツールを閉じる", menu_resume: "ツールを閉じました。つまみを解除してから、再びつまんで描画",
  menu_clear_confirm: "キャンバスを消去しますか？元に戻せます。", menu_generate_confirm: "次の設定で画像を生成しますか？",
  menu_canvas_hint: "つまみを解除して手を握るとツール表示。つまんで描画、開いた手で移動、両手のつまみでズーム",
  precision: "精密", fill: "塗りつぶし", precision_mode: "精密モード",
  smoothing: "手ぶれ補正", smoothing_off: "オフ", smoothing_medium: "中", smoothing_strong: "強",
  fill_hint: "塗りつぶし：閉じた領域で一度つまみます。隙間があると外にも広がります。元に戻す操作が可能です。",
  precision_hint: "精密モード：ペン先の移動量が半分になります。つまみを離して手を置き直せます。", normal_mode: "通常描画モード",
  camera_ready: "カメラ起動済み：つまみを解除して約0.5秒握るとツール表示。つまんで描画",
});

function initialLanguage() {
  try {
    const saved = localStorage.getItem("language");
    if (saved === "zh" || saved === "ja") return saved;
  } catch {
    // Browser storage can be disabled.
  }

  const locale = navigator.languages?.[0] || navigator.language || "";
  return /^zh(?:-|$)/i.test(locale) ? "zh" : "ja";
}

let currentLanguage = initialLanguage();

function t(key) {
  return translations[currentLanguage]?.[key] || translations.zh[key] || key;
}

function setLanguage(lang) {
  if (lang !== "zh" && lang !== "ja") return;
  currentLanguage = lang;
  try {
    localStorage.setItem("language", lang);
  } catch {
    // The selection still applies to the current page.
  }
  updateUIText();
}

function getLanguage() {
  return currentLanguage;
}

function updateUIText() {
  // Update static text elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });

  // Update aria-labels
  document.querySelectorAll("[data-i18n-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-label");
    el.setAttribute("aria-label", t(key));
  });

  // Update the html lang attribute
  document.documentElement.lang = currentLanguage === "ja" ? "ja" : "zh-CN";

  // Trigger custom event for dynamic updates
  window.dispatchEvent(new Event("language-changed"));
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  updateUIText();
});
