(function () {
  function initSite() {
    initMenu();
    initHeroCarousel();
    initFilters();
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
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
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var blocks = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter-block]"),
    );
    blocks.forEach(function (block) {
      var input = block.querySelector(".search-input");
      var selects = Array.prototype.slice.call(
        block.querySelectorAll(".filter-select"),
      );
      var cards = Array.prototype.slice.call(
        block.querySelectorAll(".movie-card"),
      );
      function normalize(value) {
        return String(value || "")
          .toLowerCase()
          .trim();
      }
      function matchSelect(card, select) {
        var value = normalize(select.value);
        if (!value) {
          return true;
        }
        var key = select.getAttribute("data-filter");
        var cardValue = normalize(card.getAttribute("data-" + key));
        return cardValue.indexOf(value) !== -1;
      }
      function apply() {
        var q = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var matchedText = !q || text.indexOf(q) !== -1;
          var matchedSelects = selects.every(function (select) {
            return matchSelect(card, select);
          });
          card.classList.toggle(
            "is-filter-hidden",
            !(matchedText && matchedSelects),
          );
        });
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    });
  }

  function setupMoviePlayer(source) {
    var video = document.querySelector(".js-player-video");
    var overlay = document.querySelector(".js-player-overlay");
    if (!video || !source) {
      return;
    }
    var loaded = false;
    var hls = null;
    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
    }
    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });
    video.addEventListener("error", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.Site = {
    initSite: initSite,
    setupMoviePlayer: setupMoviePlayer,
  };

  document.addEventListener("DOMContentLoaded", initSite);
})();
