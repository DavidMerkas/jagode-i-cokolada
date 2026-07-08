// Scroll reveal — enhances already-visible content; never gates it.
// Elements start visible via a fallback timer, so a slow/blocked observer
// (fast scroll jumps, backgrounded tabs, headless renderers) can never
// leave a section blank.
document.addEventListener('DOMContentLoaded', function () {
  var targets = document.querySelectorAll('.reveal, .stagger');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.01, rootMargin: '200px 0px 400px 0px' });

  targets.forEach(function (el) { io.observe(el); });

  // Safety net: force-reveal anything the observer hasn't caught yet,
  // so a section can never ship (or stay) blank.
  setTimeout(function () {
    targets.forEach(function (el) {
      if (!el.classList.contains('in-view')) {
        el.classList.add('in-view');
        io.unobserve(el);
      }
    });
  }, 2500);
});

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Zatvori izbornik' : 'Izbornik');
  }

  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('open'));
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
});

// Animirani social-proof brojač (zvjezdice + broj recenzija)
document.addEventListener('DOMContentLoaded', function () {
  var stat = document.querySelector('.proof-stat');
  if (!stat) return;
  var counter = stat.querySelector('.count-number');
  var target = counter ? parseInt(counter.getAttribute('data-target'), 10) || 0 : 0;

  function runCount() {
    var duration = 1800;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function trigger() {
    stat.classList.add('in-view');
    if (counter) runCount();
  }

  if (!('IntersectionObserver' in window)) {
    trigger();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        trigger();
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    io.observe(stat);
  }
});

// Marquee trake — dupliciraj sadržaj svake trake za bešavnu petlju
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.marquee-track').forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });
});

// Galerija lightbox
document.addEventListener('DOMContentLoaded', function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  var lbImg = lightbox.querySelector('img');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var prevBtn = lightbox.querySelector('.lightbox-prev');
  var nextBtn = lightbox.querySelector('.lightbox-next');

  var current = [];   // { src, alt } jedinstvene slike trenutnog reda
  var index = 0;

  function show(i) {
    if (!current.length) return;
    index = (i + current.length) % current.length;
    lbImg.src = current[index].src;
    lbImg.alt = current[index].alt || '';
  }
  function open(track, src) {
    // Skupi jedinstvene slike iz reda (traka je duplicirana za petlju)
    var seen = {};
    current = [];
    track.querySelectorAll('.m-item img').forEach(function (img) {
      if (seen[img.src]) return;
      seen[img.src] = true;
      current.push({ src: img.src, alt: img.alt });
    });
    var start = current.findIndex(function (o) { return o.src === src; });
    show(start < 0 ? 0 : start);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.m-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var img = item.querySelector('img');
      var track = item.closest('.marquee-track');
      if (img && track) open(track, img.src);
    });
  });

  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); show(index - 1); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); show(index + 1); });
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
});
