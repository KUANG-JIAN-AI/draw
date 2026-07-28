// slide_11_highlight.jsx — 巨型数字+洞察 (supporting/peak)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#FFFFFF' }}>
    <Box style={{ width: 1280, height: 720, flexDirection: 'column', padding: '20px 64px', boxSizing: 'border-box' }}>
        <Box style={{ height: 100, flexDirection: 'row', alignItems: 'center' }}>
            <Box style={{ width: 6, height: 28, background: '#4F46E5', borderRadius: 3 }} />
            <Text style={{ fontSize: 16, color: '#64748B', marginLeft: 14, letterSpacing: 3 }}>06・プロジェクトのハイライト</Text>
        </Box>
        <Box style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', marginTop: 8 }}>
            <Box style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontSize: 18, color: '#06B6D4', letterSpacing: 3, fontWeight: 'bold' }}>THREE NUMBERS・3つの数字</Text>
                <Box style={{ width: 4, height: 4, borderRadius: 2, background: '#F97316', marginLeft: 10 }} />
                <Text style={{ fontSize: 18, color: '#F97316', marginLeft: 10, letterSpacing: 3, fontWeight: 'bold' }}>このプロジェクトを知る</Text>
            </Box>
            <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#1E293B', marginTop: 14, lineHeight: 1.2 }}>
                何が面白いのか？
            </Text>
            <Box style={{ flexDirection: 'row', marginTop: 32, gap: 32 }}>
                {[
                    {
                        n: '21', unit: '関節', t: '手指の関節',
                        d: '指先から手首まで全関節を追跡し、\n「ジェスチャー」をプログラム可能な筆へ。',
                        color: '#4F46E5',
                    },
                    {
                        n: '<100', unit: 'ms', t: '端末間同期',
                        d: 'draw_line を同じルームの全員へ即時ブロードキャスト。\n遠隔共同描画も遅延を感じない。',
                        color: '#06B6D4',
                    },
                    {
                        n: '1', unit: 'API', t: 'AI画像生成への接続',
                        d: 'Agnes Image を1回呼ぶだけで、\n手書きの落書きを公開可能な作品に。',
                        color: '#F97316',
                    },
                ].map((b, i) => (
                    <Box key={i} style={{ flex: 1, padding: 24, background: '#F8FAFC', borderRadius: 18, borderTop: `4px solid ${b.color}` }}>
                        <Box style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={{ fontSize: 92, fontWeight: 'bold', color: b.color, lineHeight: 1, letterSpacing: 1 }}>{b.n}</Text>
                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: b.color, marginLeft: 6 }}>{b.unit}</Text>
                        </Box>
                        <Box style={{ width: 36, height: 2, background: b.color, marginTop: 14, opacity: 0.4 }} />
                        <Text style={{ fontSize: 21, fontWeight: 'bold', color: '#1E293B', marginTop: 12 }}>{b.t}</Text>
                        <Text style={{ fontSize: 14, color: '#64748B', marginTop: 8, lineHeight: 1.5 }}>{b.d}</Text>
                    </Box>
                ))}
            </Box>
            <Box style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28, padding: 14, background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(6,182,212,0.08) 100%)', borderRadius: 10 }}>
                <FAIcon name='lightbulb' style={{ fill: '#F97316', width: 22, height: 22 }} />
                <Text style={{ fontSize: 16, color: '#1E293B', marginLeft: 12, lineHeight: 1.5 }}>
                    一言で：<span style={{ fontWeight: 'bold', color: '#4F46E5' }}>描くという行為を、指先から空気へ、そしてAIへとバトンタッチする。</span>
                </Text>
            </Box>
        </Box>
        <Box style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>空中ジェスチャーキャンバス・プロジェクト紹介</Text>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>11 / 12</Text>
        </Box>
    </Box>
</Slide>
