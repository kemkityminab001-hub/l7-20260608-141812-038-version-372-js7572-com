(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-main-nav]');

    if (menuButton && menu) {
      menuButton.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var clearButton = scope.querySelector('[data-clear-filter]');
      var list = document.querySelector('[data-card-list]');
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-card]')) : [];
      var empty = document.querySelector('[data-empty-message]');
      var selectedCategory = 'all';
      var selectedYear = 'all';

      function setActive(buttons, activeButton) {
        buttons.forEach(function (button) {
          button.classList.toggle('active', button === activeButton);
        });
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var year = card.getAttribute('data-year') || '';
          var category = card.getAttribute('data-category') || '';
          var keys = (card.getAttribute('data-keywords') || '').toLowerCase();
          var textMatch = !keyword || title.indexOf(keyword) !== -1 || keys.indexOf(keyword) !== -1 || year.indexOf(keyword) !== -1;
          var categoryMatch = selectedCategory === 'all' || category === selectedCategory;
          var yearMatch = selectedYear === 'all' || year === selectedYear;
          var isVisible = textMatch && categoryMatch && yearMatch;

          card.style.display = isVisible ? '' : 'none';

          if (isVisible) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('visible', visible === 0 && cards.length > 0);
        }
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
          input.value = query;
        }

        input.addEventListener('input', apply);
      }

      Array.prototype.slice.call(scope.querySelectorAll('[data-category-filter]')).forEach(function (button) {
        button.addEventListener('click', function () {
          selectedCategory = button.getAttribute('data-category-filter') || 'all';
          setActive(Array.prototype.slice.call(scope.querySelectorAll('[data-category-filter]')), button);
          apply();
        });
      });

      Array.prototype.slice.call(scope.querySelectorAll('[data-year-filter]')).forEach(function (button) {
        button.addEventListener('click', function () {
          selectedYear = button.getAttribute('data-year-filter') || 'all';
          setActive(Array.prototype.slice.call(scope.querySelectorAll('[data-year-filter]')), button);
          apply();
        });
      });

      if (clearButton && input) {
        clearButton.addEventListener('click', function () {
          input.value = '';
          selectedCategory = 'all';
          selectedYear = 'all';
          Array.prototype.slice.call(scope.querySelectorAll('[data-category-filter], [data-year-filter]')).forEach(function (button) {
            var value = button.getAttribute('data-category-filter') || button.getAttribute('data-year-filter');
            button.classList.toggle('active', value === 'all');
          });
          apply();
        });
      }

      apply();
    });
  });
})();
