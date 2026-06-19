(function() {
  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-tab]'));
    if (!slides.length || !tabs.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      tabs.forEach(function(tab, tabIndex) {
        tab.classList.toggle('is-active', tabIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5600);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    tabs.forEach(function(tab, index) {
      tab.addEventListener('click', function() {
        show(index);
        start();
      });
    });
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });
    start();
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    if (!cards.length) {
      return;
    }
    var search = document.querySelector('[data-search-input]');
    var year = document.querySelector('[data-filter-year]');
    var type = document.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-no-result]');
    function getText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' '));
    }
    function apply() {
      var query = normalize(search ? search.value : '');
      var selectedYear = year ? year.value : '';
      var selectedType = normalize(type ? type.value : '');
      var visible = 0;
      cards.forEach(function(card) {
        var text = getText(card);
        var yearMatch = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var typeMatch = !selectedType || normalize(card.getAttribute('data-type')).indexOf(selectedType) !== -1;
        var queryMatch = !query || text.indexOf(query) !== -1;
        var matched = yearMatch && typeMatch && queryMatch;
        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    [search, year, type].forEach(function(control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
