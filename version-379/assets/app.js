(function () {
  var button = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-mobile-nav]');
  if (button && menu) {
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-target]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startHero() {
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var target = Number(dot.getAttribute('data-hero-target') || 0);
      showSlide(target);
      startHero();
    });
  });

  showSlide(0);
  if (slides.length > 1) startHero();

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function bindSearch(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var genre = scope.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    if (!input && !year && !genre) return;

    function apply() {
      var q = normalizeText(input ? input.value : '');
      var y = year ? year.value : '';
      var g = genre ? normalizeText(genre.value) : '';
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' '));
        var ok = true;
        if (q && text.indexOf(q) === -1) ok = false;
        if (y && card.getAttribute('data-year') !== y) ok = false;
        if (g && normalizeText(card.getAttribute('data-genre')).indexOf(g) === -1) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) shown += 1;
      });
      if (empty) empty.style.display = shown ? 'none' : 'block';
    }

    [input, year, genre].forEach(function (el) {
      if (el) el.addEventListener('input', apply);
      if (el) el.addEventListener('change', apply);
    });
    apply();
  }

  bindSearch(document);
})();
