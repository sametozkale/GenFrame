/**
 * Generation Border Animation
 * 1512x982px frame with shapes (triangle, square, circle, pentagon, hexagon)
 * appearing along inner edges with smooth fade in/out
 */

const WIDTH = 1512;
const HEIGHT = 982;

// Speed presets: spawnMs, toAdd, lifecycle (fadeIn, hold, fadeOut)
const SPEED_PRESETS = {
  slow: {
    spawnMs: 45,
    toAddMin: 8,
    toAddMax: 14,
    fadeIn: [280, 420],
    hold: [220, 380],
    fadeOut: [280, 420]
  },
  normal: {
    spawnMs: 24,
    toAddMin: 15,
    toAddMax: 26,
    fadeIn: [220, 360],
    hold: [180, 320],
    fadeOut: [220, 360]
  },
  fast: {
    spawnMs: 14,
    toAddMin: 18,
    toAddMax: 28,
    fadeIn: [160, 260],
    hold: [120, 220],
    fadeOut: [160, 260]
  },
  'very-fast': {
    spawnMs: 8,
    toAddMin: 20,
    toAddMax: 30,
    fadeIn: [100, 180],
    hold: [80, 150],
    fadeOut: [100, 180]
  }
};

const DENSITY_PRESETS = { '20': 0.2, '33': 0.33, '50': 0.5, '70': 0.7 };
const COLOR_THEMES = {
  default: ['#0089FF', '#1FC16B', '#7D52F4', '#FF8447', '#F6B51E'],
  wonder: ['#D262FF', '#C44EFF', '#B83DFF', '#A020F0', '#8B00D4'],
  blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#1D4ED8', '#1E40AF'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#6D28D9', '#5B21B6'],
  warm: ['#F97316', '#FB923C', '#FDBA74', '#EA580C', '#C2410C'],
  monochrome: ['#171717', '#404040', '#737373', '#a3a3a3', '#d4d4d4'],
  pastel: ['#A5B4FC', '#86EFAC', '#FCD34D', '#FDA4AF', '#C4B5FD']
};
const SHAPE_FILTERS = {
  all: ['triangle', 'square', 'circle', 'pentagon', 'hexagon'],
  circles: ['circle'],
  geometric: ['triangle', 'square', 'hexagon']
};
const SIZE_PRESETS = { small: 12, medium: 16, large: 22 };
const OPACITY_PRESETS = { subtle: [0.3, 0.6], normal: [0.55, 1], bold: [0.75, 1] };
const MARGIN_PRESETS = { tight: 4, normal: 6, wide: 10 };

const DEFAULT_CONFIG = {
  rows: 3,
  speed: 'slow',
  density: '50',
  colorTheme: 'default',
  shapeFilter: 'all',
  size: 'medium',
  opacity: 'normal',
  margin: 'normal',
  easing: 'expo'
};

const EASING_PRESETS = {
  expo: {
    out: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    in: t => (t <= 0 ? 0 : Math.pow(2, 10 * (t - 1)))
  },
  smooth: {
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => Math.pow(t, 3)
  },
  sharp: {
    out: t => 1 - (1 - t) * (1 - t),
    in: t => t * t
  }
};

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeInExpo(t) {
  return t <= 0 ? 0 : Math.pow(2, 10 * (t - 1));
}

/**
 * Precompute all slot coordinates around the frame perimeter
 * Order: top → right → bottom → left
 */
function getSlotCoordinates(rows, width, height, inset, slotSize) {
  const slots = [];
  const topSlotsPerRow = Math.floor((width - inset * 2) / slotSize);
  const sideSlotsPerRow = Math.floor((height - inset * 2) / slotSize);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < topSlotsPerRow; col++) {
      slots.push({
        x: inset + col * slotSize + slotSize / 2,
        y: inset + row * slotSize + slotSize / 2,
        edge: 'top'
      });
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < sideSlotsPerRow; col++) {
      slots.push({
        x: width - inset - row * slotSize - slotSize / 2,
        y: inset + col * slotSize + slotSize / 2,
        edge: 'right'
      });
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < topSlotsPerRow; col++) {
      slots.push({
        x: width - inset - col * slotSize - slotSize / 2,
        y: height - inset - row * slotSize - slotSize / 2,
        edge: 'bottom'
      });
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < sideSlotsPerRow; col++) {
      slots.push({
        x: inset + row * slotSize + slotSize / 2,
        y: height - inset - col * slotSize - slotSize / 2,
        edge: 'left'
      });
    }
  }

  return slots;
}

const EDGE_ANGLES = { top: 0, right: Math.PI / 2, bottom: Math.PI, left: -Math.PI / 2 };
const ROTATABLE_SHAPES = new Set(['triangle', 'pentagon', 'hexagon']);

function drawShape(ctx, x, y, size, type, color, alpha, scale, edge) {
  ctx.save();

  ctx.translate(x, y);
  if (ROTATABLE_SHAPES.has(type)) {
    ctx.rotate(EDGE_ANGLES[edge] || 0);
  }
  ctx.scale(scale || 1, scale || 1);

  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;

  const half = size / 2;

  switch (type) {
    case 'triangle': {
      ctx.beginPath();
      ctx.moveTo(0, -half);
      ctx.lineTo(half, half);
      ctx.lineTo(-half, half);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
      break;
    }
    case 'square': {
      ctx.fillRect(-half, -half, size, size);
      break;
    }
    case 'circle': {
      ctx.beginPath();
      ctx.arc(0, 0, half - 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'pentagon': {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = half * Math.cos(angle);
        const py = half * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
      break;
    }
    case 'hexagon': {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6 - Math.PI / 6;
        const px = half * Math.cos(angle);
        const py = half * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function posKey(x, y) {
  return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
}

function getRandomFreeSlotIndex(slotCount, occupiedSet) {
  if (occupiedSet.size >= slotCount) return -1;
  const freeCount = slotCount - occupiedSet.size;

  if (freeCount > slotCount * 0.5) {
    let idx;
    do {
      idx = Math.floor(Math.random() * slotCount);
    } while (occupiedSet.has(idx));
    return idx;
  }

  const free = [];
  for (let i = 0; i < slotCount; i++) {
    if (!occupiedSet.has(i)) free.push(i);
  }
  return free.length ? free[Math.floor(Math.random() * free.length)] : -1;
}

/** Position-based: slots at the same (x,y) share one shape (prevents corner overlap) */
function getRandomFreeSlotIndexByPosition(slots, occupiedPositions) {
  const free = [];
  for (let i = 0; i < slots.length; i++) {
    const key = posKey(slots[i].x, slots[i].y);
    if (!occupiedPositions.has(key)) free.push(i);
  }
  return free.length ? free[Math.floor(Math.random() * free.length)] : -1;
}

/**
 * Active shape – position-based occupancy (prevents overlap at corners)
 */
function createActiveShape(slots, occupiedPositions, speedConfig, shapePool, colorPool, opacityRange) {
  const slotIndex = getRandomFreeSlotIndexByPosition(slots, occupiedPositions);
  if (slotIndex < 0) return null;

  const [fiMin, fiMax] = speedConfig.fadeIn;
  const [hMin, hMax] = speedConfig.hold;
  const [foMin, foMax] = speedConfig.fadeOut;

  return {
    slotIndex,
    shapeType: randomPick(shapePool),
    color: randomPick(colorPool),
    targetOpacity: randomBetween(opacityRange[0], opacityRange[1]),
    fadeInDur: randomBetween(fiMin, fiMax),
    holdDur: randomBetween(hMin, hMax),
    fadeOutDur: randomBetween(foMin, foMax),
    phase: 'in',
    startTime: performance.now()
  };
}

function getAlphaAtTime(shape, now, easeOut, easeIn) {
  const eo = easeOut || easeOutExpo;
  const ei = easeIn || easeInExpo;
  let elapsed = now - shape.startTime;
  let phase = shape.phase;
  const { fadeInDur, holdDur, fadeOutDur } = shape;

  for (;;) {
    if (phase === 'in') {
      if (elapsed >= fadeInDur) {
        elapsed -= fadeInDur;
        phase = 'hold';
        continue;
      }
      const t = elapsed / fadeInDur;
      const alpha = shape.targetOpacity * eo(t);
      const scale = 0.85 + 0.15 * eo(t);
      return { alpha, scale };
    }
    if (phase === 'hold') {
      if (elapsed >= holdDur) {
        elapsed -= holdDur;
        phase = 'out';
        continue;
      }
      return { alpha: shape.targetOpacity, scale: 1 };
    }
    if (phase === 'out') {
      if (elapsed >= fadeOutDur) return null;
      const t = elapsed / fadeOutDur;
      const alpha = shape.targetOpacity * (1 - ei(t));
      return { alpha, scale: 1 };
    }
    return { alpha: shape.targetOpacity, scale: 1 };
  }
}

function getShapeAlpha(shape, now, easeOut, easeIn) {
  const eo = easeOut || easeOutExpo;
  const ei = easeIn || easeInExpo;
  const elapsed = now - shape.startTime;
  const { fadeInDur, holdDur, fadeOutDur } = shape;

  switch (shape.phase) {
    case 'in': {
      if (elapsed >= fadeInDur) {
        shape.phase = 'hold';
        shape.startTime = now;
        return { alpha: shape.targetOpacity, scale: 1 };
      }
      const t = elapsed / fadeInDur;
      const alpha = shape.targetOpacity * eo(t);
      const scale = 0.85 + 0.15 * eo(t);
      return { alpha, scale };
    }
    case 'hold': {
      if (elapsed >= holdDur) {
        shape.phase = 'out';
        shape.startTime = now;
        return { alpha: shape.targetOpacity, scale: 1 };
      }
      return { alpha: shape.targetOpacity, scale: 1 };
    }
    case 'out': {
      if (elapsed >= fadeOutDur) return null;
      const t = elapsed / fadeOutDur;
      const alpha = shape.targetOpacity * (1 - ei(t));
      return { alpha, scale: 1 };
    }
    default:
      return { alpha: shape.targetOpacity, scale: 1 };
  }
}

function init() {
  const canvas = document.getElementById('canvas');
  const frameEl = document.getElementById('frame');
  if (!canvas) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = WIDTH * dpr;
  canvas.height = HEIGHT * dpr;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  let config = { ...DEFAULT_CONFIG };
  let slots = [];
  const activeShapes = [];
  let targetFill = 0;
  let speedConfig = SPEED_PRESETS.normal;

  function getShapePool() {
    return SHAPE_FILTERS[config.shapeFilter] || SHAPE_FILTERS.all;
  }
  function getColorPool() {
    return COLOR_THEMES[config.colorTheme] || COLOR_THEMES.default;
  }
  function getSlotSize() {
    return SIZE_PRESETS[config.size] || 10;
  }
  function getInset() {
    return MARGIN_PRESETS[config.margin] || 6;
  }
  function getOpacityRange() {
    return OPACITY_PRESETS[config.opacity] || OPACITY_PRESETS.normal;
  }
  function getDensityRatio() {
    return DENSITY_PRESETS[config.density] ?? 0.33;
  }

  function rebuildFromConfig() {
    const slotSize = getSlotSize();
    const inset = getInset();
    slots = getSlotCoordinates(config.rows, WIDTH, HEIGHT, inset, slotSize);
    targetFill = Math.floor(slots.length * getDensityRatio());
    speedConfig = SPEED_PRESETS[config.speed] || SPEED_PRESETS.normal;
    activeShapes.length = 0;

    const shapePool = getShapePool();
    const colorPool = getColorPool();
    const opacityRange = getOpacityRange();

    const occupiedPositions = new Set();
    const now = performance.now();
    const fullCycle = speedConfig.fadeIn[1] + speedConfig.hold[1] + speedConfig.fadeOut[1];

    for (let i = 0; i < targetFill; i++) {
      const shape = createActiveShape(slots, occupiedPositions, speedConfig, shapePool, colorPool, opacityRange);
      if (shape) {
        shape.startTime = now - (i / Math.max(1, targetFill)) * fullCycle;
        activeShapes.push(shape);
        occupiedPositions.add(posKey(slots[shape.slotIndex].x, slots[shape.slotIndex].y));
      }
    }
  }

  function spawn() {
    if (slots.length === 0) return;

    const shapePool = getShapePool();
    const colorPool = getColorPool();
    const opacityRange = getOpacityRange();

    const toAdd = speedConfig.toAddMin + Math.floor(Math.random() * (speedConfig.toAddMax - speedConfig.toAddMin + 1));
    const occupiedPositions = new Set();
    for (const s of activeShapes) {
      if (s.slotIndex >= 0 && s.slotIndex < slots.length) {
        occupiedPositions.add(posKey(slots[s.slotIndex].x, slots[s.slotIndex].y));
      }
    }

    for (let i = 0; i < toAdd; i++) {
      if (activeShapes.length >= targetFill) {
        const removeIdx = Math.floor(Math.random() * activeShapes.length);
        const removed = activeShapes.splice(removeIdx, 1)[0];
        if (removed.slotIndex >= 0 && removed.slotIndex < slots.length) {
          occupiedPositions.delete(posKey(slots[removed.slotIndex].x, slots[removed.slotIndex].y));
        }
      }

      const shape = createActiveShape(slots, occupiedPositions, speedConfig, shapePool, colorPool, opacityRange);
      if (shape) {
        shape.startTime = performance.now() - Math.random() * (speedConfig.fadeIn[1] + speedConfig.hold[1]);
        activeShapes.push(shape);
        occupiedPositions.add(posKey(slots[shape.slotIndex].x, slots[shape.slotIndex].y));
      }
    }
  }

  let isPaused = false;
  let pausedAt = 0;
  let rafId = null;
  let lastSpawnTime = 0;

  let debounceId = null;
  function applyConfigChange() {
    if (debounceId) clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      debounceId = null;
      rebuildFromConfig();
      lastSpawnTime = performance.now();
    }, 200);
  }

  function syncControlsToConfig() {
    const rowsSelect = document.getElementById('rowsSelect');
    const speedSelect = document.getElementById('speedSelect');
    const densitySelect = document.getElementById('densitySelect');
    const colorThemeSelect = document.getElementById('colorThemeSelect');
    const shapeFilterSelect = document.getElementById('shapeFilterSelect');
    const sizeSelect = document.getElementById('sizeSelect');
    const opacitySelect = document.getElementById('opacitySelect');
    const marginSelect = document.getElementById('marginSelect');

    if (rowsSelect) rowsSelect.value = String(config.rows);
    if (speedSelect) speedSelect.value = config.speed;
    if (densitySelect) densitySelect.value = config.density;
    if (colorThemeSelect) colorThemeSelect.value = config.colorTheme;
    if (shapeFilterSelect) shapeFilterSelect.value = config.shapeFilter;
    if (sizeSelect) sizeSelect.value = config.size;
    if (opacitySelect) opacitySelect.value = config.opacity;
    if (marginSelect) marginSelect.value = config.margin;

    const easingSelect = document.getElementById('easingSelect');
    if (easingSelect) easingSelect.value = config.easing;
  }

  function bindControls() {
    const rowsSelect = document.getElementById('rowsSelect');
    if (rowsSelect) {
      rowsSelect.addEventListener('change', () => {
        config.rows = parseInt(rowsSelect.value, 10);
        applyConfigChange();
      });
    }

    const speedSelect = document.getElementById('speedSelect');
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        config.speed = speedSelect.value;
        applyConfigChange();
      });
    }

    const densitySelect = document.getElementById('densitySelect');
    if (densitySelect) {
      densitySelect.addEventListener('change', () => {
        config.density = densitySelect.value;
        targetFill = Math.floor(slots.length * getDensityRatio());
        applyConfigChange();
      });
    }

    const colorThemeSelect = document.getElementById('colorThemeSelect');
    if (colorThemeSelect) {
      colorThemeSelect.addEventListener('change', () => {
        config.colorTheme = colorThemeSelect.value;
        applyConfigChange();
      });
    }

    const shapeFilterSelect = document.getElementById('shapeFilterSelect');
    if (shapeFilterSelect) {
      shapeFilterSelect.addEventListener('change', () => {
        config.shapeFilter = shapeFilterSelect.value;
        applyConfigChange();
      });
    }

    const sizeSelect = document.getElementById('sizeSelect');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', () => {
        config.size = sizeSelect.value;
        applyConfigChange();
      });
    }

    const opacitySelect = document.getElementById('opacitySelect');
    if (opacitySelect) {
      opacitySelect.addEventListener('change', () => {
        config.opacity = opacitySelect.value;
        applyConfigChange();
      });
    }

    const marginSelect = document.getElementById('marginSelect');
    if (marginSelect) {
      marginSelect.addEventListener('change', () => {
        config.margin = marginSelect.value;
        applyConfigChange();
      });
    }

    const easingSelect = document.getElementById('easingSelect');
    if (easingSelect) {
      easingSelect.addEventListener('change', () => {
        config.easing = easingSelect.value;
      });
    }

    const toggleBtn = document.getElementById('toggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        toggleBtn.textContent = isPaused ? 'Resume' : 'Stop';
        toggleBtn.classList.toggle('paused', isPaused);
        if (isPaused) {
          pausedAt = performance.now();
          loop(pausedAt);
        } else {
          lastSpawnTime = performance.now();
          loop(performance.now());
        }
      });
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        config = { ...DEFAULT_CONFIG };
        syncControlsToConfig();
        applyConfigChange();
      });
    }

    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn && frameEl) {
      const updateFullscreenBtn = () => {
        fullscreenBtn.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
        fullscreenBtn.classList.toggle('paused', !!document.fullscreenElement);
      };
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          frameEl.requestFullscreen?.() || frameEl.webkitRequestFullscreen?.();
        } else {
          document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
      });
      document.addEventListener('fullscreenchange', updateFullscreenBtn);
      document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);
    }

    document.addEventListener('keydown', e => {
      if (e.code === 'Space' && !e.repeat) {
        const target = e.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'BUTTON' || target.isContentEditable)) return;
        e.preventDefault();
        if (toggleBtn) toggleBtn.click();
      }
    });

    const randomizeBtn = document.getElementById('randomizeBtn');
    if (randomizeBtn) {
      randomizeBtn.addEventListener('click', () => {
        config = {
          rows: randomPick([1, 2, 3, 4, 5]),
          speed: randomPick(['slow', 'normal', 'fast', 'very-fast']),
          density: randomPick(['20', '33', '50', '70']),
          colorTheme: randomPick(['default', 'wonder', 'blue', 'purple', 'warm', 'monochrome', 'pastel']),
          shapeFilter: randomPick(['all', 'circles', 'geometric']),
          size: randomPick(['small', 'medium', 'large']),
          opacity: randomPick(['subtle', 'normal', 'bold']),
          margin: randomPick(['tight', 'normal', 'wide']),
          easing: randomPick(['expo', 'smooth', 'sharp'])
        };
        syncControlsToConfig();
        applyConfigChange();
        randomizeBtn.textContent = 'Randomized!';
        setTimeout(() => { randomizeBtn.textContent = 'Randomize'; }, 800);
      });
    }

    const exportPngBtn = document.getElementById('exportPngBtn');
    if (exportPngBtn) {
      exportPngBtn.addEventListener('click', () => {
        try {
          const exportCanvas = document.createElement('canvas');
          exportCanvas.width = WIDTH;
          exportCanvas.height = HEIGHT;
          const exportCtx = exportCanvas.getContext('2d');

          exportCtx.fillStyle = '#ffffff';
          exportCtx.fillRect(0, 0, WIDTH, HEIGHT);
          exportCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, WIDTH, HEIGHT);

          exportCanvas.toBlob(blob => {
            if (!blob) {
              exportPngBtn.textContent = 'Error';
              setTimeout(() => { exportPngBtn.textContent = 'Export PNG'; }, 1000);
              return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generation-border-animation.png';
            a.click();
            URL.revokeObjectURL(url);
            exportPngBtn.textContent = 'Exported!';
            setTimeout(() => { exportPngBtn.textContent = 'Export PNG'; }, 1500);
          }, 'image/png');
        } catch (err) {
          exportPngBtn.textContent = 'Error';
          setTimeout(() => { exportPngBtn.textContent = 'Export PNG'; }, 1000);
        }
      });
    }

    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarEl = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarToggle && sidebarEl) {
      const openSidebar = () => {
        sidebarEl.classList.add('open');
        sidebarToggle.classList.add('active');
        sidebarToggle.setAttribute('aria-expanded', 'true');
        if (sidebarOverlay) {
          sidebarOverlay.classList.add('visible');
          sidebarOverlay.setAttribute('aria-hidden', 'false');
        }
      };
      const closeSidebar = () => {
        sidebarEl.classList.remove('open');
        sidebarToggle.classList.remove('active');
        sidebarToggle.setAttribute('aria-expanded', 'false');
        if (sidebarOverlay) {
          sidebarOverlay.classList.remove('visible');
          sidebarOverlay.setAttribute('aria-hidden', 'true');
        }
      };
      sidebarToggle.addEventListener('click', () => {
        if (sidebarEl.classList.contains('open')) closeSidebar();
        else openSidebar();
      });
      if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
      }
    }

  }

  function getEasingFns() {
    const preset = EASING_PRESETS[config.easing] || EASING_PRESETS.expo;
    return [preset.out, preset.in];
  }

  function update(now, frozen) {
    const t = frozen ? pausedAt : now;
    const slotSize = getSlotSize();
    const [easeOut, easeIn] = getEasingFns();

    for (let i = activeShapes.length - 1; i >= 0; i--) {
      const shape = activeShapes[i];
      const result = frozen ? getAlphaAtTime(shape, t, easeOut, easeIn) : getShapeAlpha(shape, t, easeOut, easeIn);

      if (!result || result.alpha < 0) {
        if (!frozen) activeShapes.splice(i, 1);
        continue;
      }

      if (shape.slotIndex < 0 || shape.slotIndex >= slots.length) continue;
      const slot = slots[shape.slotIndex];
      drawShape(ctx, slot.x, slot.y, slotSize, shape.shapeType, shape.color, result.alpha, result.scale, slot.edge);
    }
  }

  let firstFrameDrawn = false;
  function loop(now) {
    if (!isPaused) rafId = requestAnimationFrame(loop);
    try {
      if (!isPaused && now - lastSpawnTime >= speedConfig.spawnMs) {
        spawn();
        lastSpawnTime = now;
      }
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      update(now, isPaused);
    } catch (err) {
      console.error('Animation error:', err);
    }
    if (!firstFrameDrawn && canvas) {
      firstFrameDrawn = true;
      canvas.classList.add('loaded');
    }
  }

  rebuildFromConfig();
  bindControls();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    targetFill = Math.floor(slots.length * 0.2);
    speedConfig = {
      spawnMs: (SPEED_PRESETS.normal.spawnMs || 24) * 2,
      toAddMin: 4,
      toAddMax: 8,
      fadeIn: [440, 720],
      hold: [360, 640],
      fadeOut: [440, 720]
    };
    activeShapes.length = 0;
    const shapePool = getShapePool();
    const colorPool = getColorPool();
    const opacityRange = getOpacityRange();
    const occupiedPositions = new Set();
    for (let i = 0; i < targetFill; i++) {
      const shape = createActiveShape(slots, occupiedPositions, speedConfig, shapePool, colorPool, opacityRange);
      if (shape) {
        activeShapes.push(shape);
        occupiedPositions.add(posKey(slots[shape.slotIndex].x, slots[shape.slotIndex].y));
      }
    }
  }

  lastSpawnTime = performance.now();
  rafId = requestAnimationFrame(loop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
