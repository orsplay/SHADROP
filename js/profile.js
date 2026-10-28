
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

  function renderHeaderAvatars() {
    const user = getTelegramUser();
    if (!user?.photo_url) return;

    document.querySelectorAll('.telegram-user-photo')
      .forEach(img => loadAvatar(img, user.photo_url));
  }

  window.renderShadropProfile = function () {
    
const stickerContainer = document.getElementById('inventorySticker');

if (stickerContainer && !stickerContainer.dataset.loaded && window.lottie) {
  stickerContainer.dataset.loaded = 'true';

  lottie.loadAnimation({
    container: stickerContainer,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'assets/images/empty-inventory.json'
  });
}

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
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHeaderAvatars);
  } else {
    renderHeaderAvatars();
  }
})();
