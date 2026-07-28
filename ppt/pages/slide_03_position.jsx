// slide_03_position.jsx — 非对称双栏(60:40) (supporting/valley)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#FFFFFF' }}>
    <Box style={{ width: 1280, height: 720, flexDirection: 'column', padding: '20px 64px', boxSizing: 'border-box' }}>
        <Box style={{ height: 100, flexDirection: 'row', alignItems: 'center' }}>
            <Box style={{ width: 6, height: 28, background: '#4F46E5', borderRadius: 3 }} />
            <Text style={{ fontSize: 16, color: '#64748B', marginLeft: 14, letterSpacing: 3 }}>01・プロジェクトの位置づけ</Text>
        </Box>
        <Box style={{ flex: 1, flexDirection: 'row', gap: 48, marginTop: 8 }}>
            <Box style={{ flex: 1.5, flexDirection: 'column', justifyContent: 'center', paddingRight: 24 }}>
                <Text style={{ fontSize: 18, color: '#06B6D4', letterSpacing: 3, fontWeight: 'bold' }}>AIR · GESTURE · CANVAS</Text>
                <Text style={{ fontSize: 50, fontWeight: 'bold', color: '#1E293B', lineHeight: 1.15, marginTop: 18 }}>
                    カメラひとつで、空気を<span style={{ color: '#4F46E5' }}>協働できる</span>キャンバスに。
                </Text>
                <Box style={{ width: 72, height: 4, background: '#F97316', marginTop: 24, borderRadius: 2 }} />
                <Text style={{ fontSize: 18, color: '#475569', marginTop: 26, lineHeight: 1.65 }}>
                    MediaPipe Hands で21個の手指関節をリアルタイムに追跡し、ジェスチャーを筆に変換します。<br />Socket.IO による多人同期と Agnes Image の画像生成を組み合わせ、ブラウザ上の落書きを"生きた"作品にします。
                </Text>
            </Box>
            <Box style={{ width: 380, flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
                {[
                    { icon: 'hand-pointer', title: 'デバイス不要', desc: 'カメラとブラウザさえあればOK。マウスもキーボードも不要。' },
                    { icon: 'users', title: 'そのまま協働対応', desc: '同じルーム＝同じキャンバス。多人でリアルタイムに共同制作。' },
                    { icon: 'wand-magic-sparkles', title: '制作がひとつのサイクルに', desc: '落書きをAIでワンクリック、公開可能な作品へ。' },
                ].map((v) => (
                    <Box key={v.title} style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 18, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                        <Box style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(79,70,229,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                            <FAIcon name={v.icon} style={{ fill: '#4F46E5', width: 22, height: 22 }} />
                        </Box>
                        <Box style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B' }}>{v.title}</Text>
                            <Text style={{ fontSize: 15, color: '#64748B', marginTop: 6, lineHeight: 1.5 }}>{v.desc}</Text>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
        <Box style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>空中ジェスチャーキャンバス・プロジェクト紹介</Text>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>03 / 12</Text>
        </Box>
    </Box>
</Slide>
