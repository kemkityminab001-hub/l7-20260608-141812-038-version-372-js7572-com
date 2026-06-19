(function () {
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');

    if (!input || !results || !status || !Array.isArray(window.SEARCH_INDEX)) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function createCard(item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card">' +
                '<a class="card-link" href="' + item.url + '">' +
                    '<div class="poster-wrap">' +
                        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async">' +
                        '<span class="poster-badge">' + escapeHtml(item.type) + '</span>' +
                    '</div>' +
                    '<div class="card-body">' +
                        '<div class="card-meta">' +
                            '<span>' + escapeHtml(item.year) + '</span>' +
                            '<span>' + escapeHtml(item.region) + '</span>' +
                        '</div>' +
                        '<h3>' + escapeHtml(item.title) + '</h3>' +
                        '<p>' + escapeHtml(item.oneLine) + '</p>' +
                        '<div class="tag-list">' + tags + '</div>' +
                    '</div>' +
                '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function runSearch() {
        var keyword = input.value.trim().toLowerCase();
        var matches = window.SEARCH_INDEX.filter(function (item) {
            var text = [
                item.title,
                item.year,
                item.region,
                item.type,
                item.category,
                item.genre,
                item.oneLine,
                item.tags.join(' ')
            ].join(' ').toLowerCase();

            return !keyword || text.indexOf(keyword) !== -1;
        }).slice(0, 120);

        status.textContent = keyword ? '“' + input.value.trim() + '”相关结果' : '热门影视推荐';
        results.innerHTML = matches.map(createCard).join('');
    }

    input.addEventListener('input', runSearch);
    runSearch();
}());
