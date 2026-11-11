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
  showSelectedPage(page);
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



/* ===== ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ SHADROP ===== */

let profileLoaded = false;
let casesLoaded = false;
let currentPage = 'games';

async function showSelectedPage(page) {
  if (!screen) return;

  currentPage = page;

  // Контейнер профиля
  let profileContainer =
    document.getElementById('profilePageContainer');

  if (!profileContainer) {
    profileContainer = document.createElement('div');
    profileContainer.id = 'profilePageContainer';
    profileContainer.hidden = true;
    screen.appendChild(profileContainer);
  }

  // Контейнер кейсов
  let casesContainer =
    document.getElementById('casesPageContainer');

  if (!casesContainer) {
    casesContainer = document.createElement('div');
    casesContainer.id = 'casesPageContainer';
    casesContainer.hidden = true;
    screen.appendChild(casesContainer);
  }

  // Скрываем содержимое главной страницы
  Array.from(screen.children).forEach((element) => {
    if (
      element.classList.contains('topbar') ||
      element.id === 'profilePageContainer' ||
      element.id === 'casesPageContainer'
    ) return;

    element.hidden = page !== 'games';
  });

  // Отображаем выбранную страницу
  profileContainer.hidden = page !== 'profile';
  casesContainer.hidden = page !== 'cases';

  // ===== ПРОФИЛЬ =====

  if (page === 'profile') {
    if (!profileLoaded) {
      try {
        const response = await fetch('pages/profile.html?v=6');

        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }

        const html = await response.text();

        profileContainer.innerHTML = html;
        profileLoaded = true;

        if (currentPage !== 'profile') return;

      } catch (error) {
        console.error('Не удалось загрузить профиль:', error);

        profileContainer.textContent =
          'Не удалось загрузить профиль.';

        return;
      }
    }

    if (currentPage === 'profile') {
      window.renderShadropProfile?.();
    }

    return;
  }

  // ===== КЕЙСЫ =====

  if (page === 'cases') {
    if (!casesLoaded) {
      try {
        const response = await fetch('pages/cases.html?v=1');

        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }

        const html = await response.text();

        casesContainer.innerHTML = html;
        casesLoaded = true;

        if (currentPage !== 'cases') return;

      } catch (error) {
        console.error('Не удалось загрузить кейсы:', error);

        casesContainer.textContent =
          'Не удалось загрузить кейсы.';

        return;
      }
    }

    if (currentPage === 'cases') {
      window.initShadropCases?.();
    }
  }
}


function updateHeaderSpacing() {
  const header = document.querySelector(".topbar");
  if (!header) return;

  const height = header.getBoundingClientRect().bottom;

  document.documentElement.style.setProperty(
    "--header-height",
    `${height}px`
  );
}

window.addEventListener("DOMContentLoaded", updateHeaderSpacing);
window.addEventListener("resize", updateHeaderSpacing);

if (window.ResizeObserver) {
  const header = document.querySelector(".topbar");

  if (header) {
    new ResizeObserver(updateHeaderSpacing).observe(header);
  }
}