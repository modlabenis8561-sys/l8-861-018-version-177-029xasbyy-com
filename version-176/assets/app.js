(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('.mobile-menu');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      menu.hidden = isOpen;
    });
  }

  function setupPosterImages() {
    var images = document.querySelectorAll('.poster-image, .hero-media img, .detail-bg img');

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var input = document.querySelector('.site-search-input');
    var selects = Array.prototype.slice.call(document.querySelectorAll('.site-filter-select'));
    var counter = document.querySelector('[data-filter-count]');

    if (!cards.length || (!input && !selects.length)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function matchesCard(card) {
      var query = input ? normalize(input.value) : '';
      var text = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.category,
        card.dataset.tags
      ].join(' '));

      if (query && text.indexOf(query) === -1) {
        return false;
      }

      return selects.every(function (select) {
        var filter = select.dataset.filter;
        var value = normalize(select.value);

        if (!value) {
          return true;
        }

        return normalize(card.dataset[filter]).indexOf(value) !== -1;
      });
    }

    function applyFilters() {
      var visibleCount = 0;

      cards.forEach(function (card) {
        var visible = matchesCard(card);
        card.classList.toggle('is-hidden', !visible);

        if (visible) {
          visibleCount += 1;
        }
      });

      if (counter) {
        counter.textContent = '显示 ' + visibleCount + ' 部作品';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);

        if (window.Hls) {
          resolve();
        }

        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayers() {
    var players = document.querySelectorAll('.js-video-player');

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-overlay');
      var source = player.dataset.src;
      var initialized = false;

      if (!video || !source || !button) {
        return;
      }

      function playNative() {
        video.src = source;
        video.play().catch(function () {});
      }

      function initialize() {
        if (initialized) {
          video.play().catch(function () {});
          button.classList.add('is-hidden');
          return;
        }

        initialized = true;
        button.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          playNative();
          return;
        }

        loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js')
          .then(function () {
            if (window.Hls && window.Hls.isSupported()) {
              var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
              });

              hls.loadSource(source);
              hls.attachMedia(video);
              hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
              });
              hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                  hls.destroy();
                  playNative();
                }
              });
              return;
            }

            playNative();
          })
          .catch(function () {
            playNative();
          });
      }

      button.addEventListener('click', initialize);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      player.addEventListener('click', function (event) {
        if (event.target === player) {
          initialize();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupPosterImages();
    setupFilters();
    setupPlayers();
  });
})();
