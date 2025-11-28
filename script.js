// 核心：音乐控制、祝福语轮播、滚动渐入、庆祝烟花/彩带、花瓣/爱心飘落

(() => {
  const musicBtn = document.getElementById('music-btn');
  const celebrateBtn = document.getElementById('celebrate-btn');
  const wishText = document.getElementById('wish-text');
  const canvas = document.getElementById('fx-canvas');
  const ctx = canvas.getContext('2d');

  // 祝福文案（可自定义）
  const wishes = [
    '新婚快乐，愿你们岁岁年年共婵娟。',
    '相伴一生，愿所有温柔都如约而至。',
    '愿日子清澈，愿爱意长流。',
    '携手同行，去看每一个日出与日落。',
    '愿你们的家，被欢笑与光照亮。'
  ];

  // 轮播祝福
  let wishIdx = 0;
  setInterval(() => {
    wishIdx = (wishIdx + 1) % wishes.length;
    wishText.style.opacity = 0;
    setTimeout(() => {
      wishText.textContent = wishes[wishIdx];
      wishText.style.opacity = 1;
    }, 300);
  }, 3800);

  // 滚动渐入
  const revealEls = [...document.querySelectorAll('.reveal')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // 音乐：尝试加载文件，不可用则合成伴奏
  let audio, audioCtx, oscGain;
  function setupAudio() {
    try {
      const src = 'assets/audio/wedding-music.mp3';
      audio = new Audio(src);
      audio.loop = true;
      audio.addEventListener('error', synthFallback);
    } catch { synthFallback(); }
  }
  function synthFallback() {
    // 柔和三音合成伴奏
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = [220, 277, 330];
    oscGain = audioCtx.createGain();
    oscGain.gain.value = 0.06; // 低音量
    oscGain.connect(audioCtx.destination);
    notes.forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = i === 0 ? 'sine' : (i === 1 ? 'triangle' : 'square');
      osc.frequency.value = f;
      const g = audioCtx.createGain();
      g.gain.value = i === 2 ? 0.04 : 0.06;
      osc.connect(g).connect(oscGain);
      osc.start();
    });
  }
  function toggleMusic() {
    if (audio && !audio.paused) { audio.pause(); musicBtn.textContent = '播放音乐'; return; }
    if (audio) { audio.play(); musicBtn.textContent = '暂停音乐'; return; }
    // 合成音
    if (!audioCtx) { synthFallback(); musicBtn.textContent = '暂停音乐'; }
    else {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      musicBtn.textContent = '暂停音乐';
    }
  }

  // 画布尺寸
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  addEventListener('resize', resize); resize();

  // 粒子系统：烟花 & 彩带
  const particles = [];
  function rand(a, b) { return a + Math.random() * (b - a); }
  function addConfettiBurst(x, y, n = 80) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x, y,
        vx: rand(-3, 3), vy: rand(-10, -5),
        g: rand(0.15, 0.35),
        life: rand(60, 120),
        color: `hsl(${Math.floor(rand(0,360))}deg,90%,60%)`,
        type: 'confetti',
        size: rand(2, 4)
      });
    }
  }
  function addFirework(x, y, n = 180) {
    for (let i = 0; i < n; i++) {
      const ang = rand(0, Math.PI * 2);
      const spd = rand(2, 7);
      particles.push({
        x, y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        g: 0.05, life: rand(70, 140),
        color: `hsl(${Math.floor(rand(0,360))}deg,100%,70%)`,
        type: 'spark', size: rand(1.5, 3.5)
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.life--;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.type === 'confetti') ctx.rect(p.x, p.y, p.size, p.size * 1.8);
      else ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      if (p.life <= 0 || p.y > canvas.height + 50) particles.splice(i, 1);
    }
    requestAnimationFrame(step);
  }
  step();

  // 花瓣/爱心飘落
  function spawnFaller(kind = 'petal') {
    const el = document.createElement('div');
    el.className = kind;
    const x = Math.random() * innerWidth;
    el.style.left = `${x}px`;
    el.style.animation = `fall ${rand(12, 24)}s linear`; // 随机速度
    el.style.setProperty('--x', `${rand(-60, 60)}px`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 26000);
  }
  setInterval(() => spawnFaller(Math.random() < 0.6 ? 'petal' : 'heart'), 900);

  // 庆祝：烟花 + 彩带
  function celebrate() {
    const cx = canvas.width / 2, cy = canvas.height / 3;
    addFirework(cx, cy);
    addConfettiBurst(cx, cy);
    // 边缘也来一点
    addConfettiBurst(rand(50, canvas.width - 50), rand(50, canvas.height / 2));
  }

  // 绑定事件
  musicBtn?.addEventListener('click', toggleMusic);
  celebrateBtn?.addEventListener('click', celebrate);
  setupAudio();
})();
