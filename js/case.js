/* ===== SHADROP CASE ROULETTE ===== */

(function () {
  const ITEM_WIDTH = 112;
  const ITEM_GAP = 10;

  const ROULETTE_ITEMS = 65;
  const WIN_INDEX = 55;

  let activeCase = null;
  let multiplier = 1;
  let spinning = false;
  let spinToken = 0;

  const rarities = window.SHADROP_RARITIES || {};

  function getContainer() {
    return document.getElementById('casePageContainer');
  }

  function getRewardColor(reward) {
    return rarities[reward.rarity]?.color || '#398cff';
  }

  function getRewardRarity(reward) {
    return rarities[reward.rarity]?.name || 'Обычный';
  }

  function randomReward(rewards) {
    return rewards[
      Math.floor(Math.random() * rewards.length)
    ];
  }

  function createRouletteItem(reward) {
    const item = document.createElement('div');

    item.className = 'shadrop-roulette__item';
    item.style.setProperty(
      '--reward-color',
      getRewardColor(reward)
    );

    const image = document.createElement('img');

    image.src = reward.image;
    image.alt = reward.name;
    image.draggable = false;

    item.appendChild(image);

    return item;
  }

  function createRewardCard(reward) {
    const card = document.createElement('div');

    card.className = 'shadrop-reward-card';
    card.style.setProperty(
      '--reward-color',
      getRewardColor(reward)
    );

    const image = document.createElement('img');
    image.className = 'shadrop-reward-card__image';
    image.src = reward.image;
    image.alt = reward.name;
    image.loading = 'lazy';

    const name = document.createElement('div');
    name.className = 'shadrop-reward-card__name';
    name.textContent = reward.name;

    const rarity = document.createElement('div');
    rarity.className = 'shadrop-reward-card__rarity';
    rarity.textContent = getRewardRarity(reward);

    const value = document.createElement('div');
    value.className = 'shadrop-reward-card__value';
    value.textContent = `${reward.value} ⭐`;

    card.append(image, name, rarity, value);

    return card;
  }

  function updatePrice() {
    const container = getContainer();

    if (!container || !activeCase) return;

    const price = container.querySelector('#caseOpenPrice');

    if (price) {
      price.textContent = activeCase.price * multiplier;
    }
  }

  function updateMultiplierButtons() {
    const container = getContainer();

    if (!container) return;

    container
      .querySelectorAll('.shadrop-multiplier')
      .forEach((button) => {
        button.classList.toggle(
          'is-active',
          Number(button.dataset.multiplier) === multiplier
        );
      });
  }

  function fillRoulette(winner = null) {
    const container = getContainer();
    const track = container?.querySelector('#rouletteTrack');

    if (!track || !activeCase) return;

    track.replaceChildren();

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < ROULETTE_ITEMS; i++) {
      let reward = randomReward(activeCase.rewards);

      if (winner && i === WIN_INDEX) {
        reward = winner;
      }

      fragment.appendChild(
        createRouletteItem(reward)
      );
    }

    track.appendChild(fragment);

    track.style.transition = 'none';
    track.style.transform = 'translate3d(0, 0, 0)';
  }

  function getItemStep(track) {
    const firstItem = track.firstElementChild;

    if (!firstItem) {
      return ITEM_WIDTH + ITEM_GAP;
    }

    const width = firstItem.getBoundingClientRect().width;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap) || ITEM_GAP;

    return width + gap;
  }

  function getStopPosition(track, viewport) {
    const step = getItemStep(track);

    const firstItem = track.firstElementChild;
    const itemWidth = firstItem?.getBoundingClientRect().width
      || ITEM_WIDTH;

    const viewportWidth = viewport.clientWidth;

    const itemCenter =
      WIN_INDEX * step + itemWidth / 2;

    const viewportCenter = viewportWidth / 2;

    return viewportCenter - itemCenter;
  }

  function showResult(reward) {
    const container = getContainer();
    const result = container?.querySelector('#caseResult');

    if (!result) return;

    result.replaceChildren();

    const title = document.createElement('div');
    title.className = 'shadrop-case-result__title';
    title.textContent = 'Демонстрационный результат';

    const image = document.createElement('img');
    image.src = reward.image;
    image.alt = reward.name;

    const name = document.createElement('div');
    name.className = 'shadrop-case-result__name';
    name.textContent = reward.name;

    result.append(title, image, name);

    result.hidden = false;
  }

  function setSpinningState(value) {
    spinning = value;

    const container = getContainer();

    if (!container) return;

    const openButton = container.querySelector('#caseOpenButton');
    const demoButton = container.querySelector('#caseDemoButton');

    if (openButton) {
      openButton.disabled = value;
    }

    if (demoButton) {
      demoButton.disabled = value;
    }

    container
      .querySelectorAll('.shadrop-multiplier')
      .forEach((button) => {
        button.disabled = value;
      });
  }

  async function spinRoulette() {
    if (!activeCase || spinning) return;

    const container = getContainer();

    const track = container?.querySelector('#rouletteTrack');
    const viewport = container?.querySelector('#rouletteViewport');
    const result = container?.querySelector('#caseResult');

    if (!track || !viewport) return;

    setSpinningState(true);

    if (result) {
      result.hidden = true;
    }

    // Только демонстрация.
    // Результат выбирается случайно из списка подарков.
    const winner = randomReward(activeCase.rewards);

    fillRoulette(winner);

    // Позволяем браузеру применить начальную позицию.
    track.getBoundingClientRect();

    const stopPosition = getStopPosition(track, viewport);

    const randomOffset = (Math.random() - 0.5) * 20;

    const token = ++spinToken;

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    if (token !== spinToken) return;

    track.style.transition =
      'transform 5200ms cubic-bezier(0.12, 0.7, 0.12, 1)';

    track.style.transform =
      `translate3d(${stopPosition + randomOffset}px, 0, 0)`;

    window.setTimeout(() => {
      if (token !== spinToken) return;

      setSpinningState(false);

      showResult(winner);

      window.Telegram?.WebApp?.HapticFeedback
        ?.notificationOccurred?.('success');

    }, 5300);
  }

  function renderRewards() {
    const container = getContainer();
    const grid = container?.querySelector('#caseRewardsGrid');

    if (!grid || !activeCase) return;

    grid.replaceChildren();

    const order = {
      legendary: 0,
      epic: 1,
      rare: 2,
      uncommon: 3,
      common: 4
    };

    const sortedRewards = [...activeCase.rewards].sort(
      (a, b) =>
        (order[a.rarity] ?? 99) -
        (order[b.rarity] ?? 99)
    );

    sortedRewards.forEach((reward) => {
      grid.appendChild(createRewardCard(reward));
    });
  }

  function bindEvents() {
    const container = getContainer();

    if (!container) return;

    if (container.dataset.caseEventsBound === 'true') {
      return;
    }

    container.dataset.caseEventsBound = 'true';

    container
      .querySelector('#caseBackButton')
      ?.addEventListener('click', () => {
        window.closeShadropCase?.();
      });

    container
      .querySelectorAll('.shadrop-multiplier')
      .forEach((button) => {
        button.addEventListener('click', () => {
          if (spinning) return;

          multiplier = Number(button.dataset.multiplier);

          updateMultiplierButtons();
          updatePrice();
        });
      });

    container
      .querySelector('#caseDemoButton')
      ?.addEventListener('click', () => {
        spinRoulette();
      });

    container
      .querySelector('#caseOpenButton')
      ?.addEventListener('click', () => {
        spinRoulette();
      });
  }

  window.renderShadropCase = function (caseId) {
    const config = window.SHADROP_CASES?.[caseId];

    if (!config) {
      console.error('Кейс не найден:', caseId);
      return;
    }

    // Останавливаем предыдущую анимацию,
    // если пользователь переключил кейс.
    spinToken++;
    spinning = false;

    activeCase = config;
    multiplier = 1;

    const container = getContainer();

    if (!container) return;

    const page = container.querySelector('.shadrop-case-page');

    if (!page) return;

    page.style.setProperty(
      '--case-accent',
      config.color
    );

    const image = container.querySelector('#caseHeroImage');
    const title = container.querySelector('#caseHeroTitle');
    const description = container.querySelector(
      '#caseHeroDescription'
    );
    const result = container.querySelector('#caseResult');

    if (image) {
      image.src = config.image;
      image.alt = config.name;
    }

    if (title) {
      title.textContent = config.name;
    }

    if (description) {
      description.textContent = config.description;
    }

    if (result) {
      result.hidden = true;
    }

    setSpinningState(false);

    updateMultiplierButtons();
    updatePrice();

    fillRoulette();
    renderRewards();
    bindEvents();
  };
})();