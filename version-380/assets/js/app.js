(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    setupHero();
    setupFilters();
    setupSearch();
    setupPlayers();
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (!slides.length || !dots.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = nextIndex % slides.length;
      if (index < 0) {
        index = slides.length - 1;
      }

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    var sortSelect = document.querySelector("[data-sort-select]");
    var typeSelect = document.querySelector("[data-type-select]");

    if (!grid || !sortSelect || !typeSelect) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

    function apply() {
      var typeValue = typeSelect.value;
      var sortValue = sortSelect.value;

      cards.forEach(function (card) {
        var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
        card.style.display = matchType ? "" : "none";
      });

      var sorted = cards.slice().sort(function (a, b) {
        if (sortValue === "views") {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        }
        if (sortValue === "year") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }
        return Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index"));
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    sortSelect.addEventListener("change", apply);
    typeSelect.addEventListener("change", apply);
  }

  function setupSearch() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");

    if (!form || !input || !results || typeof SITE_MOVIES === "undefined") {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch(input.value);
      var nextUrl = window.location.pathname + "?q=" + encodeURIComponent(input.value.trim());
      window.history.replaceState(null, "", nextUrl);
    });

    runSearch(initialQuery);

    function runSearch(query) {
      var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var list = SITE_MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.category,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.description
        ].join(" ").toLowerCase();

        return words.length === 0 || words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      results.innerHTML = list.map(renderSearchCard).join("");

      if (summary) {
        summary.textContent = words.length ? "找到 " + list.length + " 个相关结果" : "输入关键词可检索影片标题、分类、类型和标签";
      }

      if (!list.length && words.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配的影片，换一个关键词试试。</div>';
      }
    }

    function renderSearchCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-cover" href="' + escapeHtml(movie.url) + '">',
        '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="cover-gradient"></span>',
        '    <span class="movie-type">' + escapeHtml(movie.type) + '</span>',
        '    <span class="play-mark">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line"><a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span></div>',
        '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
        '    <p>' + escapeHtml(movie.description) + '</p>',
        '    <div class="tag-row">' + movie.tags.split("|").slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
        '  </div>',
        '</article>'
      ].join("");
    }
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var status = shell.querySelector("[data-player-status]");

      if (!video) {
        return;
      }

      var source = video.getAttribute("data-m3u8");
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text || "";
          status.style.display = text ? "inline-flex" : "none";
        }
      }

      function attachSource() {
        if (!source) {
          setStatus("视频暂时无法加载");
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("");
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setStatus("视频加载失败，请稍后再试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setStatus("");
          });
        } else {
          setStatus("此浏览器暂不支持该视频格式");
        }
      }

      function togglePlay() {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              setStatus("点击视频区域即可开始播放");
            });
          }
        } else {
          video.pause();
        }
      }

      attachSource();

      if (button) {
        button.addEventListener("click", togglePlay);
      }

      video.addEventListener("click", togglePlay);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
