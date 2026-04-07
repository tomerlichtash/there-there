const EMOJI_HAND = '\u{1F449}';
const EMOJI_ARROW = '\u{27A1}\u{FE0F}';

let currentEmoji = EMOJI_HAND;

const grid = document.getElementById('grid');
const spotlight = document.getElementById('spotlight');
const toggleBtn = document.getElementById('toggle');
const MIN_CELL_SIZE = 32;
const MAX_CELLS = 500;

let cols, rows, cells = [], cellSize;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

function build() {
  const area = window.innerWidth * window.innerHeight;
  cellSize = Math.max(MIN_CELL_SIZE, Math.ceil(Math.sqrt(area / MAX_CELLS)));

  cols = Math.ceil(window.innerWidth / cellSize);
  rows = Math.ceil(window.innerHeight / cellSize);

  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  grid.replaceChildren();
  cells = [];

  const fontSize = cellSize * 0.75;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const el = document.createElement('div');
      el.className = 'cell';
      el.textContent = currentEmoji;
      el.style.fontSize = fontSize + 'px';
      grid.appendChild(el);

      cells.push({
        el,
        x: (c + 0.5) * (window.innerWidth / cols),
        y: (r + 0.5) * (window.innerHeight / rows),
      });
    }
  }

  updateAll();
}

function updateAll() {
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const dx = mouseX - cell.x;
    const dy = mouseY - cell.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    cell.el.style.transform = `rotate(${angle}deg)`;
  }
}

function getSpotlightRadius() {
  return Math.min(window.innerWidth, window.innerHeight) * 0.8;
}

function updateSpotlight() {
  const r = getSpotlightRadius();
  spotlight.style.background =
    `radial-gradient(${r}px circle at ${mouseX}px ${mouseY}px, transparent 0%, rgba(17,17,17,0.85) 100%)`;
}

let rafPending = false;

function scheduleUpdate() {
  updateSpotlight();
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      updateAll();
    });
  }
}

// Desktop
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  scheduleUpdate();
});

// Mobile
document.addEventListener('touchstart', (e) => {
  if (e.target.closest('#top-bar, #footer')) return;
  e.preventDefault();
  if (e.touches.length === 0) return;
  mouseX = e.touches[0].clientX;
  mouseY = e.touches[0].clientY;
  scheduleUpdate();
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  if (e.target.closest('#top-bar, #footer')) return;
  e.preventDefault();
  if (e.touches.length === 0) return;
  mouseX = e.touches[0].clientX;
  mouseY = e.touches[0].clientY;
  scheduleUpdate();
}, { passive: false });

// Toggle
function toggleEmoji() {
  currentEmoji = currentEmoji === EMOJI_HAND ? EMOJI_ARROW : EMOJI_HAND;
  for (const cell of cells) cell.el.textContent = currentEmoji;
}

toggleBtn.addEventListener('click', toggleEmoji);

window.addEventListener('resize', build);
updateSpotlight();
build();
