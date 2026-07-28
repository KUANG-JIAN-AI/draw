// slide_10_deploy.jsx — 左标题+右内容 (supporting/valley)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#FFFFFF' }}>
    <Box style={{ width: 1280, height: 720, flexDirection: 'column', padding: '20px 64px', boxSizing: 'border-box' }}>
        <Box style={{ height: 100, flexDirection: 'row', alignItems: 'center' }}>
            <Box style={{ width: 6, height: 28, background: '#4F46E5', borderRadius: 3 }} />
            <Text style={{ fontSize: 16, color: '#64748B', marginLeft: 14, letterSpacing: 3 }}>05・デプロイと実行</Text>
        </Box>
        <Box style={{ flex: 1, flexDirection: 'row', gap: 40, marginTop: 8 }}>
            <Box style={{ width: 340, flexDirection: 'column', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, color: '#06B6D4', letterSpacing: 3, fontWeight: 'bold' }}>DEPLOY・RUN</Text>
                <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#1E293B', lineHeight: 1.15, marginTop: 14 }}>
                    <span style={{ color: '#4F46E5' }}>3ステップ</span>で開始
                </Text>
                <Box style={{ width: 60, height: 4, background: '#F97316', marginTop: 16, borderRadius: 2 }} />
                <Text style={{ fontSize: 15, color: '#475569', marginTop: 20, lineHeight: 1.7 }}>
                    ローカルはコマンドひとつで体験でき、<br />Procfile 1行でクラウドへ。
                </Text>
                <Box style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28, gap: 8 }}>
                    <FAIcon name='circle-info' style={{ fill: '#F97316', width: 18, height: 18 }} />
                    <Text style={{ fontSize: 14, color: '#475569' }}>Python 3.12以上とカメラが必要</Text>
                </Box>
            </Box>
            <Box style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
                {[
                    {
                        n: '01', t: '依存のインストール', cmd: 'pip install -r requirements.txt',
                        desc: 'Flask・Flask-SocketIO・gevent・gevent-websocket',
                    },
                    {
                        n: '02', t: '環境変数の設定', cmd: 'AGNES_API_KEY="あなたのキー"',
                        desc: '.env.example を .env にコピーして記入。',
                    },
                    {
                        n: '03', t: 'サービスの起動', cmd: 'python app.py → http://127.0.0.1:5000',
                        desc: 'または Procfile + gunicorn + geventwebsocket で Heroku 系プラットフォームへデプロイ。',
                    },
                ].map((s) => (
                    <Box key={s.n} style={{ flexDirection: 'row', alignItems: 'stretch', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        <Box style={{ width: 72, background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1 }}>{s.n}</Text>
                        </Box>
                        <Box style={{ flex: 1, padding: '14px 18px', flexDirection: 'column' }}>
                            <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1E293B' }}>{s.t}</Text>
                            <Box style={{ background: '#0F172A', borderRadius: 6, padding: '8px 12px', marginTop: 10 }}>
                                <Text style={{ fontSize: 14, color: '#06B6D4', fontFamily: 'Inter, monospace' }}>{s.cmd}</Text>
                            </Box>
                            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 8, lineHeight: 1.5 }}>{s.desc}</Text>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
        <Box style={{ height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>空中ジェスチャーキャンバス・プロジェクト紹介</Text>
            <Text style={{ fontSize: 14, color: '#94A3B8' }}>10 / 12</Text>
        </Box>
    </Box>
</Slide>
