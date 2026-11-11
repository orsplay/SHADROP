
/* ===== ФИЛЬТРЫ КЕЙСОВ SHADROP ===== */

window.initShadropCases = function () {
  const container = document.getElementById('casesPageContainer');
  if (!container) return;

  const filters = container.querySelectorAll('.cases-filter');
  const cards = container.querySelectorAll('.case-card');
  const counter = container.querySelector('.cases-visible-count');

  filters.forEach((button) => {
    if (button.dataset.initialized === 'true') return;

    button.dataset.initialized = 'true';

    button.addEventListener('click', () => {
      const selected = button.dataset.filter;
      let visibleCount = 0;

      filters.forEach((filter) => {
        filter.classList.toggle('is-active', filter === button);
      });

      cards.forEach((card) => {
        const visible =
          selected === 'all' ||
          card.dataset.category === selected;

        card.hidden = !visible;

        if (visible) visibleCount++;
      });

if (counter) {
  const word =
    visibleCount % 10 === 1 && visibleCount % 100 !== 11
      ? 'кейс'
      : visibleCount % 10 >= 2 &&
        visibleCount % 10 <= 4 &&
        (visibleCount % 100 < 12 || visibleCount % 100 > 14)
      ? 'кейса'
      : 'кейсов';

  counter.textContent = `${visibleCount} ${word}`;
}
    });
  });
};
