const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Убираем верхнюю границу мини-приложения в версиях Telegram,
  // поддерживающих полноэкранный режим.
  if (typeof tg.requestFullscreen === 'function') {
    try {
      tg.requestFullscreen();
    } catch (error) {
      console.info('Полноэкранный режим недоступен:', error);
    }
  }
  tg.setBackgroundColor?.('#000000');
  tg.setHeaderColor?.('#000000');
}

const screen = document.getElementById('screen');
const nav = document.getElementById('bottomNav');
const navItems = document.querySelectorAll('.nav-item');
const navIndicator = document.getElementById('navIndicator');

const labels = {
  games: 'Игры',
  cases: 'Кейсы',
  bonuses: 'Бонусы',
  profile: 'Профиль'
};

function moveIndicator(activeButton) {
  if (!nav || !navIndicator || !activeButton) return;
  const navRect = nav.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();
  const width = buttonRect.width - 2;
  const left = buttonRect.left - navRect.left + 1;
  navIndicator.style.width = `${width}px`;
  navIndicator.style.left = `${left}px`;
}

function setActive(button) {
  navItems.forEach((item) => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });

  const page = button.dataset.page;
  const label = labels[page] || '';
  screen.setAttribute('aria-label', label);

  moveIndicator(button);
  tg?.HapticFeedback?.selectionChanged?.();
}

navItems.forEach((button) => {
  button.addEventListener('click', () => setActive(button));
});

window.addEventListener('resize', () => {
  const activeButton = document.querySelector('.nav-item.is-active');
  if (activeButton) moveIndicator(activeButton);
});

window.addEventListener('load', () => {
  const activeButton = document.querySelector('.nav-item.is-active') || navItems[0];
  if (activeButton) setActive(activeButton);
});

// Действия верхних кнопок. Реальные платежи пока не подключены.
const balanceButton = document.querySelector('.balance-chip');
const depositButton = document.querySelector('.deposit-button');
const profileButton = document.querySelector('.profile-button');
function showNotice(message) {
  if (typeof tg?.showAlert === 'function') tg.showAlert(message);
  else window.alert(message);
}
balanceButton?.addEventListener('click', () => showNotice('Баланс: 0 ₽'));
depositButton?.addEventListener('click', () => showNotice('Пополнение скоро появится'));
profileButton?.addEventListener('click', () => {
  const profileTab = document.querySelector('.nav-item[data-page="profile"]');
  if (profileTab) setActive(profileTab);
});
