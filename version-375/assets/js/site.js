(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var year = root.querySelector("[data-filter-year]");
      var sort = root.querySelector("[data-filter-sort]");
      var list = root.querySelector("[data-filter-list]");
      var empty = root.querySelector("[data-empty-state]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

      function apply() {
        var query = normalize(input ? input.value : "");
        var yearValue = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var showCard = matchesQuery && matchesYear;
          card.style.display = showCard ? "" : "none";
          if (showCard) {
            visible += 1;
          }
        });
        if (sort) {
          var mode = sort.value;
          cards.sort(function (a, b) {
            if (mode === "year") {
              return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
            }
            if (mode === "heat") {
              return Number(b.getAttribute("data-heat")) - Number(a.getAttribute("data-heat"));
            }
            return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-Hans-CN");
          }).forEach(function (card) {
            list.appendChild(card);
          });
        }
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, sort].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
      }
      apply();
    });
  }

  function setVideoSource(video, src) {
    if (video.getAttribute("data-loaded") === "true") {
      return;
    }
    video.setAttribute("data-loaded", "true");
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      video.src = src;
    }
  }

  window.initStaticPlayer = function (src) {
    var box = document.querySelector("[data-player]");
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var overlay = box.querySelector(".video-overlay");
    if (!video || !overlay) {
      return;
    }

    function play() {
      setVideoSource(video, src);
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
  };

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
  });
})();
