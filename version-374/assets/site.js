(function () {
  function setupNavigation() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-site-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    function showSlide(nextIndex) {
      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === activeIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupLocalFilters() {
    const scope = document.querySelector('[data-filter-scope]');

    if (!scope) {
      return;
    }

    const keywordInput = scope.querySelector('[data-filter-keyword]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const typeSelect = scope.querySelector('[data-filter-type]');
    const resetButton = scope.querySelector('[data-filter-reset]');
    const cards = Array.from(document.querySelectorAll('[data-filter-list] .movie-card'));
    const count = document.querySelector('[data-filter-count]');

    function applyFilter() {
      const keyword = normalize(keywordInput && keywordInput.value);
      const year = normalize(yearSelect && yearSelect.value);
      const type = normalize(typeSelect && typeSelect.value);
      let visibleCount = 0;

      cards.forEach(function (card) {
        const text = normalize(card.textContent + ' ' + card.dataset.title);
        const cardYear = normalize(card.dataset.year);
        const cardType = normalize(card.dataset.type);
        const matched = (!keyword || text.includes(keyword)) &&
          (!year || cardYear === year) &&
          (!type || cardType === type);

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visibleCount += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visibleCount + ' 部影片';
      }
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        applyFilter();
      });
    }
  }

  function createSearchCard(movie) {
    const article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = [
      '<a class="poster-link" href="' + movie.url + '" aria-label="查看' + escapeHtml(movie.title) + '">',
      '  <span class="poster-fallback-text">' + escapeHtml(movie.title) + '</span>',
      '  <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\';">',
      '  <span class="score-badge">' + movie.weight + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '  <div class="movie-card-meta">',
      '    <span>' + escapeHtml(movie.yearText || movie.year) + '</span>',
      '    <span>' + escapeHtml(movie.region) + '</span>',
      '    <span>' + escapeHtml(movie.type) + '</span>',
      '  </div>',
      '  <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '  <p>' + escapeHtml(movie.oneLine) + '</p>',
      '  <div class="tag-row">' + movie.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('') + '</div>',
      '</div>'
    ].join('');

    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    const page = document.querySelector('[data-search-page]');

    if (!page || !window.MOVIE_INDEX) {
      return;
    }

    const keywordInput = page.querySelector('[data-search-keyword]');
    const categorySelect = page.querySelector('[data-search-category]');
    const yearSelect = page.querySelector('[data-search-year]');
    const typeSelect = page.querySelector('[data-search-type]');
    const resetButton = page.querySelector('[data-search-reset]');
    const results = page.querySelector('[data-search-results]');
    const count = page.querySelector('[data-search-count]');
    const query = new URLSearchParams(window.location.search);

    if (keywordInput && query.get('q')) {
      keywordInput.value = query.get('q');
    }

    function applySearch() {
      const keyword = normalize(keywordInput && keywordInput.value);
      const category = normalize(categorySelect && categorySelect.value);
      const year = normalize(yearSelect && yearSelect.value);
      const type = normalize(typeSelect && typeSelect.value);

      const matched = window.MOVIE_INDEX.filter(function (movie) {
        const text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.yearText,
          movie.categoryName,
          movie.genreRaw,
          movie.tagRaw,
          movie.oneLine
        ].join(' '));

        return (!keyword || text.includes(keyword)) &&
          (!category || normalize(movie.categorySlug) === category) &&
          (!year || normalize(movie.year) === year) &&
          (!type || normalize(movie.type).includes(type));
      }).slice(0, 120);

      results.innerHTML = '';
      matched.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });

      if (count) {
        count.textContent = '找到 ' + matched.length + ' 部影片，最多显示前 120 条结果';
      }
    }

    [keywordInput, categorySelect, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        applySearch();
      });
    }

    applySearch();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHeroSlider();
    setupLocalFilters();
    setupSearchPage();
  });
})();
