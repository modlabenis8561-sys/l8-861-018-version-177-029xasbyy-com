(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function text(value) {
        return String(value || '').toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
            var prev = carousel.querySelector('[data-hero-prev]');
            var next = carousel.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
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
                prev.addEventListener('click', function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    restart();
                });
            });

            show(0);
            restart();
        });

        document.querySelectorAll('.search-shell').forEach(function (shell) {
            var input = shell.querySelector('[data-global-search]');
            var results = shell.querySelector('[data-search-results]');
            var indexData = window.SiteMovieIndex || [];
            if (!input || !results || !indexData.length) {
                return;
            }

            input.addEventListener('input', function () {
                var query = text(input.value).trim();
                if (query.length < 1) {
                    results.classList.remove('is-open');
                    results.innerHTML = '';
                    return;
                }
                var matches = indexData.filter(function (item) {
                    return text(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.category + ' ' + item.tags).indexOf(query) !== -1;
                }).slice(0, 12);
                if (!matches.length) {
                    results.innerHTML = '<div class="search-empty"><span></span><strong>没有找到匹配影片</strong></div>';
                    results.classList.add('is-open');
                    return;
                }
                results.innerHTML = matches.map(function (item) {
                    return '<a href="./' + item.url + '"><img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '"><span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.category + '</span></span></a>';
                }).join('');
                results.classList.add('is-open');
            });

            document.addEventListener('click', function (event) {
                if (!shell.contains(event.target)) {
                    results.classList.remove('is-open');
                }
            });
        });

        var filterGrid = document.querySelector('[data-filter-grid]');
        if (filterGrid) {
            var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-movie-card]'));
            var search = document.querySelector('[data-page-search]');
            var year = document.querySelector('[data-filter-year]');
            var region = document.querySelector('[data-filter-region]');
            var type = document.querySelector('[data-filter-type]');

            function applyFilters() {
                var query = search ? text(search.value).trim() : '';
                var yearValue = year ? year.value : '';
                var regionValue = region ? region.value : '';
                var typeValue = type ? type.value : '';
                cards.forEach(function (card) {
                    var haystack = text(card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.tags + ' ' + card.dataset.region + ' ' + card.dataset.type + ' ' + card.dataset.year);
                    var visible = true;
                    if (query && haystack.indexOf(query) === -1) {
                        visible = false;
                    }
                    if (yearValue && card.dataset.year !== yearValue) {
                        visible = false;
                    }
                    if (regionValue && card.dataset.region !== regionValue) {
                        visible = false;
                    }
                    if (typeValue && card.dataset.type !== typeValue) {
                        visible = false;
                    }
                    card.classList.toggle('is-hidden', !visible);
                });
            }

            [search, year, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilters);
                    control.addEventListener('change', applyFilters);
                }
            });
        }

        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.player-overlay');
            var playUrl = player.getAttribute('data-play-url');
            var hls = null;
            var prepared = false;

            function attach() {
                if (!video || !playUrl || prepared) {
                    return;
                }
                prepared = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = playUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(playUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = playUrl;
                }
            }

            function start() {
                attach();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                if (video) {
                    var promise = video.play();
                    if (promise && typeof promise.catch === 'function') {
                        promise.catch(function () {});
                    }
                }
            }

            if (overlay) {
                overlay.addEventListener('click', start);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        start();
                    }
                });
            }

            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    });
})();
