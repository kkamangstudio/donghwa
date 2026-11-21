const pages = Array.from(document.querySelectorAll('section'));
const prev = document.querySelector('#prev'), next = document.querySelector('#next');
const crease = document.querySelector('.crease');
const fold = crease.querySelector('g');
const [shadow, paper] = fold.querySelectorAll('path');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;
let part = 0;
let partCount = 1;
let finishTurn;
const spread = document.querySelector('.spread');

function turn(page, forward) {
  const start = performance.now();
  let frame;
  page.hidden = false;
  page.inert = true;
  page.classList.add('turning');
  crease.removeAttribute('hidden');
  fold.setAttribute('transform', forward ? '' : 'translate(100 0) scale(-1 1)');

  finishTurn = () => {
    cancelAnimationFrame(frame);
    page.remove();
    page.inert = false;
    page.classList.remove('turning');
    page.style.removeProperty('clip-path');
    crease.setAttribute('hidden', '');
    finishTurn = null;
  };

  function draw(now) {
    const t = Math.min(1, Math.max(0, (now - start) / 620));
    if (t === 1 || motion.matches) { finishTurn(); return; }
    const progress = t * t * (3 - 2 * t);
    const edge = 100 * (1 - progress);
    const bend = Math.sin(Math.PI * progress);
    const top = edge + 2 * bend, bottom = edge - 2 * bend;
    const width = 8 * bend, shade = 5 * bend;
    const side = forward ? 0 : 100;
    const at = x => forward ? x : 100 - x;
    page.style.clipPath = `polygon(${side}% 0, ${at(top)}% 0, ${at(bottom)}% 100%, ${side}% 100%)`;
    paper.setAttribute('d', `M ${top} 0 L ${bottom} 100 Q ${edge-width*1.6} 80 ${top-width} 0 Z`);
    shadow.setAttribute('d', `M ${top} 0 L ${top+shade} 0 L ${bottom+shade} 100 L ${bottom} 100 Z`);
    frame = requestAnimationFrame(draw);
  }
  draw(start);
}
function layout(requestedPart) {
  const page = pages[current];
  const article = page.querySelector('article');
  const heading = article.querySelector('h2');
  const viewport = article.querySelector('.text-window');
  const flow = viewport.firstElementChild;
  const headingHeight = heading.offsetHeight + parseFloat(getComputedStyle(heading).marginBottom);
  const available = Math.max(1, Math.floor(article.clientHeight - headingHeight));
  flow.style.height = 'auto';
  const height = Math.min(available, Math.ceil(flow.getBoundingClientRect().height));
  flow.style.height = height + 'px';
  const stride = viewport.clientWidth + parseFloat(getComputedStyle(flow).columnGap);
  partCount = Math.max(1, 1 + Math.round((viewport.scrollWidth - viewport.clientWidth) / stride));
  part = Math.max(0, Math.min(requestedPart, partCount - 1));
  viewport.scrollLeft = part * stride;
  const detail = partCount > 1 ? ' · ' + (part + 1) + '/' + partCount + '쪽' : '';
  document.querySelector('#count').textContent = (current + 1) + ' / ' + pages.length + detail;
  prev.disabled = current === 0 && part === 0;
  prev.textContent = part > 0 ? '← 이전 쪽' : '← 이전 장면';
  next.textContent = part < partCount - 1 ? '다음 쪽 →' : current === pages.length - 1 ? '처음부터 읽기 ↺' : '다음 장면 →';
}

function move(direction, restart = false) {
  let scene = current, target = part + direction;
  if (target < 0) { scene--; target = Infinity; }
  if (target >= partCount && direction > 0) { scene++; target = 0; }
  if (scene === pages.length && restart) scene = 0;
  if (scene < 0 || scene >= pages.length) return;
  if (finishTurn) finishTurn();
  const old = pages[current];
  let leaf;
  if (!motion.matches) {
    leaf = old.cloneNode(true);
    leaf.classList.add('turning');
    leaf.inert = true;
    leaf.setAttribute('aria-hidden', 'true');
    spread.insertBefore(leaf, crease);
    leaf.querySelector('.text-window').scrollLeft = old.querySelector('.text-window').scrollLeft;
  }
  old.hidden = true;
  current = scene;
  pages[current].hidden = false;
  layout(target);
  pages[current].querySelector('h2').focus({preventScroll:true});
  if (leaf) turn(leaf, direction > 0 && !restart);
}
prev.addEventListener('click', () => move(-1));
next.addEventListener('click', () => move(1, current === pages.length - 1 && part === partCount - 1));
document.addEventListener('keydown', event => {
  if (event.altKey || event.metaKey || event.ctrlKey) return;
  if (event.key === 'ArrowRight') move(1);
  if (event.key === 'ArrowLeft') move(-1);
});

let startTouch;
spread.addEventListener('touchstart', event => {
  const touch = event.touches[0];
  startTouch = event.touches.length === 1 ? {x:touch.clientX, y:touch.clientY, id:touch.identifier} : null;
}, {passive:true});
spread.addEventListener('touchcancel', () => { startTouch = null; });
spread.addEventListener('touchend', event => {
  const start = startTouch;
  startTouch = null;
  if (!start || event.touches.length) return;
  const touch = Array.from(event.changedTouches).find(item => item.identifier === start.id);
  if (!touch) return;
  const dx = touch.clientX - start.x, dy = touch.clientY - start.y;
  if (Math.abs(dx) >= 40 && Math.abs(dx) > 1.4 * Math.abs(dy)) move(dx < 0 ? 1 : -1);
}, {passive:true});
layout(0);
new ResizeObserver(() => layout(part)).observe(spread);
document.fonts.ready.then(() => layout(part));
