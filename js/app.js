
const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();

  // Полноэкранный режим Telegram
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
  case: 'Кейс',
  bonuses: 'Бонусы',
  profile: 'Профиль'
};

/* ===== НИЖНЯЯ НАВИГАЦИЯ ===== */

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
  if (!button || !screen) return;

  navItems.forEach((item) => {
    const active = item === button;

    item.classList.toggle('is-active', active);

    if (active) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });

  const page = button.dataset.page;
  const label = labels[page] || '';

  screen.setAttribute('aria-label', label);

  moveIndicator(button);
  showSelectedPage(page);

  tg?.HapticFeedback?.selectionChanged?.();
}

navItems.forEach((button) => {
  button.addEventListener('click', () => {
    setActive(button);
  });
});

window.addEventListener('resize', () => {
  const activeButton = document.querySelector(
    '.nav-item.is-active'
  );

  if (activeButton) {
    moveIndicator(activeButton);
  }
});

window.addEventListener('load', () => {
  const activeButton =
    document.querySelector('.nav-item.is-active') ||
    navItems[0];

  if (activeButton) {
    setActive(activeButton);
  }
});

/* ===== ВЕРХНИЕ КНОПКИ ===== */

const balanceButton = document.querySelector('.balance-chip');
const depositButton = document.querySelector('.deposit-button');
const profileButton = document.querySelector('.profile-button');

function showNotice(message) {
  if (typeof tg?.showAlert === 'function') {
    tg.showAlert(message);
  } else {
    window.alert(message);
  }
}

balanceButton?.addEventListener('click', () => {
  showNotice('Баланс: 0 ₽');
});

depositButton?.addEventListener('click', () => {
  showNotice('Пополнение скоро появится');
});

profileButton?.addEventListener('click', () => {
  const profileTab = document.querySelector(
    '.nav-item[data-page="profile"]'
  );

  if (profileTab) {
    setActive(profileTab);
  }
});

/* ===== СОСТОЯНИЕ СТРАНИЦ ===== */

let profileLoaded = false;
let casesLoaded = false;
let caseLoaded = false;

let currentPage = 'games';
let selectedCaseId = null;

// Храним запросы, чтобы не загружать
// одну и ту же страницу несколько раз.
const pageRequests = {};

/* ===== ОТКРЫТИЕ КЕЙСА ===== */

window.openShadropCase = function (caseId) {
  if (!caseId) return;

  selectedCaseId = caseId;

  // В нижнем меню оставляем активной
  // вкладку "Кейсы".
  const casesTab = document.querySelector(
    '.nav-item[data-page="cases"]'
  );

  if (casesTab) {
    navItems.forEach((item) => {
      const active = item === casesTab;

      item.classList.toggle('is-active', active);

      if (active) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });

    moveIndicator(casesTab);
  }

  showSelectedPage('case');

  tg?.HapticFeedback?.selectionChanged?.();
};

/* ===== ВОЗВРАЩЕНИЕ В КАТАЛОГ ===== */

window.closeShadropCase = function () {
  const casesTab = document.querySelector(
    '.nav-item[data-page="cases"]'
  );

  if (casesTab) {
    setActive(casesTab);
  } else {
    showSelectedPage('cases');
  }
};

/* ===== СОЗДАНИЕ КОНТЕЙНЕРОВ ===== */

function getPageContainer(id) {
  if (!screen) return null;

  let container = document.getElementById(id);

  if (!container) {
    container = document.createElement('div');
    container.id = id;
    container.hidden = true;

    screen.appendChild(container);
  }

  return container;
}

/* ===== ЗАГРУЗКА HTML ===== */

async function loadPage(container, path, key) {
  if (!container) return false;

  // Если запрос уже выполняется,
  // используем существующий.
  if (!pageRequests[key]) {
    pageRequests[key] = (async () => {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const html = await response.text();

      container.innerHTML = html;

      return true;
    })();
  }

  try {
    return await pageRequests[key];
  } catch (error) {
    // Разрешаем повторную загрузку после ошибки.
    delete pageRequests[key];

    console.error(
      `Не удалось загрузить страницу ${key}:`,
      error
    );

    container.textContent =
      'Не удалось загрузить страницу. Попробуйте ещё раз.';

    return false;
  }
}

/* ===== ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ SHADROP ===== */

async function showSelectedPage(page) {
  if (!screen) return;

  currentPage = page;

  // Контейнер профиля
  const profileContainer = getPageContainer(
    'profilePageContainer'
  );

  // Контейнер каталога кейсов
  const casesContainer = getPageContainer(
    'casesPageContainer'
  );

  // Контейнер универсального кейса
  const caseContainer = getPageContainer(
    'casePageContainer'
  );

  if (
    !profileContainer ||
    !casesContainer ||
    !caseContainer
  ) {
    return;
  }

  // Скрываем стандартное содержимое главной.
  // Верхнюю панель оставляем видимой.
  Array.from(screen.children).forEach((element) => {
    if (
      element.classList.contains('topbar') ||
      element.id === 'profilePageContainer' ||
      element.id === 'casesPageContainer' ||
      element.id === 'casePageContainer'
    ) {
      return;
    }

    element.hidden = page !== 'games';
  });

  // Показываем нужный контейнер
  profileContainer.hidden = page !== 'profile';
  casesContainer.hidden = page !== 'cases';
  caseContainer.hidden = page !== 'case';

  screen.setAttribute(
    'aria-label',
    labels[page] || ''
  );

  /* ===== ПРОФИЛЬ ===== */

  if (page === 'profile') {
    if (!profileLoaded) {
      const loaded = await loadPage(
        profileContainer,
        'pages/profile.html?v=6',
        'profile'
      );

      if (!loaded) return;

      profileLoaded = true;
    }

    if (currentPage !== 'profile') return;

    window.renderShadropProfile?.();

    return;
  }

  /* ===== КАТАЛОГ КЕЙСОВ ===== */

  if (page === 'cases') {
    if (!casesLoaded) {
      const loaded = await loadPage(
        casesContainer,
        'pages/cases.html?v=1',
        'cases'
      );

      if (!loaded) return;

      casesLoaded = true;
    }

    if (currentPage !== 'cases') return;

    window.initShadropCases?.();

    return;
  }

  /* ===== УНИВЕРСАЛЬНАЯ СТРАНИЦА КЕЙСА ===== */

  if (page === 'case') {
    if (!caseLoaded) {
      const loaded = await loadPage(
        caseContainer,
        'pages/case.html?v=1',
        'case'
      );

      if (!loaded) return;

      caseLoaded = true;
    }

    if (currentPage !== 'case') return;

    // Передаём ID выбранного кейса:
    // anime, comics, girls, ice и т.д.
    if (typeof window.renderShadropCase === 'function') {
      window.renderShadropCase(selectedCaseId);
    } else {
      console.warn(
        'Функция renderShadropCase ещё не подключена.'
      );
    }

    return;
  }

  /* ===== ГЛАВНАЯ И ОСТАЛЬНЫЕ ВКЛАДКИ ===== */

  // Для games отображается исходная главная.
  // Вкладку bonuses подключим позднее.
}

/* ===== ОБРАБОТКА НАЖАТИЙ НА КЕЙСЫ ===== */

// Делегирование событий позволяет работать
// с карточками, загруженными через fetch().
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const card = event.target.closest(
    '#casesPageContainer .case-card'
  );

  if (!card) return;

  const caseId = card.dataset.case;

  if (!caseId) return;

  window.openShadropCase(caseId);
});

/* ===== ВЫСОТА ВЕРХНЕЙ ПАНЕЛИ ===== */

function updateHeaderSpacing() {
  const header = document.querySelector('.topbar');

  if (!header) return;

  const height = header.getBoundingClientRect().bottom;

  document.documentElement.style.setProperty(
    '--header-height',
    `${height}px`
  );
}

window.addEventListener(
  'DOMContentLoaded',
  updateHeaderSpacing
);

window.addEventListener(
  'resize',
  updateHeaderSpacing
);

if (window.ResizeObserver) {
  const header = document.querySelector('.topbar');

  if (header) {
    new ResizeObserver(updateHeaderSpacing).observe(header);
  }
}
