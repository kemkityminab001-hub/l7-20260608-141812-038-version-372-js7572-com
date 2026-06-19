(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        thumbs.forEach(function (thumb, thumbIndex) {
            thumb.classList.toggle('is-active', thumbIndex === current);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
            var index = Number(thumb.getAttribute('data-hero-thumb') || '0');
            showSlide(index);

            if (timer) {
                window.clearInterval(timer);
                startSlider();
            }
        });
    });

    startSlider();

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card'));

        function filterCards() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var visibleByKeyword = !keyword || text.indexOf(keyword) !== -1;
                var visibleByYear = !year || text.indexOf(year) !== -1;
                card.style.display = visibleByKeyword && visibleByYear ? '' : 'none';
            });
        }

        if (keywordInput) {
            keywordInput.addEventListener('input', filterCards);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }
    }
}());
