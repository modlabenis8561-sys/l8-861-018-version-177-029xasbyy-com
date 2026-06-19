(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", slider);
        var dots = selectAll("[data-hero-dot]", document);
        if (!slides.length) {
            return;
        }
        var current = 0;
        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === current);
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                activate(position);
            });
        });
        activate(0);
        window.setInterval(function () {
            activate(current + 1);
        }, 6200);
    }

    function setupSearchRedirects() {
        selectAll("[data-search-redirect]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var value = input ? input.value.trim() : "";
                var target = form.getAttribute("data-target") || "search.html";
                if (value) {
                    window.location.href = target + "?q=" + encodeURIComponent(value);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function setupFilters() {
        selectAll("[data-filter-area]").forEach(function (area) {
            var input = area.querySelector("[data-filter-keyword]");
            var genre = area.querySelector("[data-filter-genre]");
            var year = area.querySelector("[data-filter-year]");
            var cards = selectAll(".movie-card", area);
            var empty = area.querySelector("[data-empty-result]");

            function apply() {
                var keywordValue = normalize(input && input.value);
                var genreValue = normalize(genre && genre.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchesKeyword = !keywordValue || text.indexOf(keywordValue) !== -1;
                    var matchesGenre = !genreValue || normalize(card.getAttribute("data-genre")).indexOf(genreValue) !== -1;
                    var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var matches = matchesKeyword && matchesGenre && matchesYear;
                    card.classList.toggle("hidden-card", !matches);
                    if (matches) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, genre, year].forEach(function (control) {
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

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupSearchRedirects();
        setupFilters();
    });
})();
