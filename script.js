// 核心：音乐控制、祝福语轮播、滚动渐入、庆祝烟花/彩带、花瓣/爱心飘落
// 构建模式下通过 webpack 注入样式
import './styles.css';

(() => {
  const musicBtn = document.getElementById('music-btn');
  const celebrateBtn = document.getElementById('celebrate-btn');
  const wishText = document.getElementById('wish-text');
  const canvas = document.getElementById('fx-canvas');
  const ctx = canvas.getContext('2d');
  const countdownEl = document.getElementById('countdown');

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

  // 倒计时逻辑
  function pad(n){return n<10?"0"+n:""+n}
  function updateCountdown(){
    if(!countdownEl) return;
    const targetDateStr = countdownEl.getAttribute('data-date');
    const target = targetDateStr? new Date(targetDateStr): null;
    if(!target || isNaN(target.getTime())) return;
    const now = new Date();
    let diff = target.getTime() - now.getTime();
    if(diff < 0) diff = 0;
    const sec = Math.floor(diff/1000);
    const days = Math.floor(sec/86400);
    const hours = Math.floor((sec%86400)/3600);
    const minutes = Math.floor((sec%3600)/60);
    const seconds = sec%60;
    countdownEl.querySelector('[data-part="days"]').textContent = pad(days);
    countdownEl.querySelector('[data-part="hours"]').textContent = pad(hours);
    countdownEl.querySelector('[data-part="minutes"]').textContent = pad(minutes);
    countdownEl.querySelector('[data-part="seconds"]').textContent = pad(seconds);
    if(diff===0){
      countdownEl.classList.add('finished');
    }
  }
  setInterval(updateCountdown,1000);updateCountdown();

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
        type: 'spark', size: rand(1.5, 3.5), trail: []
      });
    }
  }

  // 添加心形烟花
  function addHeartFirework(x, y, n = 120) {
    for (let i = 0; i < n; i++) {
      const ang = rand(0, Math.PI * 2);
      const spd = rand(1.8, 5.2);
      particles.push({
        x, y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        g: 0.04, life: rand(80, 150),
        color: `hsl(${Math.floor(rand(300,360))}deg,100%,70%)`,
        type: 'heartSpark', size: rand(2, 3.8), trail: []
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.life--;
      ctx.globalCompositeOperation = 'lighter';

      // 拖尾记录
      if (p.trail) {
        p.trail.push({ x: p.x, y: p.y, life: p.life });
        if (p.trail.length > 8) p.trail.shift();
      }
      // 绘制拖尾
      if (p.trail && p.trail.length > 2) {
        ctx.beginPath();
        for (let t = 0; t < p.trail.length; t++) {
          const seg = p.trail[t];
          const alpha = t / p.trail.length;
          ctx.fillStyle = p.color.replace('70%)', `${Math.min(90, 70 + alpha*20)}%)`);
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillRect(seg.x, seg.y, 2, 2);
        }
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.type === 'confetti') {
        ctx.rect(p.x, p.y, p.size, p.size * 1.8);
      } else if (p.type === 'heartSpark') {
        drawHeart(ctx, p.x, p.y, p.size);
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
      if (p.life <= 0 || p.y > canvas.height + 50) particles.splice(i, 1);
    }
    requestAnimationFrame(step);
  }
  step();

  // 画心形
  function drawHeart(context, x, y, s) {
    context.save();
    context.translate(x, y);
    context.scale(s * 0.4, s * 0.4);
    context.beginPath();
    context.moveTo(0, -12);
    context.bezierCurveTo(-12, -28, -38, -4, 0, 16);
    context.bezierCurveTo(38, -4, 12, -28, 0, -12);
    context.closePath();
    context.restore();
  }

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
    // 心形烟花
    addHeartFirework(cx + rand(-120,120), cy + rand(-40,60));
  }

  // 绑定事件
  musicBtn?.addEventListener('click', toggleMusic);
  celebrateBtn?.addEventListener('click', celebrate);
  setupAudio();

  // 翻牌交互
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    card.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });
})();
