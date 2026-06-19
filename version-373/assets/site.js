(function() {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = $('[data-menu-toggle]');
  var navPanel = $('[data-nav-panel]');
  if (menuButton && navPanel) {
    menuButton.addEventListener('click', function() {
      navPanel.classList.toggle('open');
    });
  }

  var slides = $all('.hero-slide');
  var dots = $all('.hero-dot');
  if (slides.length) {
    var current = 0;
    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showSlide(i);
      });
    });
    showSlide(0);
    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5600);
    }
  }

  $all('[data-search-form]').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        return;
      }
      event.preventDefault();
      var action = form.getAttribute('action') || 'search.html';
      window.location.href = action + '?q=' + encodeURIComponent(value);
    });
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(root) {
    var keyword = normalize(($('[data-filter-input]', root) || {}).value);
    var year = normalize(($('[data-filter-year]', root) || {}).value);
    var region = normalize(($('[data-filter-region]', root) || {}).value);
    var cards = $all('.movie-card', root.parentNode || document);
    var visible = 0;
    cards.forEach(function(card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var ok = true;
      if (keyword && text.indexOf(keyword) === -1) {
        ok = false;
      }
      if (year && cardYear !== year) {
        ok = false;
      }
      if (region && cardRegion !== region) {
        ok = false;
      }
      card.classList.toggle('hidden-card', !ok);
      if (ok) {
        visible += 1;
      }
    });
    var empty = $('.empty-state', root.parentNode || document);
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  $all('[data-filter-root]').forEach(function(root) {
    var controls = $all('input, select', root);
    controls.forEach(function(control) {
      control.addEventListener('input', function() {
        applyFilters(root);
      });
      control.addEventListener('change', function() {
        applyFilters(root);
      });
    });
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var input = $('[data-filter-input]', root);
    if (q && input) {
      input.value = q;
    }
    applyFilters(root);
  });
})();
