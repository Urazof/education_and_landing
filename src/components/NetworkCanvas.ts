// Интерактивная сеть в hero — ЕДИНСТВЕННЫЙ клиентский JS сайта (docs/DESIGN.md, «Hero network canvas»).
// Чистый TypeScript без зависимостей. Запускается из NetworkCanvas.astro на requestIdleCallback.
//
// Поведение:
//  • ~70 узлов на область 1440×760 (масштабируется по площади), медленный дрейф;
//  • связи рисуются при расстоянии < 120px (ink 8% альфы), ~8% узлов — акцентные;
//  • клик рядом с узлом: узел загорается, расходится кольцо, свет перескакивает на соседей
//    (вероятность 55% на связь, глубина ≤ 6, задержка 120–240 мс на скачок), счётчик растёт;
//  • DPR-aware, пересоздание при ресайзе, пауза вне экрана и на скрытой вкладке;
//  • prefers-reduced-motion: сеть статична (без дрейфа и колец), клики по-прежнему зажигают узлы.

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lit: number; // 0..1, затухает
  hot: boolean; // «акцентный» узел
}

interface Pulse {
  x: number;
  y: number;
  r: number;
  a: number;
}

const DENSITY = 70; // узлов на REF_AREA
const REF_AREA = 1440 * 760;
const LINK = 120; // макс. расстояние связи, px
const PICK_RADIUS = 48; // насколько близко к узлу должен попасть клик/тап
const MAX_DEPTH = 6;
const SPREAD_PROBABILITY = 0.55;
const HOT_SHARE = 0.08;

export function initNetwork(canvas: HTMLCanvasElement, scoreEl: HTMLElement | null): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  // Цвета берём из дизайн-токенов (@theme в global.css), а не хардкодим hex.
  // Hex ниже — только запасные значения; держать в синхроне с --color-accent / --color-ink в global.css.
  const css = getComputedStyle(document.documentElement);
  const ACCENT = css.getPropertyValue('--color-accent').trim() || '#2e6a4f';
  const INK = css.getPropertyValue('--color-ink').trim() || '#17150f';

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motion.matches;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let nodes: Node[] = [];
  let pulses: Pulse[] = [];
  let score = 0;
  let visible = true;
  let raf = 0;
  const timers = new Set<number>();

  const active = () => visible && !document.hidden;

  function setup() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    if (rect.width === w && rect.height === h) return; // реальный ресайз, а не шум ResizeObserver
    dpr = window.devicePixelRatio || 1;

    // На мобильных адресная строка показывается/прячется на скролле и чуть меняет высоту hero.
    // Если ширина та же, а высота сдвинулась < 80px — не пересоздаём сеть (иначе пропадает подсветка),
    // а просто подгоняем размер canvas и масштабируем y узлов.
    if (w > 0 && rect.width === w && Math.abs(rect.height - h) < 80) {
      const k = rect.height / h;
      for (const n of nodes) n.y *= k;
      h = rect.height;
      canvas.height = Math.round(h * dpr);
      requestDraw();
      return;
    }

    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    // Таймеры скачков относятся к СТАРЫМ узлам: сбрасываем, иначе они зажгут невидимые узлы и накрутят счётчик.
    timers.forEach((id) => clearTimeout(id));
    timers.clear();
    const count = Math.max(12, Math.round((DENSITY * (w * h)) / REF_AREA));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      lit: 0,
      hot: Math.random() < HOT_SHARE,
    }));
    pulses = [];
    requestDraw();
  }

  function ignite(n: Node, depth: number) {
    if (n.lit > 0.5 || depth > MAX_DEPTH) return;
    n.lit = 1;
    score++;
    if (scoreEl) scoreEl.textContent = String(score).padStart(4, '0');
    if (!reduced) pulses.push({ x: n.x, y: n.y, r: 0, a: 0.5 });
    for (const m of nodes) {
      if (m === n || Math.hypot(m.x - n.x, m.y - n.y) >= LINK) continue;
      if (Math.random() >= SPREAD_PROBABILITY) continue;
      const id = window.setTimeout(
        () => {
          timers.delete(id);
          ignite(m, depth + 1);
          requestDraw();
        },
        120 + Math.random() * 120,
      );
      timers.add(id);
    }
  }

  function onClick(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let best: Node | null = null;
    let bestDist = PICK_RADIUS;
    for (const n of nodes) {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = n;
      }
    }
    if (best) {
      ignite(best, 0);
      requestDraw();
    }
  }

  function step() {
    for (const n of nodes) {
      if (!reduced) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      n.lit *= reduced ? 0.97 : 0.985;
    }
    for (const p of pulses) {
      p.r += 2.2;
      p.a *= 0.93;
    }
    pulses = pulses.filter((p) => p.a > 0.01);
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d >= LINK) continue;
        const lit = Math.max(a.lit, b.lit);
        const on = lit > 0.05;
        ctx.strokeStyle = on ? ACCENT : INK;
        ctx.globalAlpha = (1 - d / LINK) * (on ? 0.25 + lit * 0.5 : 0.08);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const n of nodes) {
      const on = n.lit > 0.05;
      ctx.globalAlpha = on ? 0.4 + n.lit * 0.6 : n.hot ? 0.55 : 0.22;
      ctx.fillStyle = on || n.hot ? ACCENT : INK;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.2 + n.lit * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1.5;
    for (const p of pulses) {
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Цикл анимации запускается только когда он нужен: сеть на экране, вкладка видима, и либо идёт дрейф,
  // либо ещё затухает подсветка/кольца. В reduced-motion после затухания цикл полностью останавливается.
  function frame() {
    raf = 0;
    if (!active()) return;
    step();
    draw();
    if (!reduced || pulses.length > 0 || nodes.some((n) => n.lit > 0.05)) requestDraw();
  }

  function requestDraw() {
    if (!raf && active()) raf = requestAnimationFrame(frame);
  }

  const onMotionChange = (e: MediaQueryListEvent) => {
    reduced = e.matches;
    requestDraw();
  };
  const onVisibility = () => requestDraw();

  canvas.addEventListener('click', onClick);
  motion.addEventListener('change', onMotionChange);
  document.addEventListener('visibilitychange', onVisibility);

  const resizeObserver = new ResizeObserver(setup);
  resizeObserver.observe(canvas);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    requestDraw();
  });
  intersectionObserver.observe(canvas);

  setup();
  requestDraw();

  // Функция очистки (на случай повторной инициализации/View Transitions).
  return () => {
    cancelAnimationFrame(raf);
    timers.forEach((id) => clearTimeout(id));
    canvas.removeEventListener('click', onClick);
    motion.removeEventListener('change', onMotionChange);
    document.removeEventListener('visibilitychange', onVisibility);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
  };
}
