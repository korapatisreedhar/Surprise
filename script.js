const lockScreen = document.getElementById('lock-screen');
const surpriseScreen = document.getElementById('surprise-screen');
const celebrationContent = document.getElementById('celebration-content');
const lightsSwitch = document.getElementById('lights-switch');
const pinDisplay = document.getElementById('pin-display');
const pinKeypad = document.getElementById('pin-keypad');
const pinFeedback = document.getElementById('pin-feedback');
const UNLOCK_CODE = '0116';
let enteredCode = '';
let isUnlocked = false;
let startFireworks = () => {};

// Cinematic fireworks: each salvo sends exactly 120 rockets into the sky.
// Launches are staggered so the sky fills continuously instead of exploding all at once.
(() => {
  const canvas = document.getElementById('fireworks');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  let width = 0, height = 0, dpr = 1;
  let rockets = [], sparks = [], launchCount = 0, salvoTimer = 0, lastTime = 0, started = false;
  const colors = ['#ff1744', '#ff6d00', '#ffea00', '#76ff03', '#00e5ff', '#2979ff', '#d500f9', '#ff40c4'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SHOTS_PER_SALVO = 120;
  const LAUNCH_GAP = 62;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function launchRocket() {
    const x = width * (0.07 + Math.random() * 0.86);
    const targetY = height * (0.12 + Math.random() * 0.53);
    const color = colors[Math.floor(Math.random() * colors.length)];
    rockets.push({ x, y: height + 12, vx: (Math.random() - .5) * 1.6, vy: -(7 + Math.random() * 4), targetY, color, trail: [] });
  }
  function explode(rocket) {
    const count = 48 + Math.floor(Math.random() * 25);
    const style = Math.random();
    const colorOffset = Math.floor(Math.random() * colors.length);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) + Math.random() * .08;
      const speed = style < .25 ? 1.5 + Math.random() * 2.3 : 1.2 + Math.random() * 4.1;
      sparks.push({ x: rocket.x, y: rocket.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 55 + Math.random() * 48, maxLife: 103, size: 0.8 + Math.random() * 2.1, color: colors[(i + colorOffset) % colors.length], gravity: .035 + Math.random() * .035, twinkle: Math.random(), trail: [] });
    }
    // A few bright crackling stars add the sharp firecracker/sparkler look.
    for (let i = 0; i < 9; i++) sparks.push({ x: rocket.x, y: rocket.y, vx: (Math.random() - .5) * 7, vy: (Math.random() - .5) * 7, life: 18 + Math.random() * 18, maxLife: 36, size: 1 + Math.random() * 1.5, color: '#fff7d6', gravity: .05, twinkle: 1, trail: [] });
  }
  function drawRocket(r) {
    r.trail.push({ x: r.x, y: r.y });
    if (r.trail.length > 8) r.trail.shift();
    for (let i = 0; i < r.trail.length; i++) {
      const p = r.trail[i]; ctx.globalAlpha = (i / r.trail.length) * .55;
      ctx.fillStyle = r.color; ctx.beginPath(); ctx.arc(p.x, p.y, 1 + i * .12, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 15; ctx.shadowColor = r.color; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  }
  function frame(time) {
    const delta = Math.min(2, (time - (lastTime || time)) / 16.67); lastTime = time;
    ctx.clearRect(0, 0, width, height);
    // 120 shots per salvo, then a short pause before the next continuous volley.
    salvoTimer += (time ? Math.min(34, delta * 16.67) : 16);
    if (!reducedMotion && launchCount < SHOTS_PER_SALVO && salvoTimer >= LAUNCH_GAP) {
      launchRocket(); launchCount++; salvoTimer = 0;
    } else if (!reducedMotion && launchCount >= SHOTS_PER_SALVO && rockets.length < 3) {
      launchCount = 0; salvoTimer = -850;
    }
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i]; r.x += r.vx * delta; r.y += r.vy * delta; r.vy += .035 * delta;
      drawRocket(r);
      if (r.y <= r.targetY || r.vy >= -.5) { explode(r); rockets.splice(i, 1); }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.x += s.vx * delta; s.y += s.vy * delta; s.vy += s.gravity * delta;
      s.vx *= Math.pow(.985, delta); s.life -= delta;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      s.trail.push({ x: s.x, y: s.y });
      if (s.trail.length > 9) s.trail.shift();
      const alpha = Math.max(0, s.life / s.maxLife);
      ctx.globalAlpha = alpha * (s.twinkle && Math.random() > .88 ? .35 : 1);
      ctx.strokeStyle = s.color; ctx.lineWidth = Math.max(.7, Math.min(1.7, s.size * .7));
      ctx.shadowBlur = 9; ctx.shadowColor = s.color;
      ctx.beginPath();
      ctx.moveTo(s.trail[0].x, s.trail[0].y);
      for (let j = 1; j < s.trail.length; j++) ctx.lineTo(s.trail[j].x, s.trail[j].y);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x, s.y, Math.min(1.5, s.size * .55), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }
  resize(); window.addEventListener('resize', resize, { passive: true });
  startFireworks = () => {
    if (started || reducedMotion) return;
    started = true;
    for (let i = 0; i < 10; i++) {
      setTimeout(() => { launchRocket(); launchCount++; }, i * 95);
    }
    requestAnimationFrame(frame);
  };
})();

function updatePinDisplay() {
  const slots = pinDisplay.querySelectorAll('.pin-slot');
  slots.forEach((slot, index) => slot.classList.toggle('filled', index < enteredCode.length));
  pinDisplay.setAttribute('aria-label', `4-digit passcode, ${enteredCode.length} digits entered`);
}

function submitPasscode() {
  if (isUnlocked) return;
  if (enteredCode.length !== 4) {
    pinFeedback.textContent = 'Enter all four numbers, then press #.';
    pinFeedback.classList.add('error');
    return;
  }
  if (enteredCode !== UNLOCK_CODE) {
    enteredCode = '';
    updatePinDisplay();
    pinFeedback.textContent = 'Not quite — try another code.';
    pinFeedback.classList.add('error');
    pinDisplay.classList.add('shake');
    window.setTimeout(() => {
      pinFeedback.classList.remove('error');
      pinDisplay.classList.remove('shake');
    }, 650);
    return;
  }

  isUnlocked = true;
  pinKeypad.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  pinFeedback.textContent = 'Surprise unlocked! ✨';
  pinFeedback.classList.remove('error');
  pinFeedback.classList.add('success');
  document.body.classList.add('birthday-journey');
  window.setTimeout(() => {
    lockScreen.classList.add('hidden');
    surpriseScreen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switchOnLights();
  }, 850);
}

function switchOnLights() {
  if (lightsSwitch.disabled) return;
  lightsSwitch.disabled = true;
  lightsSwitch.setAttribute('aria-pressed', 'true');
  surpriseScreen.classList.add('lights-on');
  startFireworks();
  window.setTimeout(() => celebrationContent.classList.remove('hidden'), 1800);
}

lightsSwitch.addEventListener('click', switchOnLights);

function handlePinKey(key) {
  if (isUnlocked) return;
  pinFeedback.classList.remove('error');
  if (/^\d$/.test(key) && enteredCode.length < 4) {
    enteredCode += key;
    updatePinDisplay();
    if (enteredCode.length === 4) {
      submitPasscode();
    } else {
      pinFeedback.textContent = `${enteredCode.length} of 4 numbers entered.`;
    }
    return;
  }
  if (key === 'clear') {
    enteredCode = '';
    updatePinDisplay();
    pinFeedback.textContent = 'Type the birthday code.';
  } else if (key === 'submit') {
    submitPasscode();
  }
}

pinKeypad.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-key]');
  if (button) handlePinKey(button.dataset.key);
});

document.addEventListener('keydown', (event) => {
  if (lockScreen.classList.contains('hidden')) return;
  if (/^\d$/.test(event.key)) {
    handlePinKey(event.key);
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    if (!isUnlocked) {
      enteredCode = enteredCode.slice(0, -1);
      updatePinDisplay();
      pinFeedback.textContent = `${enteredCode.length} of 4 numbers entered.`;
    }
  } else if (event.key === 'Enter' || event.key === '#') {
    submitPasscode();
  } else if (event.key === 'Escape') {
    handlePinKey('clear');
  }
});

function drawScratchCover(canvas, context) {
  const { width, height } = canvas;
  const cover = context.createLinearGradient(0, 0, width, height);
  cover.addColorStop(0, '#bd825e');
  cover.addColorStop(.5, '#85513f');
  cover.addColorStop(1, '#c18a61');
  context.globalCompositeOperation = 'source-over';
  context.fillStyle = cover;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = '#f5d6ad55';
  context.lineWidth = 1;
  for (let x = -height; x < width; x += 22) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + height, height);
    context.stroke();
  }
  context.fillStyle = '#fff0d9';
  context.textAlign = 'center';
  context.font = `700 ${Math.max(13, Math.min(20, width / 12))}px sans-serif`;
  context.fillText('SCRATCH TO REVEAL', width / 2, height / 2);
  context.font = `${Math.max(15, Math.min(24, width / 9))}px sans-serif`;
  context.fillText('✦  ♥  ✦', width / 2, height / 2 + 30);
}

function createScratchCard(file, index, gallery) {
  const card = document.createElement('figure');
  card.className = 'scratch-card';
  const image = document.createElement('img');
  image.alt = `Birthday photo memory ${index + 1}`;
  const surface = document.createElement('canvas');
  surface.className = 'scratch-surface';
  surface.tabIndex = 0;
  surface.setAttribute('role', 'button');
  surface.setAttribute('aria-label', `Scratch to reveal photo ${index + 1}`);
  const caption = document.createElement('figcaption');
  caption.textContent = `Memory ${index + 1}`;
  card.append(image, surface, caption);
  gallery.appendChild(card);

  const context = surface.getContext('2d', { willReadFrequently: true });
  if (!context) {
    card.remove();
    throw new Error('Could not create the scratch-card canvas.');
  }
  const paintCover = () => {
    const bounds = image.getBoundingClientRect();
    if (!bounds.width || !bounds.height || card.classList.contains('revealed')) return;
    surface.width = Math.round(bounds.width);
    surface.height = Math.round(bounds.height);
    drawScratchCover(surface, context);
  };
  image.addEventListener('load', paintCover, { once: true });
  image.src = URL.createObjectURL(file);

  let scratching = false;
  let previousPoint = null;
  let scratchMoves = 0;
  function reveal() {
    if (card.classList.contains('revealed')) return;
    card.classList.add('revealed');
    image.alt = `Revealed birthday photo memory ${index + 1}`;
    surface.setAttribute('aria-hidden', 'true');
    surface.tabIndex = -1;
  }
  function eraseAt(event) {
    const bounds = surface.getBoundingClientRect();
    if (!surface.width || !surface.height || !bounds.width || !bounds.height) return;
    const scaleX = surface.width / bounds.width;
    const scaleY = surface.height / bounds.height;
    const point = {
      x: (event.clientX - bounds.left) * scaleX,
      y: (event.clientY - bounds.top) * scaleY
    };
    context.globalCompositeOperation = 'destination-out';
    context.lineWidth = 42 * scaleX;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    if (previousPoint) {
      context.beginPath();
      context.moveTo(previousPoint.x, previousPoint.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    } else {
      context.beginPath();
      context.arc(point.x, point.y, 21 * scaleX, 0, Math.PI * 2);
      context.fill();
    }
    previousPoint = point;
    scratchMoves++;
    if (scratchMoves % 5 === 0 && hasScratchedEnough()) reveal();
  }
  function hasScratchedEnough() {
    if (!surface.width || !surface.height) return false;
    const pixels = context.getImageData(0, 0, surface.width, surface.height).data;
    let transparent = 0;
    let sampled = 0;
    for (let y = 0; y < surface.height; y += 14) {
      for (let x = 0; x < surface.width; x += 14) {
        if (pixels[(y * surface.width + x) * 4 + 3] < 40) transparent++;
        sampled++;
      }
    }
    return sampled > 0 && transparent / sampled >= .38;
  }
  surface.addEventListener('pointerdown', (event) => {
    if (card.classList.contains('revealed')) return;
    scratching = true;
    previousPoint = null;
    surface.setPointerCapture(event.pointerId);
    eraseAt(event);
  });
  surface.addEventListener('pointermove', (event) => {
    if (!scratching || card.classList.contains('revealed')) return;
    eraseAt(event);
  });
  surface.addEventListener('pointerup', () => {
    scratching = false;
    previousPoint = null;
    if (hasScratchedEnough()) reveal();
  });
  surface.addEventListener('pointercancel', () => {
    scratching = false;
    previousPoint = null;
  });
  surface.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      reveal();
    }
  });
}

document.getElementById('photo-upload').addEventListener('change', (event) => {
  const gallery = document.getElementById('gallery');
  const hint = document.getElementById('gallery-hint');
  const selectedFiles = Array.from(event.target.files || []);
  const imageFiles = selectedFiles.filter((file) => file.type.startsWith('image/'));
  if (!imageFiles.length) {
    hint.textContent = 'Choose one or more image files to make scratch cards.';
    event.target.value = '';
    return;
  }
  gallery.querySelectorAll('img').forEach((image) => {
    if (image.src.startsWith('blob:')) URL.revokeObjectURL(image.src);
  });
  gallery.replaceChildren();
  imageFiles.forEach((file, index) => createScratchCard(file, index, gallery));
  hint.textContent = selectedFiles.length === imageFiles.length
    ? 'Rub each card to uncover a memory. Photos stay in this browser session.'
    : 'Some files were skipped. Rub the image cards to uncover your memories.';
  event.target.value = '';
});
