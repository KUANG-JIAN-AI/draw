// slide_08_ai.jsx — 左大图+右文字 (hero/peak)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#0F172A' }}>
    <Box style={{ width: 1280, height: 720, flexDirection: 'column', padding: '20px 64px', boxSizing: 'border-box' }}>
        <Box style={{ height: 100, flexDirection: 'row', alignItems: 'center' }}>
            <Box style={{ width: 6, height: 28, background: '#F97316', borderRadius: 3 }} />
            <Text style={{ fontSize: 16, color: '#94A3B8', marginLeft: 14, letterSpacing: 3 }}>04・コア機能 ③・HIGHLIGHT</Text>
        </Box>
        <Box style={{ flex: 1, flexDirection: 'row', gap: 40, marginTop: 8 }}>
            <Box style={{ width: 660, position: 'relative', borderRadius: 18, overflow: 'hidden', boxShadow: '0 12px 40px rgba(249,115,22,0.25)' }}>
                <Image src="resources/images/ai_generation.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 100%)' }} />
                <Box style={{ position: 'absolute', left: 24, bottom: 22, flexDirection: 'row', alignItems: 'center' }}>
                    <Box style={{ width: 8, height: 8, borderRadius: 4, background: '#F97316' }} />
                    <Text style={{ fontSize: 16, color: '#FFFFFF', marginLeft: 10, letterSpacing: 2 }}>SKETCH → AI ART</Text>
                </Box>
            </Box>
            <Box style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, color: '#F97316', letterSpacing: 3, fontWeight: 'bold' }}>AGNES IMAGE・画像から画像生成</Text>
                <Text style={{ fontSize: 42, fontWeight: 'bold', color: '#FFFFFF', lineHeight: 1.15, marginTop: 12 }}>
                    落書きをワンクリックで<span style={{ color: '#F97316' }}>"絵"に</span>
                </Text>
                <Box style={{ width: 60, height: 4, background: '#F97316', marginTop: 16, borderRadius: 2 }} />
                <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 16, lineHeight: 1.55 }}>
                    キャンバスを自動で白背景PNGに書き出し、<span style={{ color: '#06B6D4', fontWeight: 'bold' }}>AGNES_API_KEY</span> を通じて Agnes Image API と接続。<br />プロンプト＋スタイル／サイズ／モデルを選ぶだけで、数秒で完成品を取得。
                </Text>
                <Box style={{ flexDirection: 'column', marginTop: 18, gap: 10 }}>
                    {[
                        { icon: 'image', t: '白背景PNGを書き出し', d: '透明キャンバス→クリーンな入力画像。' },
                        { icon: 'sliders', t: 'サイズ／モデル選択可', d: '1024×1024 / 1024×768 / 768×1024。' },
                        { icon: 'wand-magic-sparkles', t: 'AGNES_IMAGE_MODELS', d: 'agnes-image-2.1-flash / 2.0-flash。' },
                    ].map((it) => (
                        <Box key={it.t} style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Box style={{ width: 34, height: 34, borderRadius: 8, background: '#F97316', justifyContent: 'center', alignItems: 'center' }}>
                                <FAIcon name={it.icon} style={{ fill: '#FFFFFF', width: 17, height: 17 }} />
                            </Box>
                            <Box style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#FFFFFF' }}>{it.t}</Text>
                                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 3, lineHeight: 1.45 }}>{it.d}</Text>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
        <Box style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>空中ジェスチャーキャンバス・プロジェクト紹介</Text>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>08 / 12</Text>
        </Box>
    </Box>
</Slide>
