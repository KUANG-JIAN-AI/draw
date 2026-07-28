// slide_04_gesture.jsx — 左大图+右文字 (supporting/peak)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#FFFFFF' }}>
    <Box style={{ width: 1280, height: 720, flexDirection: 'column', padding: '20px 64px', boxSizing: 'border-box' }}>
        <Box style={{ height: 100, flexDirection: 'row', alignItems: 'center' }}>
            <Box style={{ width: 6, height: 28, background: '#4F46E5', borderRadius: 3 }} />
            <Text style={{ fontSize: 16, color: '#64748B', marginLeft: 14, letterSpacing: 3 }}>02・コア機能 ①</Text>
        </Box>
        <Box style={{ flex: 1, flexDirection: 'row', gap: 40, marginTop: 8 }}>
            <Box style={{ width: 660, position: 'relative', borderRadius: 18, overflow: 'hidden', boxShadow: '0 12px 36px rgba(15,23,42,0.18)' }}>
                <Image src="resources/images/gesture_drawing.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 130, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 100%)' }} />
                <Box style={{ position: 'absolute', left: 24, bottom: 22, flexDirection: 'row', alignItems: 'center' }}>
                    <Box style={{ width: 8, height: 8, borderRadius: 4, background: '#F97316' }} />
                    <Text style={{ fontSize: 16, color: '#FFFFFF', marginLeft: 10, letterSpacing: 2 }}>MEDIAPIPE・LIVE TRACKING</Text>
                </Box>
            </Box>
            <Box style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#1E293B', lineHeight: 1.2 }}>空中ジェスチャー描画</Text>
                <Text style={{ fontSize: 18, color: '#06B6D4', marginTop: 8, letterSpacing: 2, fontWeight: 'bold' }}>PAINT IN THE AIR</Text>
                <Box style={{ width: 48, height: 3, background: '#F97316', marginTop: 16, borderRadius: 2 }} />
                <Text style={{ fontSize: 15, color: '#475569', marginTop: 16, lineHeight: 1.65 }}>
                    カメラの前で手を上げ、人差し指をつまむと筆が下りる。充実したツールバーと組み合わせれば、物理的な入力機器は一切不要。
                </Text>
                <Box style={{ flexDirection: 'column', marginTop: 22, gap: 10 }}>
                    {[
                        { icon: 'palette', t: '色の選択' },
                        { icon: 'pen', t: '線幅の切り替え' },
                        { icon: 'eraser', t: '消しゴムモード' },
                        { icon: 'arrow-rotate-left', t: 'ワンクリック元に戻す' },
                        { icon: 'trash', t: 'キャンバスを消去' },
                        { icon: 'floppy-disk', t: 'ローカル保存' },
                    ].map((it) => (
                        <Box key={it.t} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Box style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(6,182,212,0.12)', justifyContent: 'center', alignItems: 'center' }}>
                                <FAIcon name={it.icon} style={{ fill: '#06B6D4', width: 16, height: 16 }} />
                            </Box>
                            <Text style={{ fontSize: 16, color: '#1E293B', marginLeft: 12 }}>{it.t}</Text>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
        <Box style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>空中ジェスチャーキャンバス・プロジェクト紹介</Text>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>04 / 12</Text>
        </Box>
    </Box>
</Slide>
