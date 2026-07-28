// slide_01_cover.jsx — 全幅图+骑线文字 (hero/peak)
<Slide style={{ width: 1280, height: 720, padding: 0, background: '#0F172A' }}>
    <Image src="resources/images/hero_cover.png" style={{ position: 'absolute', top: 0, left: 0, width: 1280, height: 720, objectFit: 'cover' }} />
    <Box style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 780, background: 'linear-gradient(to right, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.55) 55%, rgba(15,23,42,0) 100%)' }} />
    <Box style={{ position: 'absolute', right: 0, bottom: 0, width: 460, height: 180, background: 'linear-gradient(to top left, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 100%)' }} />
    <Box style={{ position: 'absolute', left: 80, top: 210, flexDirection: 'column' }}>
        <Box style={{ width: 88, height: 6, background: '#F97316', borderRadius: 3 }} />
        <Text style={{ fontSize: 62, fontWeight: 'bold', color: '#FFFFFF', lineHeight: 1.15, marginTop: 28, letterSpacing: 2 }}>空中ジェスチャー<br />お絵かきキャンバス</Text>
        <Text style={{ fontSize: 28, color: 'rgba(255,255,255,0.85)', marginTop: 18, letterSpacing: 1 }}>Air Gesture Drawing Canvas</Text>
        <Text style={{ fontSize: 22, color: 'rgba(255,255,255,0.72)', marginTop: 20 }}>手をペンに、空気をキャンバスに</Text>
    </Box>
    <Box style={{ position: 'absolute', left: 80, bottom: 56, flexDirection: 'row', alignItems: 'center' }}>
        <Box style={{ width: 36, height: 2, background: '#F97316' }} />
        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', marginLeft: 14, letterSpacing: 2 }}>プロジェクト紹介 · 2026</Text>
    </Box>
</Slide>
