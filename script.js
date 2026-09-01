// Reading progress bar
const progressBar = document.querySelector('.progress-bar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  });
}

// Back to top button
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });
}

// Scroll-triggered section reveal
const animatedSections = document.querySelectorAll('.scroll-animate');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  animatedSections.forEach(el => observer.observe(el));
} else {
  animatedSections.forEach(el => el.classList.add('visible'));
}

// Subtle 3D tilt on the profile photo (home page only)
const tiltImg = document.querySelector('.profile-tilt');
const tiltWrap = document.querySelector('.profile-tilt-wrapper');
if (tiltImg && tiltWrap && window.matchMedia('(hover: hover)').matches) {
  tiltWrap.addEventListener('mousemove', (e) => {
    const r = tiltWrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tiltImg.style.transform =
      `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.03)`;
  });
  tiltWrap.addEventListener('mouseleave', () => {
    tiltImg.style.transform = '';
  });
}

// Project videos: ship a poster, fetch the video only when someone asks for it
const projectVideos = document.querySelectorAll('.project-media video');
if (projectVideos.length) {
  const canHover = window.matchMedia('(hover: hover)').matches;
  projectVideos.forEach(video => {
    const start = () => {
      if (video.preload === 'none') video.preload = 'auto';
      const played = video.play();
      if (played) played.catch(() => {});
    };
    const stop = () => video.pause();
    if (canHover) {
      video.addEventListener('mouseenter', start);
      video.addEventListener('mouseleave', stop);
    }
    video.addEventListener('click', () => (video.paused ? start() : stop()));
  });
}

// Language toggle: English <-> 中文.  Chinese lives in data-zh on each element.
const langToggle = document.querySelector('.lang-toggle');
if (langToggle) {
  const nodes = document.querySelectorAll('[data-zh]');
  const english = new Map();
  nodes.forEach(el => english.set(el, el.innerHTML));

  const LABEL = { en: 'English', zh: '中文' };
  const HREF  = { en: '?lang=zh', zh: '?lang=en' };
  const HINT  = { en: '切换到中文', zh: 'Switch to English' };
  const TITLE = {
    en: document.title,
    zh: langToggle.getAttribute('data-title-zh') || document.title
  };

  // links to other pages of this site keep whichever language you are reading in
  const pageLinks = Array.from(document.querySelectorAll('a[href]'))
    .filter(a => (a.getAttribute('href') || '').endsWith('/'));

  const apply = (lang) => {
    nodes.forEach(el => {
      el.innerHTML = lang === 'zh' ? el.getAttribute('data-zh') : english.get(el);
    });
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = TITLE[lang];
    // the pill always offers the other language
    const other = lang === 'zh' ? 'en' : 'zh';
    langToggle.innerHTML = '<i class="fas fa-language"></i> ' + LABEL[other];
    langToggle.setAttribute('href', HREF[lang]);
    langToggle.setAttribute('aria-label', HINT[lang]);
    pageLinks.forEach(a => {
      const base = (a.getAttribute('href') || '').split('?')[0];
      a.setAttribute('href', lang === 'zh' ? base + '?lang=zh' : base);
    });
  };

  let current = new URLSearchParams(window.location.search).get('lang') === 'zh' ? 'zh' : 'en';
  if (current === 'zh') apply('zh');

  langToggle.addEventListener('click', (e) => {
    e.preventDefault();
    current = current === 'zh' ? 'en' : 'zh';
    apply(current);
    try {
      const url = new URL(window.location.href);
      if (current === 'zh') url.searchParams.set('lang', 'zh');
      else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    } catch (err) { /* file:// or old browser — the toggle still works */ }
  });
}
