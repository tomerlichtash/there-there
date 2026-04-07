const EMOJI_HAND = '\u{1F449}';
const EMOJI_ARROW = '\u{27A1}\u{FE0F}';

let currentEmoji = EMOJI_HAND;

const grid = document.getElementById('grid');
const spotlight = document.getElementById('spotlight');
const MIN_CELL_SIZE = 32;
const MAX_CELLS = 500;

let cols, rows, cells = [], cellSize;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let rafId = null;

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

  updateRotations();
}

const NUM_CHUNKS = 4;
let currentChunk = 0;
let isAnimating = false;

function updateRotations() {
  const total = cells.length;
  const chunkSize = Math.ceil(total / NUM_CHUNKS);
  const start = currentChunk * chunkSize;
  const end = Math.min(start + chunkSize, total);

  for (let i = start; i < end; i++) {
    const cell = cells[i];
    const dx = mouseX - cell.x;
    const dy = mouseY - cell.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    cell.el.style.transform = `rotate(${angle}deg)`;
  }

  currentChunk = (currentChunk + 1) % NUM_CHUNKS;

  if (isAnimating) {
    rafId = requestAnimationFrame(updateRotations);
  } else {
    rafId = null;
  }
}

function updateSpotlight() {
  spotlight.style.background =
    `radial-gradient(circle 700px at ${mouseX}px ${mouseY}px, transparent 0%, rgba(17,17,17,0.85) 100%)`;
}

function startAnimating() {
  isAnimating = true;
  if (!rafId) {
    rafId = requestAnimationFrame(updateRotations);
  }
}

let idleTimer = null;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { isAnimating = false; }, 200);
}

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  updateSpotlight();
  startAnimating();
  resetIdle();
});

document.addEventListener('touchmove', (e) => {
  e.preventDefault();
  mouseX = e.touches[0].clientX;
  mouseY = e.touches[0].clientY;
  updateSpotlight();
  startAnimating();
  resetIdle();
}, { passive: false });

document.addEventListener('click', () => {
  currentEmoji = currentEmoji === EMOJI_HAND ? EMOJI_ARROW : EMOJI_HAND;
  for (const cell of cells) cell.el.textContent = currentEmoji;
});

window.addEventListener('resize', build);
updateSpotlight();
build();
