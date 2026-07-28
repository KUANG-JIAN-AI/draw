// slide_06_collab.jsx — 左大图+右文字 (supporting/peak)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#FFFFFF' }}>
    <Box style={{ width: 1280, height: 720, flexDirection: 'column', padding: '20px 64px', boxSizing: 'border-box' }}>
        <Box style={{ height: 100, flexDirection: 'row', alignItems: 'center' }}>
            <Box style={{ width: 6, height: 28, background: '#4F46E5', borderRadius: 3 }} />
            <Text style={{ fontSize: 16, color: '#64748B', marginLeft: 14, letterSpacing: 3 }}>03・コア機能 ②</Text>
        </Box>
        <Box style={{ flex: 1, flexDirection: 'row', gap: 40, marginTop: 8 }}>
            <Box style={{ width: 660, position: 'relative', borderRadius: 18, overflow: 'hidden', boxShadow: '0 12px 36px rgba(15,23,42,0.18)' }}>
                <Image src="resources/images/collaboration.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 130, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 100%)' }} />
                <Box style={{ position: 'absolute', left: 24, bottom: 22, flexDirection: 'row', alignItems: 'center' }}>
                    <Box style={{ width: 8, height: 8, borderRadius: 4, background: '#F97316' }} />
                    <Text style={{ fontSize: 16, color: '#FFFFFF', marginLeft: 10, letterSpacing: 2 }}>SOCKET.IO · REAL-TIME SYNC</Text>
                </Box>
            </Box>
            <Box style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#1E293B', lineHeight: 1.2 }}>多人リアルタイム協働</Text>
                <Text style={{ fontSize: 18, color: '#06B6D4', marginTop: 8, letterSpacing: 2, fontWeight: 'bold' }}>DRAW TOGETHER, INSTANTLY</Text>
                <Box style={{ width: 48, height: 3, background: '#F97316', marginTop: 16, borderRadius: 2 }} />
                <Text style={{ fontSize: 16, color: '#475569', marginTop: 18, lineHeight: 1.7 }}>
                    Flask-SocketIO により、同じルーム(room)内のすべてのクライアントを同一キャンバスに接続。新しい参加者は自動で履歴を受信し、オフラインは自動で削除。
                </Text>
                <Box style={{ flexDirection: 'column', marginTop: 22, gap: 12 }}>
                    {[
                        { icon: 'door-open', t: 'ルームで分離', d: '同じルーム＝同じキャンバス。お互いに干渉しない。' },
                        { icon: 'people-group', t: 'オンラインメンバーを即時表示', d: '左側のメンバーリストで、誰が描いているか一目了然。' },
                        { icon: 'arrows-rotate', t: 'draw_line を即時ブロードキャスト', d: 'ミリ秒単位の同期。取り消し／消去は全員に反映。' },
                    ].map((it) => (
                        <Box key={it.t} style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 14, background: 'rgba(79,70,229,0.06)', borderRadius: 10 }}>
                            <Box style={{ width: 36, height: 36, borderRadius: 8, background: '#4F46E5', justifyContent: 'center', alignItems: 'center' }}>
                                <FAIcon name={it.icon} style={{ fill: '#FFFFFF', width: 18, height: 18 }} />
                            </Box>
                            <Box style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B' }}>{it.t}</Text>
                                <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4, lineHeight: 1.5 }}>{it.d}</Text>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
        <Box style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>空中ジェスチャーキャンバス・プロジェクト紹介</Text>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>06 / 12</Text>
        </Box>
    </Box>
</Slide>
