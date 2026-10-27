
window.renderShadropProfile = function () {
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  const nameElement = document.getElementById('playerName');
  const usernameElement = document.getElementById('playerUsername');
  const idElement = document.getElementById('playerId');
  const avatarElement = document.getElementById('playerAvatar');
  const initialElement = document.getElementById('playerInitial');

  if (!nameElement || !avatarElement) return;

  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    : 'Тестовый игрок';

  nameElement.textContent = name || 'Игрок';

  usernameElement.textContent = user?.username
    ? '@' + user.username
    : 'Username не указан';

  idElement.textContent = user?.id
    ? 'Telegram ID: ' + user.id
    : 'Telegram ID: недоступен';

  initialElement.textContent =
    (name || 'И').charAt(0).toUpperCase();

  avatarElement.hidden = true;
  initialElement.hidden = false;

  if (user?.photo_url) {
    try {
      const avatarUrl = new URL(user.photo_url);
      if (avatarUrl.protocol === 'https:') {
        avatarElement.onload = () => {
          avatarElement.hidden = false;
          initialElement.hidden = true;
        };

        avatarElement.onerror = () => {
          avatarElement.hidden = true;
          initialElement.hidden = false;
        };

        avatarElement.src = avatarUrl.href;
      }
    } catch (error) {
      console.info('Аватар Telegram недоступен');
    }
  }
};
