(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("open", !expanded);
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
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
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-hero-index") || 0);
        show(nextIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initCardSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-card-search-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("[data-card-search]");
      if (!input) {
        return;
      }
      var scope = form.closest("main") || document;
      var grid = scope.querySelector(".searchable-grid");
      var empty = scope.querySelector("[data-empty-state]");
      if (!grid) {
        grid = document.querySelector(".searchable-grid");
      }
      function apply() {
        var keyword = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search]"));
        var visible = 0;
        cards.forEach(function (card) {
          var content = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var matched = keyword === "" || content.indexOf(keyword) !== -1;
          card.classList.toggle("is-filtered-out", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      input.addEventListener("input", apply);
    });
  }

  function attachHls(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
    video.src = source;
  }

  function initMoviePlayer(source) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    if (!video || !overlay || !source) {
      return;
    }
    var prepared = false;
    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      attachHls(video, source);
    }
    function play() {
      prepare();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
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
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
  }

  function initSite() {
    initNavigation();
    initHero();
    initCardSearch();
  }

  window.Site = {
    initMoviePlayer: initMoviePlayer,
    initSite: initSite
  };

  ready(initSite);
})();
