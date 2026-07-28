// slide_12_end.jsx — 全幅图+骑线文字 (hero/peak)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#0F172A' }}>
    <Box style={{ position: 'absolute', top: 0, left: 0, width: 1280, height: 720, background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 50%, #0C4A6E 100%)' }} />
    <svg width='1280' height='720' viewBox='0 0 1280 720' style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
            <radialGradient id='glow1' cx='50%' cy='50%' r='50%'>
                <stop offset='0%' stopColor='#4F46E5' stopOpacity='0.45' />
                <stop offset='100%' stopColor='#4F46E5' stopOpacity='0' />
            </radialGradient>
            <radialGradient id='glow2' cx='50%' cy='50%' r='50%'>
                <stop offset='0%' stopColor='#F97316' stopOpacity='0.35' />
                <stop offset='100%' stopColor='#F97316' stopOpacity='0' />
            </radialGradient>
        </defs>
        <circle cx='980' cy='220' r='240' fill='url(#glow1)' />
        <circle cx='300' cy='540' r='200' fill='url(#glow2)' />
        <line x1='120' y1='180' x2='1160' y2='180' stroke='#4F46E5' strokeWidth='1' opacity='0.25' />
        <line x1='120' y1='540' x2='1160' y2='540' stroke='#06B6D4' strokeWidth='1' opacity='0.25' />
    </svg>
    <Box style={{ position: 'absolute', left: 80, top: 200, flexDirection: 'column' }}>
        <Box style={{ width: 88, height: 6, background: '#F97316', borderRadius: 3 }} />
        <Text style={{ fontSize: 28, color: 'rgba(255,255,255,0.7)', marginTop: 28, letterSpacing: 6 }}>THANK YOU FOR WATCHING</Text>
        <Text style={{ fontSize: 84, fontWeight: 'bold', color: '#FFFFFF', lineHeight: 1.1, marginTop: 18, letterSpacing: 2 }}>
            一緒に、空気を<br />キャンバスに。
        </Text>
        <Text style={{ fontSize: 22, color: 'rgba(255,255,255,0.65)', marginTop: 28, lineHeight: 1.7 }}>
            本プロジェクトはオープンソース。ぜひ clone して動かしてみてください。<br />カメラとブラウザがあれば十分です。
        </Text>
    </Box>
    <Box style={{ position: 'absolute', left: 80, bottom: 56, flexDirection: 'row', alignItems: 'center' }}>
        <Box style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', justifyContent: 'center', alignItems: 'center' }}>
            <FAIcon name='rocket' style={{ fill: '#FFFFFF', width: 18, height: 18 }} />
        </Box>
        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginLeft: 14, letterSpacing: 2 }}>python app.py・今すぐ始める</Text>
    </Box>
    <Box style={{ position: 'absolute', right: 64, bottom: 56, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>12 / 12</Text>
    </Box>
</Slide>
