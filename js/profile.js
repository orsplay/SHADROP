
(function () {
  const tg = window.Telegram?.WebApp;

  function getTelegramUser() {
    return tg?.initDataUnsafe?.user || null;
  }

  function loadAvatar(img, url, fallback) {
    if (!img || !url) return;

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return;

      const temp = new Image();

      temp.onload = () => {
        img.src = parsed.href;
        img.hidden = false;
        img.classList.add('is-user-avatar');

        if (fallback) fallback.hidden = true;
      };

      temp.onerror = () => {
        img.classList.remove('is-user-avatar');
        if (fallback) fallback.hidden = false;
      };

      temp.src = parsed.href;
    } catch (error) {
      console.info('Аватар Telegram недоступен');
    }
  }

  // Аватары в верхней панели и нижнем островке
  function renderHeaderAvatars() {
    const user = getTelegramUser();
    if (!user?.photo_url) return;

    document.querySelectorAll('.telegram-user-photo')
      .forEach(img => loadAvatar(img, user.photo_url));
  }

  // Анимированный Telegram-стикер

let inventoryAnimation = null;
let inventoryAnimationContainer = null;
let tlottiePromise = null;

async function renderInventorySticker() {
  const container = document.getElementById('inventorySticker');

  if (!container) return;

  // Если анимация уже загружена — запускаем заново
  if (inventoryAnimation && inventoryAnimationContainer === container) {
    inventoryAnimation.stop();
    inventoryAnimation.seek(0);
    inventoryAnimation.play();
    return;
  }

  // Защита от повторной загрузки
  if (container.dataset.loading === 'true') return;

  container.dataset.loading = 'true';

  try {
    // Загружаем новый проигрыватель
    if (!tlottiePromise) {
      tlottiePromise = import(
        'https://esm.sh/tlottie/vanilla'
      );
    }

    const { createTLottiePlayer } = await tlottiePromise;

    if (!container.isConnected) return;

    // Создаём проигрыватель
    const { tlottie } = createTLottiePlayer(container, {
      src: 'assets/icons/Gifts/AnimatedSticker.tgs',
      loop: false,
      autoplay: true
    });

    inventoryAnimation = tlottie;
    inventoryAnimationContainer = container;

    tlottie.on('load', () => {
      console.log('SHADROP: стикер загружен');
    });

    tlottie.on('complete', () => {
      console.log('SHADROP: анимация завершена');
    });

    tlottie.on('error', (error) => {
      console.error('Ошибка tlottie:', error);
    });

  } catch (error) {
    console.error('Не удалось запустить стикер:', error);
    container.dataset.loading = 'false';
    tlottiePromise = null;
  }
}

  // Профиль игрока
  window.renderShadropProfile = function () {
    const user = getTelegramUser();

    const nameElement = document.getElementById('playerName');
    const idElement = document.getElementById('playerId');
    const avatarElement = document.getElementById('playerAvatar');
    const initialElement = document.getElementById('playerInitial');

    if (!nameElement || !idElement || !avatarElement) return;

    const name = user
      ? [user.first_name, user.last_name]
          .filter(Boolean)
          .join(' ')
          .trim()
      : 'Тестовый игрок';

    nameElement.textContent = name || 'Игрок';

    idElement.textContent = user?.id
      ? `ID: ${user.id}`
      : 'ID: недоступен';

    if (initialElement) {
      initialElement.textContent =
        (name || 'И').charAt(0).toUpperCase();
    }

    loadAvatar(avatarElement, user?.photo_url, initialElement);

    renderInventorySticker();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHeaderAvatars);
  } else {
    renderHeaderAvatars();
  }
})();
