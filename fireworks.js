(function () {
  const canvas = document.getElementById("fireworks-canvas");
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
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
  const LAUNCH_INTERVAL_MS = 900;

  let width = 0;
  let height = 0;
  let rockets = [];
  let particles = [];
  let animationId = null;
  let launchTimer = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
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
    const count = 80;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + randomBetween(-0.12, 0.12);
      const speed = randomBetween(2.5, 6.5);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color,
        size: randomBetween(2.5, 4.5),
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    for (let i = rockets.length - 1; i >= 0; i--) {
      const rocket = rockets[i];
      rocket.y -= rocket.speed;

      ctx.shadowColor = rocket.color;
      ctx.shadowBlur = 16;
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
      p.alpha -= 0.011;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";

    animationId = requestAnimationFrame(step);
  }

  function start() {
    if (animationId !== null) return;
    step();
    launchRocket();
    launchTimer = setInterval(() => {
      launchRocket();
      if (Math.random() < 0.6) launchRocket();
      if (Math.random() < 0.25) launchRocket();
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
