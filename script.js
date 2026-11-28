const envelopeScreen = document.getElementById('envelope-screen');
const envelopeButton = document.getElementById('envelope-button');
const envelopeLetter = document.getElementById('envelope-letter');
const enterPasscodeButton = document.getElementById('enter-passcode');
const lockScreen = document.getElementById('lock-screen');
const surpriseScreen = document.getElementById('surprise-screen');
const celebrationContent = document.getElementById('celebration-content');
const birthdayStage = document.querySelector('.birthday-stage');
const lightsSwitch = document.getElementById('lights-switch');
const pinDisplay = document.getElementById('pin-display');
const pinKeypad = document.getElementById('pin-keypad');
const pinFeedback = document.getElementById('pin-feedback');
const celebrationCanvas = document.getElementById('fireworks');
const UNLOCK_CODE = '1330';
let enteredCode = '';
let isUnlocked = false;
let startFireworks = () => {};
let stopFireworks = () => {};
let triggerFinale = () => {};

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToElement(element) {
  element.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start'
  });
}

// Fireworks run in short, capped bursts instead of animating continuously.
(() => {
  const context = celebrationCanvas.getContext('2d', { alpha: true });
  if (!context) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rockets = [];
  let sparks = [];
  let animationFrame = 0;
  let nextLaunchAt = 0;
  let burstEndsAt = 0;
  let running = false;
  const MAX_SPARKS = 1200;
  const COLORS = ['#ff4d7d', '#ff9d59', '#ffe6a1', '#bb8aff', '#f7f2ff'];

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    celebrationCanvas.width = Math.round(width * dpr);
    celebrationCanvas.height = Math.round(height * dpr);
    celebrationCanvas.style.width = `${width}px`;
    celebrationCanvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function launchRocket(pattern) {
    const color = pattern === 'gold' || pattern === 'heart'
      ? '#ffd78a'
      : COLORS[Math.floor(Math.random() * COLORS.length)];
    rockets.push({
      x: width * (.12 + Math.random() * .76),
      y: height + 12,
      vx: (Math.random() - .5) * 1.6,
      vy: -(8 + Math.random() * 3),
      targetY: height * (.15 + Math.random() * .42),
      color,
      pattern,
      trail: []
    });
  }

  function explode(rocket) {
    const count = rocket.pattern === 'heart' ? 64 : 42 + Math.floor(Math.random() * 20);
    const offset = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI * 2 * i / count + offset;
      const speed = 1.6 + Math.random() * (rocket.pattern === 'gold' ? 3.2 : 4.2);
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed;
      if (rocket.pattern === 'heart') {
        const t = angle;
        const heartX = 16 * Math.pow(Math.sin(t), 3) / 17;
        const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17;
        vx = heartX * speed;
        vy = heartY * speed;
      }
      sparks.push({
        x: rocket.x,
        y: rocket.y,
        vx,
        vy,
        life: 48 + Math.random() * 46,
        maxLife: 94,
        size: .8 + Math.random() * 1.8,
        color: rocket.pattern === 'gold' || rocket.pattern === 'heart'
          ? (i % 4 === 0 ? '#fff7dd' : '#ffd78a')
          : COLORS[(i + Math.floor(Math.random() * COLORS.length)) % COLORS.length],
        gravity: .035 + Math.random() * .04,
        trail: []
      });
    }
    if (sparks.length > MAX_SPARKS) sparks.splice(0, sparks.length - MAX_SPARKS);
  }

  function drawRocket(rocket) {
    rocket.trail.push({ x: rocket.x, y: rocket.y });
    if (rocket.trail.length > 8) rocket.trail.shift();
    rocket.trail.forEach((point, index) => {
      context.globalAlpha = index / rocket.trail.length * .55;
      context.fillStyle = rocket.color;
      context.beginPath();
      context.arc(point.x, point.y, 1 + index * .12, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    context.fillStyle = '#fff';
    context.shadowBlur = 12;
    context.shadowColor = rocket.color;
    context.beginPath();
    context.arc(rocket.x, rocket.y, 2.2, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  }

  function render(time) {
    if (document.hidden) {
      stopFireworks();
      return;
    }
    const delta = Math.min(2, (time - (render.lastTime || time)) / 16.67);
    render.lastTime = time;
    context.clearRect(0, 0, width, height);

    if (time < burstEndsAt && time >= nextLaunchAt) {
      const pattern = Math.random() < .35 ? 'heart' : Math.random() < .58 ? 'gold' : 'random';
      launchRocket(pattern);
      nextLaunchAt = time + 145;
    }

    for (let i = rockets.length - 1; i >= 0; i--) {
      const rocket = rockets[i];
      rocket.x += rocket.vx * delta;
      rocket.y += rocket.vy * delta;
      rocket.vy += .035 * delta;
      drawRocket(rocket);
      if (rocket.y <= rocket.targetY || rocket.vy >= -.5) {
        explode(rocket);
        rockets.splice(i, 1);
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i];
      spark.x += spark.vx * delta;
      spark.y += spark.vy * delta;
      spark.vy += spark.gravity * delta;
      spark.vx *= Math.pow(.985, delta);
      spark.life -= delta;
      if (spark.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      spark.trail.push({ x: spark.x, y: spark.y });
      if (spark.trail.length > 8) spark.trail.shift();
      context.globalAlpha = Math.max(0, spark.life / spark.maxLife);
      context.strokeStyle = spark.color;
      context.lineWidth = Math.max(.7, spark.size * .7);
      context.shadowBlur = 7;
      context.shadowColor = spark.color;
      context.beginPath();
      context.moveTo(spark.trail[0].x, spark.trail[0].y);
      spark.trail.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.stroke();
    }
    context.globalAlpha = 1;
    context.shadowBlur = 0;

    if (time >= burstEndsAt && rockets.length === 0 && sparks.length === 0) {
      running = false;
      context.clearRect(0, 0, width, height);
      return;
    }
    animationFrame = window.requestAnimationFrame(render);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });
  stopFireworks = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    running = false;
    rockets = [];
    sparks = [];
    render.lastTime = 0;
    context.clearRect(0, 0, width, height);
  };
  startFireworks = ({ finale = false } = {}) => {
    if (prefersReducedMotion()) return;
    const now = performance.now();
    burstEndsAt = Math.max(burstEndsAt, now + (finale ? 2600 : 1500));
    nextLaunchAt = Math.min(nextLaunchAt || now, now);
    if (!running) {
      running = true;
      animationFrame = window.requestAnimationFrame(render);
    }
  };
  triggerFinale = () => {
    if (prefersReducedMotion()) return;
    for (let i = 0; i < 8; i++) launchRocket(i % 2 === 0 ? 'heart' : 'gold');
    startFireworks({ finale: true });
  };
})();

function updatePinDisplay() {
  const slots = pinDisplay.querySelectorAll('.pin-slot');
  slots.forEach((slot, index) => {
    slot.classList.toggle('filled', index < enteredCode.length);
    slot.classList.toggle('pin-current', index === enteredCode.length - 1);
  });
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
  lockScreen.classList.add('unlocking');
  document.body.classList.add('birthday-journey');
  window.setTimeout(() => {
    lockScreen.classList.add('hidden');
    surpriseScreen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'auto' });
    switchOnLights();
  }, 720);
}

function makeConfetti(amount = 54) {
  if (prefersReducedMotion()) return;
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');
  const colors = ['#ffd78a', '#f48bae', '#c18aff', '#fff4dc', '#ef688b'];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${Math.random() * 100}%`);
    piece.style.setProperty('--delay', `${Math.random() * 1.6}s`);
    piece.style.setProperty('--duration', `${3 + Math.random() * 2.5}s`);
    piece.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
    piece.style.setProperty('--rotation', `${Math.floor(Math.random() * 360)}deg`);
    layer.appendChild(piece);
  }
  surpriseScreen.appendChild(layer);
  window.setTimeout(() => layer.remove(), 7500);
}

function switchOnLights() {
  if (lightsSwitch.disabled) return;
  lightsSwitch.disabled = true;
  lightsSwitch.setAttribute('aria-pressed', 'true');
  surpriseScreen.classList.add('lights-on');
  birthdayStage.classList.add('revealing');
  startFireworks();
  makeConfetti();
  window.setTimeout(() => {
    celebrationContent.classList.remove('hidden');
  }, prefersReducedMotion() ? 0 : 2100);
}

lightsSwitch.addEventListener('click', switchOnLights);

document.getElementById('envelope-button').addEventListener('click', () => {
  if (envelopeButton.classList.contains('opening')) return;
  envelopeButton.classList.add('opening');
  envelopeButton.setAttribute('aria-expanded', 'true');
  document.querySelector('.tap-note').classList.add('hidden');
  window.setTimeout(() => {
    envelopeLetter.hidden = false;
    envelopeLetter.classList.add('letter-arrived');
    enterPasscodeButton.focus();
  }, prefersReducedMotion() ? 0 : 1000);
});

enterPasscodeButton.addEventListener('click', () => {
  envelopeScreen.classList.add('envelope-leaving');
  window.setTimeout(() => {
    envelopeScreen.classList.add('hidden');
    lockScreen.classList.remove('hidden');
    pinKeypad.querySelector('[data-key="0"]').focus();
  }, prefersReducedMotion() ? 0 : 650);
});

const birthdayCalendar = document.getElementById('birthday-calendar');
const birthdayCountdown = document.getElementById('birthday-countdown');
const countdownMessage = document.getElementById('countdown-message');
const BIRTHDAY_YEAR = 2026;
const BIRTHDAY_MONTH = 10;
const BIRTHDAY_DAY = 30;

function renderBirthdayCalendar() {
  const firstWeekday = new Date(BIRTHDAY_YEAR, BIRTHDAY_MONTH, 1).getDay();
  const daysInMonth = new Date(BIRTHDAY_YEAR, BIRTHDAY_MONTH + 1, 0).getDate();
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < firstWeekday; i++) {
    const emptyDay = document.createElement('li');
    emptyDay.className = 'calendar-empty';
    emptyDay.setAttribute('aria-hidden', 'true');
    fragment.appendChild(emptyDay);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const calendarDay = document.createElement('li');
    const date = document.createElement('time');
    date.dateTime = `${BIRTHDAY_YEAR}-${String(BIRTHDAY_MONTH + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    date.textContent = String(day);
    if (day === BIRTHDAY_DAY) {
      calendarDay.className = 'birthday-day';
      calendarDay.setAttribute('aria-label', 'Birthday: Monday, November 30, 2026');
    }
    calendarDay.appendChild(date);
    fragment.appendChild(calendarDay);
  }
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  for (let i = firstWeekday + daysInMonth; i < cellCount; i++) {
    const emptyDay = document.createElement('li');
    emptyDay.className = 'calendar-empty';
    emptyDay.setAttribute('aria-hidden', 'true');
    fragment.appendChild(emptyDay);
  }
  birthdayCalendar.replaceChildren(fragment);
}

function updateBirthdayCountdown() {
  const now = new Date();
  const birthday = new Date(BIRTHDAY_YEAR, BIRTHDAY_MONTH, BIRTHDAY_DAY);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today.getTime() === birthday.getTime()) {
    birthdayCountdown.hidden = true;
    countdownMessage.textContent = "It's your birthday! Let the celebrations begin.";
    return;
  }
  if (today > birthday) {
    birthdayCountdown.hidden = true;
    countdownMessage.textContent = 'Your birthday has passed, but these memories are here to stay.';
    return;
  }
  birthdayCountdown.hidden = false;
  const totalSeconds = Math.floor(Math.max(0, birthday - now) / 1000);
  document.getElementById('countdown-days').textContent = String(Math.floor(totalSeconds / 86400)).padStart(2, '0');
  document.getElementById('countdown-hours').textContent = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0');
  document.getElementById('countdown-minutes').textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  document.getElementById('countdown-seconds').textContent = String(totalSeconds % 60).padStart(2, '0');
  countdownMessage.textContent = 'A little time until your birthday';
}

renderBirthdayCalendar();
updateBirthdayCountdown();
window.setInterval(updateBirthdayCountdown, 1000);

function handlePinKey(key) {
  if (isUnlocked) return;
  pinFeedback.classList.remove('error');
  if (/^\d$/.test(key) && enteredCode.length < 4) {
    enteredCode += key;
    updatePinDisplay();
    if (enteredCode.length === 4) submitPasscode();
    else pinFeedback.textContent = `${enteredCode.length} of 4 numbers entered.`;
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
  if (!lockScreen.classList.contains('hidden')) {
    if (/^\d$/.test(event.key)) handlePinKey(event.key);
    else if (event.key === 'Backspace' || event.key === 'Delete') {
      enteredCode = enteredCode.slice(0, -1);
      updatePinDisplay();
      pinFeedback.textContent = `${enteredCode.length} of 4 numbers entered.`;
    } else if (event.key === 'Enter' || event.key === '#') submitPasscode();
    else if (event.key === 'Escape') handlePinKey('clear');
  }
  if (photoViewer.open) {
    if (event.key === 'ArrowLeft') showPhoto(viewerIndex - 1);
    else if (event.key === 'ArrowRight') showPhoto(viewerIndex + 1);
  }
});

document.getElementById('celebrate-button').addEventListener('click', () => {
  startFireworks({ finale: true });
  makeConfetti(72);
  scrollToElement(document.getElementById('birthday-date'));
});

const birthdayCake = document.getElementById('birthday-cake');
const wishButton = document.getElementById('wish-button');
const cakeWishMessage = document.getElementById('cake-wish-message');
wishButton.addEventListener('click', () => {
  birthdayCake.classList.add('wish-made');
  cakeWishMessage.hidden = false;
  wishButton.textContent = 'WISH MADE ♥';
  wishButton.disabled = true;
  triggerFinale();
  makeConfetti(42);
});

document.getElementById('edit-letter-button').addEventListener('click', (event) => {
  const message = document.getElementById('main-message');
  const status = document.getElementById('letter-edit-status');
  const button = event.currentTarget;
  const isEditing = message.isContentEditable;
  message.contentEditable = String(!isEditing);
  button.setAttribute('aria-pressed', String(!isEditing));
  button.textContent = isEditing ? '✎ Edit this message' : '✓ Finish editing';
  status.textContent = isEditing ? 'Your message is ready to share.' : 'You can now click and edit the birthday message.';
  if (!isEditing) message.focus();
});

const photoViewer = document.getElementById('photo-viewer');
const viewerImage = document.getElementById('viewer-image');
const viewerCaption = document.getElementById('viewer-caption');
const viewerCount = photoViewer.querySelector('.viewer-count');
let viewerIndex = 0;
let lastPhotoTrigger = null;
let swipeStartX = null;

function getGalleryPhotos() {
  return Array.from(document.querySelectorAll('.memory-photo img, .uploaded-photo img'));
}

function showPhoto(index) {
  const photos = getGalleryPhotos();
  if (!photos.length) return;
  viewerIndex = (index + photos.length) % photos.length;
  const image = photos[viewerIndex];
  viewerImage.src = image.currentSrc || image.src;
  viewerImage.alt = image.alt;
  viewerCaption.textContent = image.closest('figure')?.querySelector('figcaption')?.textContent || image.alt;
  viewerCount.textContent = `${viewerIndex + 1} of ${photos.length}`;
}

document.querySelectorAll('.memory-photo img').forEach((image) => {
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `Open full-size photo: ${image.alt}`);
});

document.querySelector('.memory-wall-section').addEventListener('click', (event) => {
  const image = event.target.closest('.memory-photo img');
  if (!image) return;
  lastPhotoTrigger = image;
  showPhoto(getGalleryPhotos().indexOf(image));
  photoViewer.showModal();
});

document.querySelector('.memory-wall-section').addEventListener('keydown', (event) => {
  const image = event.target.closest('.memory-photo img');
  if (!image || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  image.click();
});

document.querySelector('.viewer-close').addEventListener('click', () => photoViewer.close());
document.querySelector('.viewer-previous').addEventListener('click', () => showPhoto(viewerIndex - 1));
document.querySelector('.viewer-next').addEventListener('click', () => showPhoto(viewerIndex + 1));
photoViewer.addEventListener('click', (event) => {
  if (event.target === photoViewer) photoViewer.close();
});
photoViewer.addEventListener('close', () => {
  if (lastPhotoTrigger?.isConnected) lastPhotoTrigger.focus();
});
photoViewer.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') swipeStartX = event.clientX;
});
photoViewer.addEventListener('pointerup', (event) => {
  if (swipeStartX === null) return;
  const swipeDistance = event.clientX - swipeStartX;
  swipeStartX = null;
  if (Math.abs(swipeDistance) > 48) showPhoto(viewerIndex + (swipeDistance < 0 ? 1 : -1));
});

const photoUpload = document.getElementById('photo-upload');
const uploadedGallery = document.getElementById('uploaded-gallery');
const uploadNote = document.querySelector('.upload-note');
const uploadedPhotoUrls = [];
photoUpload.addEventListener('change', (event) => {
  const files = Array.from(event.target.files || []);
  const images = files.filter((file) => file.type.startsWith('image/'));
  if (!images.length) {
    uploadNote.textContent = 'Choose an image file to add it to your album.';
    event.target.value = '';
    return;
  }
  images.forEach((file) => {
    const source = URL.createObjectURL(file);
    uploadedPhotoUrls.push(source);
    const figure = document.createElement('figure');
    figure.className = 'memory-photo uploaded-photo';
    const image = document.createElement('img');
    image.src = source;
    image.alt = `Uploaded birthday photo: ${file.name}`;
    image.loading = 'lazy';
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Open full-size photo: ${image.alt}`);
    const caption = document.createElement('figcaption');
    const label = document.createElement('span');
    label.textContent = 'ADDED WITH LOVE';
    caption.append(label, document.createTextNode(file.name));
    figure.append(image, caption);
    uploadedGallery.appendChild(figure);
  });
  uploadNote.textContent = `${images.length} photo${images.length === 1 ? '' : 's'} added for this browser session.`;
  event.target.value = '';
});

uploadedGallery.addEventListener('click', (event) => {
  const image = event.target.closest('.uploaded-photo img');
  if (!image) return;
  lastPhotoTrigger = image;
  showPhoto(getGalleryPhotos().indexOf(image));
  photoViewer.showModal();
});
uploadedGallery.addEventListener('keydown', (event) => {
  const image = event.target.closest('.uploaded-photo img');
  if (!image || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  image.click();
});

const birthdayAudio = document.getElementById('birthday-audio');
const musicUpload = document.getElementById('music-upload');
const musicToggle = document.getElementById('music-toggle');
const musicTitle = document.getElementById('music-title');
const chooseMusicButton = document.getElementById('choose-music-button');
const musicStatus = document.getElementById('music-status');
let chosenMusicUrl = '';

chooseMusicButton.addEventListener('click', () => musicUpload.click());
musicUpload.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (chosenMusicUrl) URL.revokeObjectURL(chosenMusicUrl);
  chosenMusicUrl = URL.createObjectURL(file);
  birthdayAudio.src = chosenMusicUrl;
  birthdayAudio.load();
  musicTitle.textContent = file.name;
  musicStatus.textContent = 'Song ready. Press play when you are ready.';
  musicToggle.disabled = false;
  musicToggle.focus();
  event.target.value = '';
});

musicToggle.addEventListener('click', async () => {
  if (birthdayAudio.paused) {
    try {
      await birthdayAudio.play();
      musicStatus.textContent = 'Now playing.';
    } catch (error) {
      musicStatus.textContent = 'This song could not be played. Choose another audio file.';
    }
  } else {
    birthdayAudio.pause();
    musicStatus.textContent = 'Music paused.';
  }
});
birthdayAudio.addEventListener('play', () => {
  musicToggle.textContent = 'Ⅱ';
  musicToggle.setAttribute('aria-label', 'Pause music');
  document.querySelector('.music-player').classList.add('playing');
});
birthdayAudio.addEventListener('pause', () => {
  musicToggle.textContent = '▶';
  musicToggle.setAttribute('aria-label', 'Play music');
  document.querySelector('.music-player').classList.remove('playing');
});
birthdayAudio.addEventListener('error', () => {
  musicStatus.textContent = 'Audio could not be loaded. Choose a supported MP3, OGG, WAV, or M4A file.';
});
document.getElementById('music-volume').addEventListener('input', (event) => {
  birthdayAudio.volume = Number(event.target.value);
});
birthdayAudio.volume = .65;

let finalSurpriseShown = false;
let finalObserver = null;
if ('IntersectionObserver' in window) {
  finalObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting) || finalSurpriseShown) return;
    finalSurpriseShown = true;
    document.getElementById('final-surprise').classList.add('is-visible');
    triggerFinale();
    makeConfetti(64);
    finalObserver.disconnect();
  }, { threshold: .35 });
  finalObserver.observe(document.getElementById('final-surprise'));
}

document.getElementById('replay-button').addEventListener('click', () => {
  if (photoViewer.open) photoViewer.close();
  stopFireworks();
  birthdayAudio.pause();
  birthdayAudio.removeAttribute('src');
  birthdayAudio.load();
  if (chosenMusicUrl) URL.revokeObjectURL(chosenMusicUrl);
  chosenMusicUrl = '';
  musicToggle.disabled = true;
  musicTitle.textContent = 'Bring your own song';
  musicStatus.textContent = 'Choose an MP3 you own or have permission to use.';
  document.querySelector('.music-player').classList.remove('playing');
  uploadedPhotoUrls.forEach((source) => URL.revokeObjectURL(source));
  uploadedPhotoUrls.length = 0;
  uploadedGallery.replaceChildren();
  uploadNote.textContent = 'Selected photos are shown for this browser session; your original album stays untouched.';
  surpriseScreen.querySelectorAll('.confetti-layer').forEach((layer) => layer.remove());
  birthdayCake.classList.remove('wish-made');
  cakeWishMessage.hidden = true;
  wishButton.disabled = false;
  wishButton.innerHTML = 'MAKE A WISH <span aria-hidden="true">✦</span>';
  document.querySelector('.heart-letter').open = false;
  document.getElementById('letter-edit-status').textContent = '';
  document.getElementById('edit-letter-button').setAttribute('aria-pressed', 'false');
  document.getElementById('edit-letter-button').textContent = '✎ Edit this message';
  document.getElementById('main-message').contentEditable = 'false';
  finalSurpriseShown = false;
  document.getElementById('final-surprise').classList.remove('is-visible');
  finalObserver?.observe(document.getElementById('final-surprise'));
  surpriseScreen.classList.remove('lights-on');
  birthdayStage.classList.remove('revealing');
  lockScreen.classList.remove('unlocking');
  lightsSwitch.disabled = false;
  lightsSwitch.setAttribute('aria-pressed', 'false');
  surpriseScreen.classList.add('hidden');
  celebrationContent.classList.add('hidden');
  lockScreen.classList.add('hidden');
  envelopeScreen.classList.remove('hidden', 'envelope-leaving');
  envelopeButton.classList.remove('opening');
  envelopeButton.setAttribute('aria-expanded', 'false');
  envelopeLetter.hidden = true;
  envelopeLetter.classList.remove('letter-arrived');
  document.querySelector('.tap-note').classList.remove('hidden');
  enteredCode = '';
  isUnlocked = false;
  updatePinDisplay();
  pinKeypad.querySelectorAll('button').forEach((button) => { button.disabled = false; });
  pinFeedback.classList.remove('error', 'success');
  pinFeedback.textContent = 'Type the birthday code.';
  document.body.classList.remove('birthday-journey');
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  envelopeButton.focus();
});
