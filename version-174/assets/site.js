(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobile = document.querySelector("[data-mobile-nav]");

    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        mobile.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var regionSelect = document.querySelector("[data-region-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var keyword = normalize(filterInput ? filterInput.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-keywords"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (region && cardRegion !== region) {
          ok = false;
        }
        if (year && cardYear !== year) {
          ok = false;
        }

        card.style.display = ok ? "" : "none";
        if (ok) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    if (filterInput || regionSelect || yearSelect) {
      [filterInput, regionSelect, yearSelect].forEach(function (field) {
        if (field) {
          field.addEventListener("input", applyFilters);
          field.addEventListener("change", applyFilters);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && filterInput) {
        filterInput.value = query;
      }
      applyFilters();
    }
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-movie-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var button = document.querySelector("[data-play-button]");
  var started = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function startPlayback() {
    if (started) {
      video.play().catch(function () {});
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    video.play().catch(function () {});
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }
  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }
  video.addEventListener("click", function () {
    if (!started) {
      startPlayback();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
