(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 6000);
  }

  function localFilter(query) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    if (cards.length === 0) {
      return;
    }
    var normalized = normalize(query);
    cards.forEach(function (card) {
      var terms = normalize(card.getAttribute('data-search-terms'));
      var matches = !normalized || terms.indexOf(normalized) !== -1;
      card.classList.toggle('is-hidden', !matches);
    });
  }

  function renderSearchResults(container, query) {
    if (!container || !window.SEARCH_INDEX) {
      return;
    }
    var normalized = normalize(query);
    if (!normalized) {
      container.classList.remove('is-open');
      container.innerHTML = '';
      return;
    }
    var results = window.SEARCH_INDEX.filter(function (item) {
      return normalize(item.title + item.description + item.category + item.year + item.region).indexOf(normalized) !== -1;
    }).slice(0, 8);
    if (results.length === 0) {
      container.innerHTML = '<div class="search-result-link"><div></div><span>没有找到相关影片</span></div>';
      container.classList.add('is-open');
      return;
    }
    container.innerHTML = results.map(function (item) {
      return '<a class="search-result-link" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.category + ' · ' + item.year + ' · ' + item.region + '</span></span>' +
        '</a>';
    }).join('');
    container.classList.add('is-open');
  }

  function initSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      var input = form.querySelector('[data-search-input]');
      var results = form.querySelector('[data-search-results]');
      if (!input) {
        return;
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        renderSearchResults(results, input.value);
        localFilter(input.value);
      });
      input.addEventListener('input', function () {
        renderSearchResults(results, input.value);
        localFilter(input.value);
      });
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target) && results) {
          results.classList.remove('is-open');
        }
      });
    });
  }

  function initFilterButtons() {
    var active = {};
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    if (buttons.length === 0) {
      return;
    }
    function applyFilters() {
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
      cards.forEach(function (card) {
        var visible = Object.keys(active).every(function (key) {
          return !active[key] || card.getAttribute('data-' + key) === active[key];
        });
        card.classList.toggle('is-hidden', !visible);
      });
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.getAttribute('data-filter');
        var value = button.getAttribute('data-filter-value');
        if (key === 'all') {
          active = {};
          buttons.forEach(function (item) {
            item.classList.toggle('active', item.getAttribute('data-filter') === 'all');
          });
          applyFilters();
          return;
        }
        active[key] = active[key] === value ? '' : value;
        buttons.forEach(function (item) {
          if (item.getAttribute('data-filter') === 'all') {
            item.classList.toggle('active', Object.keys(active).every(function (activeKey) { return !active[activeKey]; }));
          } else {
            item.classList.toggle('active', active[item.getAttribute('data-filter')] === item.getAttribute('data-filter-value'));
          }
        });
        applyFilters();
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-button]');
      var src = player.getAttribute('data-src');
      var loaded = false;
      var hls = null;
      if (!video || !src) {
        return;
      }
      function playVideo() {
        if (!loaded) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            });
          } else {
            video.src = src;
            video.load();
            video.play().catch(function () {});
          }
          loaded = true;
        } else {
          video.play().catch(function () {});
        }
        player.classList.add('is-playing');
      }
      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }
      player.addEventListener('click', function (event) {
        if (event.target !== video) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initFilterButtons();
    initPlayers();
  });
})();
