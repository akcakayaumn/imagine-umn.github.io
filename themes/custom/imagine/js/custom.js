// Grid functionality fallback for older browsers
(function () {
  var supportsHas = window.CSS && CSS.supports && CSS.supports('selector(:has(> *))');
  if (supportsHas) return; // modern browser — the pure-CSS :has() rules already handle everything

  function updateGrid(grid) {
    var items = grid.querySelectorAll(':scope > .item');
    var count = items.length;
    grid.style.setProperty('--count', Math.min(count, 5));
    grid.classList.toggle('is-compact', count > 0 && count <= 3);
  }

  function watch(grid) {
    updateGrid(grid);
    new MutationObserver(function () { updateGrid(grid); })
      .observe(grid, { childList: true });
  }

  document.querySelectorAll('.grid').forEach(watch);
})();