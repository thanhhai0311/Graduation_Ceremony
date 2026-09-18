(function () {
  const canvas = document.getElementById("fireworks-canvas");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const COLORS = [
    "#ffd700", // gold
    "#ff4d4d", // red
    "#4dc9ff", // blue
    "#4dff88", // green
    "#c14dff", // purple
    "#ff4dc4", // pink
    "#ff9d4d", // orange
    "#4dfff0", // cyan
    "#ffffff", // white
  ];
  const GRAVITY = 0.045;
  const LAUNCH_INTERVAL_MS = 1300;
  // Giới hạn devicePixelRatio: canvas full-màn-hình ở dpr 3x (phổ biến trên
  // điện thoại) tốn gấp ~4-9 lần số pixel cần vẽ mỗi frame so với dpr 1.5.
  const MAX_DPR = 1.5;
  // ctx.shadowBlur tạo hiệu ứng phát sáng đẹp nhưng cực nặng — bỏ hẳn, thay
  // bằng việc chỉ dựa vào globalCompositeOperation "lighter" (rẻ hơn nhiều,
  // có GPU acceleration) để tạo cảm giác sáng khi các hạt chồng lên nhau.
  // Giới hạn ~30fps thay vì tối đa trình duyệt cho phép (thường 60-120fps)
  // vì đây chỉ là hiệu ứng nền trang trí, không cần mượt tuyệt đối.
  const TARGET_FRAME_MS = 1000 / 30;

  let width = 0;
  let height = 0;
  let rockets = [];
  let particles = [];
  let animationId = null;
  let launchTimer = null;
  let lastFrameTime = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function launchRocket() {
    rockets.push({
      x: randomBetween(width * 0.15, width * 0.85),
      y: height,
      targetY: randomBetween(height * 0.15, height * 0.45),
      speed: randomBetween(4, 6.5),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }

  function explode(x, y, color) {
    const count = 42;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + randomBetween(-0.12, 0.12);
      const speed = randomBetween(2.2, 5.5);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        size: randomBetween(2, 3.5),
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    for (let i = rockets.length - 1; i >= 0; i--) {
      const rocket = rockets[i];
      rocket.y -= rocket.speed;

      ctx.beginPath();
      ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = rocket.color;
      ctx.fill();

      if (rocket.y <= rocket.targetY) {
        explode(rocket.x, rocket.y, rocket.color);
        rockets.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function loop(timestamp) {
    animationId = requestAnimationFrame(loop);
    if (timestamp - lastFrameTime < TARGET_FRAME_MS) return;
    lastFrameTime = timestamp;
    render();
  }

  function start() {
    if (animationId !== null) return;
    lastFrameTime = 0;
    animationId = requestAnimationFrame(loop);
    launchRocket();
    launchTimer = setInterval(() => {
      launchRocket();
      if (Math.random() < 0.35) launchRocket();
    }, LAUNCH_INTERVAL_MS);
  }

  function stop() {
    if (animationId !== null) cancelAnimationFrame(animationId);
    animationId = null;
    if (launchTimer !== null) clearInterval(launchTimer);
    launchTimer = null;
    ctx.clearRect(0, 0, width, height);
  }

  window.addEventListener("resize", resize);
  resize();

  if (!prefersReducedMotion) {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
    start();
  }
})();
