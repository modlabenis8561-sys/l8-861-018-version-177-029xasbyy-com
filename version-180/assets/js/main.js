(function () {
    const root = document.documentElement;

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function escapeHtml(value) {
        return (value || '').toString().replace(/[&<>\"]/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '\"': '&quot;'
            }[character];
        });
    }

    function initMobileMenu() {
        const toggle = document.querySelector('.js-menu-toggle');
        const menu = document.querySelector('.js-mobile-nav');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        const slider = document.querySelector('.js-hero-slider');
        if (!slider) {
            return;
        }
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initSiteSearch() {
        const forms = Array.from(document.querySelectorAll('.js-site-search-form'));
        const movies = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
        forms.forEach(function (form) {
            const input = form.querySelector('.js-site-search');
            const results = form.querySelector('.js-search-results');
            if (!input || !results) {
                return;
            }

            function render(query) {
                const value = normalize(query);
                if (!value) {
                    results.classList.remove('is-open');
                    results.innerHTML = '';
                    return;
                }
                const matched = movies.filter(function (movie) {
                    const haystack = normalize([
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.genre,
                        movie.tags
                    ].join(' '));
                    return haystack.indexOf(value) !== -1;
                }).slice(0, 8);

                if (!matched.length) {
                    results.innerHTML = '<span class="search-empty">未找到相关影片</span>';
                    results.classList.add('is-open');
                    return;
                }

                results.innerHTML = matched.map(function (movie) {
                    return [
                        '<a href="' + escapeHtml(movie.url) + '">',
                        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">',
                        '<span><b>' + escapeHtml(movie.title) + '</b><em>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.genre) + '</em></span>',
                        '</a>'
                    ].join('');
                }).join('');
                results.classList.add('is-open');
            }

            input.addEventListener('input', function () {
                render(input.value);
            });

            input.addEventListener('focus', function () {
                render(input.value);
            });

            form.addEventListener('submit', function (event) {
                if (!input.value.trim()) {
                    event.preventDefault();
                }
            });

            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    results.classList.remove('is-open');
                }
            });
        });
    }

    function initLocalFilters() {
        const panels = Array.from(document.querySelectorAll('.js-filter-page'));
        panels.forEach(function (panel) {
            const scope = panel.parentElement || document;
            const cards = Array.from(scope.querySelectorAll('.js-filter-card'));
            const input = panel.querySelector('.js-local-search');
            const chips = Array.from(panel.querySelectorAll('.js-filter-chip'));
            const empty = panel.querySelector('.js-filter-empty');
            const state = {
                type: '',
                region: '',
                year: '',
                query: ''
            };

            function apply() {
                let visibleCount = 0;
                cards.forEach(function (card) {
                    const text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.category
                    ].join(' '));
                    const matchesQuery = !state.query || text.indexOf(state.query) !== -1;
                    const matchesType = !state.type || card.dataset.type === state.type;
                    const matchesRegion = !state.region || card.dataset.region === state.region;
                    const matchesYear = !state.year || card.dataset.year === state.year;
                    const show = matchesQuery && matchesType && matchesRegion && matchesYear;
                    card.classList.toggle('is-hidden-by-filter', !show);
                    if (show) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visibleCount === 0);
                }
            }

            if (input) {
                const query = new URLSearchParams(window.location.search).get('q');
                if (query) {
                    input.value = query;
                    state.query = normalize(query);
                }
                input.addEventListener('input', function () {
                    state.query = normalize(input.value);
                    apply();
                });
            }

            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    const type = chip.getAttribute('data-filter-type');
                    const value = chip.getAttribute('data-filter-value');
                    if (type === 'all') {
                        state.type = '';
                        state.region = '';
                        state.year = '';
                        chips.forEach(function (other) {
                            other.classList.remove('active');
                        });
                        chip.classList.add('active');
                        apply();
                        return;
                    }
                    const isActive = chip.classList.contains('active');
                    chips.filter(function (other) {
                        return other.getAttribute('data-filter-type') === type;
                    }).forEach(function (other) {
                        other.classList.remove('active');
                    });
                    if (isActive) {
                        state[type] = '';
                    } else {
                        state[type] = value;
                        chip.classList.add('active');
                    }
                    const allChip = chips.find(function (other) {
                        return other.getAttribute('data-filter-type') === 'all';
                    });
                    if (allChip) {
                        allChip.classList.toggle('active', !state.type && !state.region && !state.year);
                    }
                    apply();
                });
            });

            apply();
        });
    }

    function initVideoPlayers() {
        const players = Array.from(document.querySelectorAll('.js-video-player'));
        players.forEach(function (player) {
            const video = player.querySelector('video');
            const trigger = player.querySelector('.js-play-trigger');
            const source = player.getAttribute('data-src');
            let loaded = false;
            let hls = null;

            if (!video || !source) {
                return;
            }

            function loadSource() {
                if (loaded) {
                    return Promise.resolve();
                }
                loaded = true;
                player.classList.add('is-loaded');
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    return Promise.resolve();
                }
                video.src = source;
                return Promise.resolve();
            }

            function play() {
                loadSource().then(function () {
                    const attempt = video.play();
                    if (attempt && typeof attempt.catch === 'function') {
                        attempt.catch(function () {
                            player.classList.remove('is-playing');
                        });
                    }
                    player.classList.add('is-playing');
                });
            }

            if (trigger) {
                trigger.addEventListener('click', play);
            }

            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        root.classList.add('is-ready');
        initMobileMenu();
        initHeroSlider();
        initSiteSearch();
        initLocalFilters();
        initVideoPlayers();
    });
}());
