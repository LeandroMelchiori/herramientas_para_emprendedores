/* Rueda Canvas y manejo de puntero. */

const SIZE = 260;
const RING = 24;
const GAP = 6;
const CX = 130;
const CY = 130;
const OUTER_R = 128;
const INNER_R = OUTER_R - RING;
const SQ_HALF = (INNER_R - GAP) * 0.707;
const SQ_X = CX - SQ_HALF;
const SQ_Y = CY - SQ_HALF;
const SQ_W = SQ_HALF * 2;

let canvas;
let ctx;
let dragging = null;
let ringCanvas = null;
let slCacheH = -1;
let slImageData = null;
let rafPending = false;
let pendingXY = null;

/* El anillo de tono no cambia: se dibuja una vez y se reutiliza. */
function buildRingCache() {
  ringCanvas = document.createElement('canvas');
  ringCanvas.width = SIZE;
  ringCanvas.height = SIZE;
  const ringContext = ringCanvas.getContext('2d');

  for (let hue = 0; hue < 360; hue += 1) {
    const start = (hue / 360) * Math.PI * 2 - Math.PI / 2;
    const end = ((hue + 1.5) / 360) * Math.PI * 2 - Math.PI / 2;
    ringContext.beginPath();
    ringContext.moveTo(CX + INNER_R * Math.cos(start), CY + INNER_R * Math.sin(start));
    ringContext.arc(CX, CY, OUTER_R, start, end);
    ringContext.arc(CX, CY, INNER_R, end, start, true);
    ringContext.closePath();
    ringContext.fillStyle = `hsl(${hue},100%,50%)`;
    ringContext.fill();
  }
}

function drawPicker() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.drawImage(ringCanvas, 0, 0);

  const hueRadians = (H / 360) * Math.PI * 2 - Math.PI / 2;
  const ringMiddle = (OUTER_R + INNER_R) / 2;
  const markerX = CX + ringMiddle * Math.cos(hueRadians);
  const markerY = CY + ringMiddle * Math.sin(hueRadians);
  ctx.beginPath();
  ctx.arc(markerX, markerY, RING / 2 - 1, 0, Math.PI * 2);
  ctx.fillStyle = hslToHex(H, 100, 50);
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.stroke();

  const squareWidth = Math.ceil(SQ_W);
  if (slCacheH !== H) {
    slImageData = ctx.createImageData(squareWidth, squareWidth);
    for (let y = 0; y < squareWidth; y += 1) {
      for (let x = 0; x < squareWidth; x += 1) {
        const [red, green, blue] = hslToRgb(H, (x / SQ_W) * 100, 100 - (y / SQ_W) * 100);
        const pixel = (y * squareWidth + x) * 4;
        slImageData.data.set([red, green, blue, 255], pixel);
      }
    }
    slCacheH = H;
  }
  ctx.putImageData(slImageData, SQ_X, SQ_Y);

  const selectionX = SQ_X + (S / 100) * SQ_W;
  const selectionY = SQ_Y + ((100 - L) / 100) * SQ_W;
  ctx.beginPath();
  ctx.arc(selectionX, selectionY, 7, 0, Math.PI * 2);
  ctx.fillStyle = currentHex();
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function getXY(event) {
  const rect = canvas.getBoundingClientRect();
  const pointer = event.touches ? event.touches[0] : event;
  return [
    (pointer.clientX - rect.left) * (SIZE / rect.width),
    (pointer.clientY - rect.top) * (SIZE / rect.height),
  ];
}

function hitZone(x, y) {
  const distance = Math.hypot(x - CX, y - CY);
  return distance >= INNER_R - 6 && distance <= OUTER_R + 6 ? 'ring' : 'square';
}

function applyRing(x, y) {
  let angle = Math.atan2(y - CY, x - CX) * 180 / Math.PI + 90;
  if (angle < 0) angle += 360;
  H = Math.round(angle) % 360;
}

function applySquare(x, y) {
  S = Math.round(clamp((x - SQ_X) / SQ_W, 0, 1) * 100);
  L = Math.round(clamp(1 - (y - SQ_Y) / SQ_W, 0, 1) * 100);
}

function applyPointer(x, y) {
  if (dragging === 'ring') applyRing(x, y);
  else applySquare(x, y);
}

function onDown(event) {
  event.preventDefault();
  const [x, y] = getXY(event);
  dragging = hitZone(x, y);
  applyPointer(x, y);
  syncAll();
}

/* Durante el arrastre se actualiza como maximo una vez por frame. */
function scheduleSync() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    if (pendingXY) {
      applyPointer(...pendingXY);
      pendingXY = null;
    }
    syncAll();
  });
}

function onMove(event) {
  if (!dragging) return;
  event.preventDefault();
  pendingXY = getXY(event);
  scheduleSync();
}

function onUp() {
  dragging = null;
}

function initPicker() {
  canvas = document.getElementById('picker-canvas');
  ctx = canvas.getContext('2d');
  const width = Math.min(canvas.parentElement.clientWidth - 20, 280);
  canvas.style.width = width + 'px';
  canvas.style.height = width + 'px';

  canvas.addEventListener('mousedown', onDown, { passive: false });
  canvas.addEventListener('mousemove', onMove, { passive: false });
  canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('mouseleave', onUp);
  canvas.addEventListener('touchstart', onDown, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onUp);

  buildRingCache();
  drawPicker();
}
