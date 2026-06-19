(function () {
    const normalize = function (value) {
        return (value || "").toString().trim().toLowerCase();
    };

    const menuButton = document.querySelector(".menu-toggle");
    const mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            const isOpen = mobilePanel.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    const redirectForms = document.querySelectorAll("form[data-redirect]");

    redirectForms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const input = form.querySelector('input[type="search"]');
            const query = input ? input.value.trim() : "";
            const target = form.getAttribute("data-redirect") || "./library.html";
            const glue = target.indexOf("?") === -1 ? "?" : "&";
            window.location.href = query ? target + glue + "search=" + encodeURIComponent(query) : target;
        });
    });

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    let slideIndex = 0;
    let slideTimer = null;

    const showSlide = function (index) {
        if (!slides.length) {
            return;
        }

        slideIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, current) {
            slide.classList.toggle("active", current === slideIndex);
        });

        dots.forEach(function (dot, current) {
            dot.classList.toggle("active", current === slideIndex);
        });
    };

    const restartSlides = function () {
        if (slideTimer) {
            window.clearInterval(slideTimer);
        }

        if (slides.length > 1) {
            slideTimer = window.setInterval(function () {
                showSlide(slideIndex + 1);
            }, 5600);
        }
    };

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-slide")) || 0);
            restartSlides();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(slideIndex - 1);
            restartSlides();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(slideIndex + 1);
            restartSlides();
        });
    }

    showSlide(0);
    restartSlides();

    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";
    const filterForms = document.querySelectorAll(".filter-form");

    const applyFilter = function (scope) {
        const queryInput = scope.querySelector(".filter-search");
        const yearSelect = scope.querySelector(".filter-year");
        const typeSelect = scope.querySelector(".filter-type");
        const grid = document.querySelector(".searchable-grid");
        const noResults = scope.closest(".filter-panel") ? scope.closest(".filter-panel").querySelector(".no-results") : null;

        if (!grid) {
            return;
        }

        const query = normalize(queryInput ? queryInput.value : "");
        const year = yearSelect ? yearSelect.value : "";
        const type = normalize(typeSelect ? typeSelect.value : "");
        let visible = 0;

        grid.querySelectorAll(".movie-card").forEach(function (card) {
            const haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-category"),
                card.getAttribute("data-tags")
            ].join(" "));

            const cardYear = card.getAttribute("data-year") || "";
            const cardType = normalize(card.getAttribute("data-type"));
            const matchesQuery = !query || haystack.indexOf(query) !== -1;
            let matchesYear = true;

            if (year) {
                if (year === "2022-older") {
                    matchesYear = Number(cardYear) <= 2022;
                } else {
                    matchesYear = cardYear === year;
                }
            }

            const matchesType = !type || cardType.indexOf(type) !== -1;
            const shouldShow = matchesQuery && matchesYear && matchesType;

            card.classList.toggle("is-filtered-out", !shouldShow);

            if (shouldShow) {
                visible += 1;
            }
        });

        if (noResults) {
            noResults.hidden = visible !== 0;
        }
    };

    filterForms.forEach(function (form) {
        const searchInput = form.querySelector(".filter-search");
        const yearSelect = form.querySelector(".filter-year");
        const typeSelect = form.querySelector(".filter-type");

        if (initialSearch && searchInput) {
            searchInput.value = initialSearch;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter(form);
        });

        [searchInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", function () {
                    applyFilter(form);
                });
                control.addEventListener("change", function () {
                    applyFilter(form);
                });
            }
        });

        applyFilter(form);
    });
})();
