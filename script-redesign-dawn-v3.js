const enterBtn = document.getElementById('enterBtn');
const scrollHintBtn = document.getElementById('scrollHintBtn');
const introNote = document.getElementById('introNote');
const letterSection = document.getElementById('letterSection');
const finalSection = document.getElementById('finalSection');
const statusDot = document.getElementById('statusDot');
const endingBtn = document.getElementById('endingBtn');
const endingLine = document.getElementById('endingLine');
const readingBar = document.getElementById('readingBar');
const hiddenImportant = document.getElementById('hiddenImportant');
const bgAudio = document.getElementById('bgAudio');
const passwordGate = document.getElementById('passwordGate');
const passwordForm = document.getElementById('passwordForm');
const passwordInput = document.getElementById('passwordInput');
const passwordError = document.getElementById('passwordError');
const PASSWORD_HASH = 'c1212659e47d8fb4ea321357210499fe46675d413ef8bc5bd07a050075e4d8ee';

const statusLines = ['Trust me.'];
const finalEndingLine = 'ベーー何もない、騙されちゃった！';

const revealItems = document.querySelectorAll('.reveal');
const poemBlocks = document.querySelectorAll('.poem-block');
const fragmentBlocks = document.querySelectorAll('.poem-block.fragment-piece');
const fragmentActionButtons = document.querySelectorAll('.fragment-actions .fragment-toggle');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: '0px 0px -24px 0px'
  }
);

revealItems.forEach((item) => observer.observe(item));

enterBtn?.addEventListener('click', () => {
  letterSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

scrollHintBtn?.addEventListener('click', () => {
  introNote?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

statusDot?.addEventListener('click', () => {
  const line = statusLines[Math.floor(Math.random() * statusLines.length)];
  endingLine.textContent = line;
  statusDot.classList.remove('is-pulsing');
  void statusDot.offsetWidth;
  statusDot.classList.add('is-pulsing');
  endingLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

endingBtn?.addEventListener('click', () => {
  endingLine.classList.remove('trick-pop');
  endingLine.textContent = '';

  window.setTimeout(() => {
    endingLine.textContent = finalEndingLine;
    endingLine.classList.add('trick-pop');
  }, 260);
});

document.body.dataset.ambient = 'on';
document.body.style.setProperty('--cinema-focus', '0.28');

const syncFragmentProgress = () => {
  const openedCount = document.querySelectorAll('.fragment-piece:not(.is-collapsed)').length;
  if (openedCount >= 3) {
    hiddenImportant?.classList.add('visible');
    finalSection?.classList.add('visible');
  }
};

fragmentActionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.target;
    const block = targetId ? document.getElementById(targetId) : null;
    if (!block) return;
    block.classList.toggle('is-collapsed');
    block.scrollIntoView({ behavior: 'smooth', block: 'center' });
    syncFragmentProgress();
  });
});

fragmentBlocks.forEach((block) => {
  block.addEventListener('click', () => {
    block.classList.toggle('is-collapsed');
    syncFragmentProgress();
  });
});

const updateReadingProgress = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (readingBar) {
    readingBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }
};

const updateActiveBlock = () => {
  const viewportMid = window.innerHeight * 0.46;
  let activeIndex = -1;

  poemBlocks.forEach((block, index) => {
    const rect = block.getBoundingClientRect();
    const isActive = rect.top <= viewportMid && rect.bottom >= viewportMid;
    block.classList.toggle('is-active', isActive);

    if (isActive) {
      activeIndex = index;
    }
  });

  const progressRatio = poemBlocks.length > 1 && activeIndex >= 0
    ? activeIndex / (poemBlocks.length - 1)
    : 0;

  document.body.style.setProperty('--cinema-focus', `${0.28 + progressRatio * 0.12}`);
};

const attachTilt = () => {
  poemBlocks.forEach((block) => {
    block.addEventListener('mousemove', (event) => {
      if (window.innerWidth <= 760) return;
      const rect = block.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 4;
      const rotateX = ((y / rect.height) - 0.5) * -4;
      block.style.transform = `translateY(-4px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    block.addEventListener('mouseleave', () => {
      block.style.transform = '';
    });
  });
};

attachTilt();

window.addEventListener('scroll', () => {
  updateReadingProgress();
  updateActiveBlock();
}, { passive: true });

const tryPlayAudio = () => {
  if (!bgAudio) return;
  const playPromise = bgAudio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {});
  }
};

window.addEventListener('load', () => {
  updateReadingProgress();
  updateActiveBlock();
  tryPlayAudio();
});

['click', 'touchstart', 'keydown'].forEach((eventName) => {
  window.addEventListener(eventName, tryPlayAudio, { once: true, passive: true });
});

const unlockPage = () => {
  passwordGate?.classList.add('hidden');
  document.body.style.overflow = '';
  sessionStorage.setItem('himawari_gate_ok', '1');
  tryPlayAudio();
};

const sha256 = async (text) => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

if (sessionStorage.getItem('himawari_gate_ok') === '1') {
  unlockPage();
} else {
  document.body.style.overflow = 'hidden';
  passwordInput?.focus();
}

passwordForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const value = passwordInput?.value || '';
  const hash = await sha256(value);

  if (hash === PASSWORD_HASH) {
    passwordError?.classList.remove('show');
    unlockPage();
  } else {
    passwordError?.classList.add('show');
    if (passwordInput) passwordInput.value = '';
    passwordInput?.focus();
  }
});
