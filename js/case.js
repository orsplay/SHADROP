
/* ===== SHADROP CASE ROULETTE ===== */

(function () {
  "use strict";

  const ITEM_WIDTH = 112;
  const ITEM_GAP = 10;

  const ROULETTE_ITEMS = 65;
  const WIN_INDEX = 55;

  const SPIN_DURATION = 5200;

  let activeCase = null;
  let multiplier = 1;
  let spinning = false;
  let spinToken = 0;

  function getContainer() {
    return document.getElementById("casePageContainer");
  }

  function getRarities() {
    return window.SHADROP_RARITIES || {};
  }

  function getRewardColor(reward) {
    return getRarities()[reward.rarity]?.color || "#398cff";
  }

  function getRewardRarity(reward) {
    return getRarities()[reward.rarity]?.name || "Обычный";
  }

  function randomReward(rewards) {
    return rewards[Math.floor(Math.random() * rewards.length)];
  }

  /* ===== ЭЛЕМЕНТ РУЛЕТКИ ===== */

  function createRouletteItem(reward) {
    const item = document.createElement("div");

    item.className = "shadrop-roulette__item";
    item.style.setProperty(
      "--reward-color",
      getRewardColor(reward)
    );

    const image = document.createElement("img");

    image.src = reward.image;
    image.alt = reward.name;
    image.draggable = false;

    item.appendChild(image);

    return item;
  }

  /* ===== КВАДРАТНАЯ КАРТОЧКА НАГРАДЫ ===== */


function createRewardCard(reward) {
  const card = document.createElement("div");

  card.className = "shadrop-reward-card";
  card.style.setProperty(
    "--reward-color",
    getRewardColor(reward)
  );

  const image = document.createElement("img");
  image.className = "shadrop-reward-card__image";
  image.src = reward.image;
  image.alt = reward.name;
  image.loading = "lazy";
  image.draggable = false;

  const name = document.createElement("div");
  name.className = "shadrop-reward-card__name";
  name.textContent = reward.name;

  const price = document.createElement("div");
  price.className = "shadrop-reward-card__value";

  const priceNumber = document.createElement("span");
  priceNumber.textContent = reward.value.toLocaleString("ru-RU");

  const star = document.createElement("img");
  star.src = "assets/icons/telegram-star.png";
  star.alt = "Stars";

  price.append(priceNumber, star);
  card.append(image, name, price);

  return card;
}


  /* ===== ЦЕНА ===== */

  function updatePrice() {
    const container = getContainer();

    if (!container || !activeCase) return;

    const price = container.querySelector("#caseOpenPrice");

    if (price) {
      price.textContent = String(activeCase.price * multiplier);
    }
  }

  /* ===== МНОЖИТЕЛИ ===== */

  function updateMultiplierButtons() {
    const container = getContainer();

    if (!container) return;

    container
      .querySelectorAll(".shadrop-multiplier")
      .forEach((button) => {
        const isActive =
          Number(button.dataset.multiplier) === multiplier;

        button.classList.toggle("is-active", isActive);
      });
  }

  /* ===== ЗАПОЛНЕНИЕ РУЛЕТКИ ===== */

  function fillRoulette(winner = null) {
    const container = getContainer();
    const track = container?.querySelector("#rouletteTrack");

    if (!track || !activeCase) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < ROULETTE_ITEMS; i++) {
      let reward = randomReward(activeCase.rewards);

      if (winner && i === WIN_INDEX) {
        reward = winner;
      }

      fragment.appendChild(createRouletteItem(reward));
    }

    track.style.transition = "none";
    track.style.transform = "translate3d(0, 0, 0)";

    track.replaceChildren(fragment);
  }

  /* ===== РАСЧЁТ ПОЗИЦИИ ===== */

  function getStopPosition(track, viewport) {
    const firstItem = track.firstElementChild;

    if (!firstItem) return 0;

    const itemWidth =
      firstItem.getBoundingClientRect().width || ITEM_WIDTH;

    const styles = window.getComputedStyle(track);

    const gap =
      parseFloat(styles.columnGap) || ITEM_GAP;

    const step = itemWidth + gap;

    const itemCenter =
      WIN_INDEX * step + itemWidth / 2;

    const viewportCenter = viewport.clientWidth / 2;

    return viewportCenter - itemCenter;
  }

  /* ===== ОКНО ВЫИГРЫША ===== */

  function showResult(reward) {
    const container = getContainer();

    const overlay = container?.querySelector("#caseWinOverlay");

    if (!overlay) {
      console.error("SHADROP: окно выигрыша не найдено");
      return;
    }

    const modal = overlay.querySelector(".shadrop-win-modal");
    const image = overlay.querySelector("#caseWinImage");
    const name = overlay.querySelector("#caseWinName");
    const rarity = overlay.querySelector("#caseWinRarity");

    if (image) {
      image.src = reward.image;
      image.alt = reward.name;
    }

    if (name) {
      name.textContent = reward.name;
    }

    if (rarity) {
      rarity.textContent = getRewardRarity(reward);
    }

    if (modal) {
      modal.style.setProperty(
        "--win-color",
        getRewardColor(reward)
      );
    }

    overlay.hidden = false;
  }

  /* ===== ЗАКРЫТИЕ ОКНА ===== */

  function closeWinModal() {
    const container = getContainer();
    const overlay = container?.querySelector("#caseWinOverlay");

    if (overlay) {
      overlay.hidden = true;
    }
  }

  /* ===== БЛОКИРОВКА КНОПОК ===== */

  function setSpinningState(value) {
    spinning = value;

    const container = getContainer();

    if (!container) return;

    const openButton = container.querySelector("#caseOpenButton");
    const demoButton = container.querySelector("#caseDemoButton");

    if (openButton) {
      openButton.disabled = value;
    }

    if (demoButton) {
      demoButton.disabled = value;
    }

    container
      .querySelectorAll(".shadrop-multiplier")
      .forEach((button) => {
        button.disabled = value;
      });
  }

  /* ===== АНИМАЦИЯ РУЛЕТКИ ===== */

  async function spinRoulette() {
    if (!activeCase || spinning) return;

    const container = getContainer();

    const track = container?.querySelector("#rouletteTrack");
    const viewport = container?.querySelector("#rouletteViewport");

    if (!track || !viewport) return;

    closeWinModal();
    setSpinningState(true);

    // Демонстрационное открытие.
    // Настоящие Stars не списываются.
    const winner = randomReward(activeCase.rewards);

    fillRoulette(winner);

    // Принудительно применяем стартовую позицию.
    void track.offsetWidth;

    const stopPosition = getStopPosition(track, viewport);

    // Небольшое смещение внутри выигрышной карточки.
    const randomOffset = (Math.random() - 0.5) * 16;

    const token = ++spinToken;

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    if (token !== spinToken) return;

    track.style.transition =
      `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.7, 0.12, 1)`;

    track.style.transform =
      `translate3d(${stopPosition + randomOffset}px, 0, 0)`;

    window.setTimeout(() => {
      if (token !== spinToken) return;

      setSpinningState(false);

      showResult(winner);

      window.Telegram?.WebApp?.HapticFeedback
        ?.notificationOccurred?.("success");

    }, SPIN_DURATION + 100);
  }

  /* ===== ВОЗМОЖНЫЕ НАГРАДЫ ===== */

  function renderRewards() {
    const container = getContainer();
    const grid = container?.querySelector("#caseRewardsGrid");

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

    const fragment = document.createDocumentFragment();

    sortedRewards.forEach((reward) => {
      fragment.appendChild(createRewardCard(reward));
    });

    grid.appendChild(fragment);
  }

  /* ===== ОБРАБОТЧИКИ КНОПОК ===== */

  function bindEvents() {
    const container = getContainer();

    if (!container) return;

    if (container.dataset.caseEventsBound === "true") {
      return;
    }

    container.dataset.caseEventsBound = "true";

    // Назад
    container
      .querySelector("#caseBackButton")
      ?.addEventListener("click", () => {
        spinToken++;
        setSpinningState(false);
        closeWinModal();

        window.closeShadropCase?.();
      });

    // Множители
    container
      .querySelectorAll(".shadrop-multiplier")
      .forEach((button) => {
        button.addEventListener("click", () => {
          if (spinning) return;

          multiplier = Number(button.dataset.multiplier);

          updateMultiplierButtons();
          updatePrice();
        });
      });

    // Демо
    container
      .querySelector("#caseDemoButton")
      ?.addEventListener("click", () => {
        spinRoulette();
      });

    // Открыть
    container
      .querySelector("#caseOpenButton")
      ?.addEventListener("click", () => {
        spinRoulette();
      });

    // Крестик окна выигрыша
    container
      .querySelector("#caseWinClose")
      ?.addEventListener("click", closeWinModal);

    // Продолжить
    container
      .querySelector("#caseWinContinue")
      ?.addEventListener("click", closeWinModal);

    // Закрытие нажатием на затемнённый фон
    container
      .querySelector("#caseWinOverlay")
      ?.addEventListener("click", (event) => {
        if (event.target.id === "caseWinOverlay") {
          closeWinModal();
        }
      });
  }

  /* ===== ОТРИСОВКА СТРАНИЦЫ КЕЙСА ===== */

  window.renderShadropCase = function (caseId) {
    const config = window.SHADROP_CASES?.[caseId];

    if (!config) {
      console.error("SHADROP: кейс не найден:", caseId);
      return;
    }

    if (!Array.isArray(config.rewards) || !config.rewards.length) {
      console.error("SHADROP: у кейса нет наград:", caseId);
      return;
    }

    // Сбрасываем предыдущую анимацию.
    spinToken++;
    spinning = false;

    activeCase = config;
    multiplier = 1;

    const container = getContainer();

    if (!container) return;

    const page = container.querySelector(".shadrop-case-page");

    if (!page) {
      console.error("SHADROP: HTML страницы кейса не найден");
      return;
    }

    // Цвет оформления для каждого кейса.
    page.style.setProperty(
      "--case-accent",
      config.color || "#a46aff"
    );

    closeWinModal();
    setSpinningState(false);

    updateMultiplierButtons();
    updatePrice();

    fillRoulette();
    renderRewards();
    bindEvents();
  };

})();
