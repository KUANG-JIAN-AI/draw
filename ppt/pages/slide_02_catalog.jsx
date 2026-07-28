// slide_02_catalog.jsx — 左标题+右内容 (supporting/transition)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#FFFFFF' }}>
    <Box style={{ width: 1280, height: 720, flexDirection: 'column', padding: '20px 64px', boxSizing: 'border-box' }}>
        <Box style={{ height: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Box style={{ width: 6, height: 28, background: '#4F46E5', borderRadius: 3 }} />
                <Text style={{ fontSize: 16, color: '#64748B', marginLeft: 14, letterSpacing: 3 }}>CONTENTS・目次</Text>
            </Box>
        </Box>
        <Box style={{ flex: 1, flexDirection: 'row', gap: 64, marginTop: 20 }}>
            <Box style={{ width: 360, flexDirection: 'column', justifyContent: 'center' }}>
                <Text style={{ fontSize: 96, fontWeight: 'bold', color: '#1E293B', lineHeight: 1 }}>目次</Text>
                <Box style={{ width: 80, height: 4, background: '#4F46E5', marginTop: 24, borderRadius: 2 }} />
                <Text style={{ fontSize: 18, color: '#475569', marginTop: 28, lineHeight: 1.7 }}>
                    ひとつのジェスチャーから、一枚のAI作品まで。<br />このプロジェクトの全体像をご紹介します。
                </Text>
            </Box>
            <Box style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
                {[
                    { n: '01', t: 'プロジェクトの位置づけ', d: 'カメラひとつで、空気を協働できるキャンバスに変える。' },
                    { n: '02', t: '3つのコア機能', d: 'ジェスチャー描画・多人リアルタイム協働・AI画像生成。' },
                    { n: '03', t: '技術アーキテクチャとデプロイ', d: 'MediaPipe + Flask + Socket.IO + Agnes。' },
                    { n: '04', t: 'ハイライトと価値', d: '3つの数字で、その魅力を一目で。' },
                ].map((it) => (
                    <Box key={it.n} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 18, borderBottom: '1px solid #E2E8F0' }}>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#F97316', width: 80, letterSpacing: 1 }}>{it.n}</Text>
                        <Box style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={{ fontSize: 21, fontWeight: 'bold', color: '#1E293B' }}>{it.t}</Text>
                            <Text style={{ fontSize: 15, color: '#64748B', marginTop: 6, lineHeight: 1.5 }}>{it.d}</Text>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
        <Box style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>空中ジェスチャーキャンバス・プロジェクト紹介</Text>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>02 / 12</Text>
        </Box>
    </Box>
</Slide>
