// slide_07_sync.jsx — 图表+洞察 (supporting/valley)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#FFFFFF' }}>
    <Box style={{ width: 1280, height: 720, flexDirection: 'column', padding: '20px 64px', boxSizing: 'border-box' }}>
        <Box style={{ height: 100, flexDirection: 'row', alignItems: 'center' }}>
            <Box style={{ width: 6, height: 28, background: '#4F46E5', borderRadius: 3 }} />
            <Text style={{ fontSize: 16, color: '#64748B', marginLeft: 14, letterSpacing: 3 }}>03・リアルタイム同期の仕組み</Text>
        </Box>
        <Box style={{ flex: 1, flexDirection: 'row', gap: 32, marginTop: 8 }}>
            <Box style={{ flex: 1.4, background: '#F8FAFC', borderRadius: 18, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, color: '#06B6D4', letterSpacing: 2, fontWeight: 'bold' }}>SOCKET.IO EVENT FLOW</Text>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginTop: 8 }}>ひとつの操作の全体フロー</Text>
                <Image src="resources/images/diagram7_sync.png" style={{ width: 700, height: 320, marginTop: 16, objectFit: 'contain' }} />
            </Box>
            <Box style={{ width: 380, flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                <Box style={{ padding: 20, background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(6,182,212,0.1) 100%)', borderRadius: 14, border: '1px solid rgba(79,70,229,0.2)' }}>
                    <Text style={{ fontSize: 16, color: '#4F46E5', fontWeight: 'bold', letterSpacing: 2 }}>INSIGHT・インサイト</Text>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginTop: 10 }}>サーバーは「ブロードキャスター」だけ</Text>
                    <Text style={{ fontSize: 15, color: '#475569', marginTop: 10, lineHeight: 1.65 }}>
                        <span style={{ color: '#F97316', fontWeight: 'bold' }}>gevent</span> + GeventWebSocketWorker により単一プロセスで同時接続をさばく。状態はルーム辞書にのみ保持：<br />
                        <span style={{ fontFamily: 'Inter, monospace', color: '#4F46E5' }}>action_history / room_members</span>
                    </Text>
                </Box>
                {[
                    { icon: 'plug', t: 'ミリ秒単位の同期', d: '描画イベント→ブロードキャスト→全端に筆が下りる。' },
                    { icon: 'clock-rotate-left', t: '新メンバーのシームレスな参加', d: '参加と同時に履歴を受信。待ち時間ゼロ。' },
                ].map((c) => (
                    <Box key={c.t} style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 14, background: '#F8FAFC', borderRadius: 10 }}>
                        <Box style={{ width: 36, height: 36, borderRadius: 8, background: '#06B6D4', justifyContent: 'center', alignItems: 'center' }}>
                            <FAIcon name={c.icon} style={{ fill: '#FFFFFF', width: 18, height: 18 }} />
                        </Box>
                        <Box style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1E293B' }}>{c.t}</Text>
                            <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4, lineHeight: 1.5 }}>{c.d}</Text>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
        <Box style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>空中ジェスチャーキャンバス・プロジェクト紹介</Text>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>07 / 12</Text>
        </Box>
    </Box>
</Slide>
