// slide_05_principle.jsx — 上大图+下方卡片 (supporting/valley)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#FFFFFF' }}>
    <Box style={{ width: 1280, height: 720, flexDirection: 'column', padding: '20px 64px', boxSizing: 'border-box' }}>
        <Box style={{ height: 100, flexDirection: 'row', alignItems: 'center' }}>
            <Box style={{ width: 6, height: 28, background: '#4F46E5', borderRadius: 3 }} />
            <Text style={{ fontSize: 16, color: '#64748B', marginLeft: 14, letterSpacing: 3 }}>02・ジェスチャー認識の仕組み</Text>
        </Box>
        <Box style={{ flex: 1, flexDirection: 'column', marginTop: 8 }}>
            <Box style={{ height: 320, flexDirection: 'row', background: 'linear-gradient(135deg, #EEF2FF 0%, #ECFEFF 100%)', borderRadius: 18, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Image src="resources/images/diagram5_hand.png" style={{ width: 240, height: 320, objectFit: 'contain' }} />
                <Box style={{ flexDirection: 'column', marginLeft: 48, maxWidth: 520 }}>
                    <Text style={{ fontSize: 18, color: '#06B6D4', letterSpacing: 3, fontWeight: 'bold' }}>MEDIAPIPE HANDS</Text>
                    <Text style={{ fontSize: 34, fontWeight: 'bold', color: '#1E293B', marginTop: 12, lineHeight: 1.25 }}>
                        各フレームで手指の <span style={{ color: '#F97316' }}>21</span> 個の関節を認識
                    </Text>
                    <Text style={{ fontSize: 17, color: '#475569', marginTop: 16, lineHeight: 1.7 }}>
                        ブラウザ上で WebAssembly + WebGL によりモデルを実行。<br />通信不要、プラグイン不要、1フレーム10ms未満。
                    </Text>
                </Box>
            </Box>
            <Box style={{ flexDirection: 'row', marginTop: 22, gap: 24 }}>
                {[
                    { n: '21', t: '個の関節', d: '手首から指先まで、全関節をカバー。' },
                    { n: '<10ms', t: 'フレーム遅延', d: 'ローカル推論で、コマ落ちなし。' },
                    { n: '0', t: '追加依存', d: 'カメラ＋ブラウザで動作。' },
                ].map((c) => (
                    <Box key={c.t} style={{ flex: 1, padding: 20, background: '#F8FAFC', borderRadius: 14, borderLeft: '4px solid #4F46E5' }}>
                        <Box style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={{ fontSize: 44, fontWeight: 'bold', color: '#4F46E5', letterSpacing: 1 }}>{c.n}</Text>
                            <Text style={{ fontSize: 16, color: '#1E293B', marginLeft: 8, fontWeight: 'bold' }}>{c.t}</Text>
                        </Box>
                        <Text style={{ fontSize: 15, color: '#64748B', marginTop: 8, lineHeight: 1.5 }}>{c.d}</Text>
                    </Box>
                ))}
            </Box>
        </Box>
        <Box style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>空中ジェスチャーキャンバス・プロジェクト紹介</Text>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>05 / 12</Text>
        </Box>
    </Box>
</Slide>
