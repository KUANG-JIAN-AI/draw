// slide_09_arch.jsx — 图表+洞察 (supporting/valley)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#FFFFFF' }}>
    <Box style={{ width: 1280, height: 720, flexDirection: 'column', padding: '20px 64px', boxSizing: 'border-box' }}>
        <Box style={{ height: 100, flexDirection: 'row', alignItems: 'center' }}>
            <Box style={{ width: 6, height: 28, background: '#4F46E5', borderRadius: 3 }} />
            <Text style={{ fontSize: 16, color: '#64748B', marginLeft: 14, letterSpacing: 3 }}>05・技術アーキテクチャ</Text>
        </Box>
        <Box style={{ flex: 1, flexDirection: 'row', gap: 32, marginTop: 8 }}>
            <Box style={{ flex: 1.5, background: '#F8FAFC', borderRadius: 18, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, color: '#06B6D4', letterSpacing: 2, fontWeight: 'bold' }}>THREE-LAYER ARCHITECTURE</Text>
                <Text style={{ fontSize: 21, fontWeight: 'bold', color: '#1E293B', marginTop: 8 }}>フロントエンド／バックエンド／AIサービス 3層の協働</Text>
                <Image src="resources/images/diagram9_arch.png" style={{ width: '100%', maxWidth: 720, height: 'auto', marginTop: 12 }} />
            </Box>
            <Box style={{ width: 360, flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                <Box style={{ padding: 18, background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(249,115,22,0.1) 100%)', borderRadius: 14 }}>
                    <Text style={{ fontSize: 16, color: '#4F46E5', fontWeight: 'bold', letterSpacing: 2 }}>INSIGHT・アーキテクチャの特徴</Text>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 8, lineHeight: 1.4 }}>
                        軽量フルスタック、最小限の依存
                    </Text>
                    <Text style={{ fontSize: 14, color: '#475569', marginTop: 10, lineHeight: 1.65 }}>
                        データベースもメッセージキューもなし。<br />単一ファイル app.py 約270行で全体のロジックが動作。
                    </Text>
                </Box>
                {[
                    { t: 'requirements.txt', d: '依存はわずか6個。' },
                    { t: '単一プロセスでデプロイ可', d: 'gunicorn + geventwebsocket。' },
                ].map((c) => (
                    <Box key={c.t} style={{ padding: 14, background: '#F8FAFC', borderRadius: 10, borderLeft: '3px solid #F97316' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>{c.t}</Text>
                        <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4, lineHeight: 1.5 }}>{c.d}</Text>
                    </Box>
                ))}
            </Box>
        </Box>
        <Box style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>空中ジェスチャーキャンバス・プロジェクト紹介</Text>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>09 / 12</Text>
        </Box>
    </Box>
</Slide>
