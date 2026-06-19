(function() {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  var inputs = document.querySelectorAll('[data-filter-input]');

  inputs.forEach(function(input) {
    var scope = input.closest('[data-filter-scope]') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
    var empty = scope.querySelector('[data-empty]');

    input.addEventListener('input', function() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !value || haystack.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    });
  });
})();
