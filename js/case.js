
/* ===== SHADROP MULTI ROULETTE ===== */

(function () {
  "use strict";

  const ITEM_COUNT = 65;
  const WIN_INDEX = 55;
  const SPIN_DURATION = 5200;
  const GAP = 6;

  let activeCase = null;
  let multiplier = 1;
  let demoMode = false;
  let spinning = false;
  let spinToken = 0;

  function container() {
    return document.getElementById("casePageContainer");
  }

  function colorOf(reward) {
    return window.SHADROP_RARITIES?.[reward.rarity]?.color
      || "#398cff";
  }

  function rarityOf(reward) {
    return window.SHADROP_RARITIES?.[reward.rarity]?.name
      || "Обычный";
  }

  function randomReward() {
    const rewards = activeCase.rewards;
    return rewards[Math.floor(Math.random() * rewards.length)];
  }

  function createItem(reward) {
    const item = document.createElement("div");

    item.className = "shadrop-roulette__item";
    item.style.setProperty("--reward-color", colorOf(reward));

    const img = document.createElement("img");
    img.src = reward.image;
    img.alt = reward.name;
    img.draggable = false;

    item.appendChild(img);

    return item;
  }

  /* ===== КАРТОЧКА ВОЗМОЖНОЙ НАГРАДЫ ===== */

  function createRewardCard(reward) {
    const card = document.createElement("div");

    card.className = "shadrop-reward-card";
    card.style.setProperty("--reward-color", colorOf(reward));

    const img = document.createElement("img");
    img.className = "shadrop-reward-card__image";
    img.src = reward.image;
    img.alt = reward.name;
    img.loading = "lazy";

    const name = document.createElement("div");
    name.className = "shadrop-reward-card__name";
    name.textContent = reward.name;

    const price = document.createElement("div");
    price.className = "shadrop-reward-card__value";

    const amount = document.createElement("span");
    amount.textContent = Number(reward.value).toLocaleString("ru-RU");

    const star = document.createElement("img");
    star.src = "assets/icons/telegram-star.png";
    star.alt = "Stars";

    price.append(amount, star);
    card.append(img, name, price);

    return card;
  }

  /* ===== РАЗМЕР КВАДРАТНЫХ КАРТОЧЕК ===== */

  function updateRouletteSizes() {
    const root = container();
    if (!root) return;

    const roulettes = root.querySelectorAll(".shadrop-roulette");

    roulettes.forEach(roulette => {
      const viewport = roulette.querySelector(
        ".shadrop-roulette__viewport"
      );

      if (!viewport) return;

      const availableWidth = viewport.clientWidth;

      if (!availableWidth) return;

      // Пять квадратов и четыре промежутка.
      const itemSize = Math.floor(
        (availableWidth - GAP * 4) / 5
      );

      roulette.style.setProperty(
        "--roulette-item-size",
        `${itemSize}px`
      );
    });
  }

  /* ===== СОЗДАНИЕ РУЛЕТКИ ===== */

  function createRoulette(index) {
    const roulette = document.createElement("div");

    roulette.className = "shadrop-roulette";
    roulette.dataset.rouletteIndex = index;

    const viewport = document.createElement("div");
    viewport.className = "shadrop-roulette__viewport";

    const track = document.createElement("div");
    track.className = "shadrop-roulette__track";

    viewport.appendChild(track);

    const top = document.createElement("div");
    top.className =
      "shadrop-roulette__pointer shadrop-roulette__pointer--top";

    const bottom = document.createElement("div");
    bottom.className =
      "shadrop-roulette__pointer shadrop-roulette__pointer--bottom";

    const center = document.createElement("div");
    center.className = "shadrop-roulette__center";

    roulette.append(viewport, top, bottom, center);

    return roulette;
  }

  /* ===== ЗАПОЛНЕНИЕ РУЛЕТКИ ===== */

  function fillTrack(track, winner = null) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < ITEM_COUNT; i++) {
      const reward =
        winner && i === WIN_INDEX
          ? winner
          : randomReward();

      fragment.appendChild(createItem(reward));
    }

    track.style.transition = "none";
    track.style.transform = "translate3d(0,0,0)";
    track.replaceChildren(fragment);
  }

  /* ===== РАЗМЕРЫ И ПОЗИЦИИ ===== */

  function getTrackMetrics(track) {
    const first = track.firstElementChild;

    const width = first?.getBoundingClientRect().width || 65;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap) || GAP;

    return {
      width,
      step: width + gap
    };
  }

  function getPosition(track, viewport, index) {
    const { width, step } = getTrackMetrics(track);

    const itemCenter = index * step + width / 2;

    return viewport.clientWidth / 2 - itemCenter;
  }

  /* ===== СТАРТОВАЯ ПОЗИЦИЯ ===== */

  function setPreviewPosition(track) {
    const roulette = track.closest(".shadrop-roulette");

    const viewport = roulette?.querySelector(
      ".shadrop-roulette__viewport"
    );

    if (!viewport) return;

    const previewIndex = 4;

    track.style.transition = "none";
    track.style.transform =
      `translate3d(${getPosition(track, viewport, previewIndex)}px,0,0)`;
  }

  /* ===== ОТРИСОВКА РУЛЕТОК ===== */

  function renderRoulettes() {
    const root = container()?.querySelector("#caseRoulettes");

    if (!root || !activeCase) return;

    root.replaceChildren();
    root.dataset.count = multiplier;

    for (let i = 0; i < multiplier; i++) {
      root.appendChild(createRoulette(i));
    }

    // Сначала вставляем рулетки в DOM.
    updateRouletteSizes();

    // Затем создаём подарки с правильной шириной.
    root.querySelectorAll(".shadrop-roulette__track")
      .forEach(track => {
        fillTrack(track);
        setPreviewPosition(track);
      });
  }

  /* ===== МНОЖИТЕЛИ ===== */

  function updateMultiplierButtons() {
    container()
      ?.querySelectorAll(".shadrop-multiplier")
      .forEach(button => {
        button.classList.toggle(
          "is-active",
          Number(button.dataset.multiplier) === multiplier
        );
      });
  }

  /* ===== ДЕМО ===== */

  function updateDemoButton() {
    const button = container()?.querySelector("#caseDemoButton");

    if (!button) return;

    button.classList.toggle("is-active", demoMode);
    button.setAttribute("aria-pressed", String(demoMode));
  }

  /* ===== ЦЕНА ===== */

  function updatePrice() {
    const root = container();

    if (!root || !activeCase) return;

    const label = root.querySelector("#caseOpenLabel");
    const price = root.querySelector("#caseOpenPrice");
    const star = root.querySelector("#caseOpenStar");

    if (demoMode) {
      if (label) label.textContent = "Демо-открытие";
      if (price) price.hidden = true;
      if (star) star.hidden = true;
    } else {
      if (label) label.textContent = "Открыть за";

      if (price) {
        price.hidden = false;
        price.textContent = activeCase.price * multiplier;
      }

      if (star) star.hidden = false;
    }
  }

  /* ===== БЛОКИРОВКА КНОПОК ===== */

  function setSpinning(value) {
    spinning = value;

    const root = container();
    if (!root) return;

    const open = root.querySelector("#caseOpenButton");
    const demo = root.querySelector("#caseDemoButton");

    if (open) open.disabled = value;
    if (demo) demo.disabled = value;

    root.querySelectorAll(".shadrop-multiplier")
      .forEach(button => {
        button.disabled = value;
      });
  }

  /* ===== ОКНО РЕЗУЛЬТАТА ===== */

  function closeModal() {
    const overlay = container()?.querySelector("#caseWinOverlay");

    if (overlay) {
      overlay.hidden = true;
    }
  }

  function showResults(winners) {
    const root = container();
    const overlay = root?.querySelector("#caseWinOverlay");

    if (!overlay || !winners.length) return;

    const first = winners[0];
    const modal = overlay.querySelector(".shadrop-win-modal");

    const title = overlay.querySelector("#caseWinTitle");
    const description = overlay.querySelector("#caseWinDescription");
    const image = overlay.querySelector("#caseWinImage");
    const name = overlay.querySelector("#caseWinName");
    const rarity = overlay.querySelector("#caseWinRarity");
    const multiple = overlay.querySelector("#caseWinMultiple");

    if (modal) {
      modal.style.setProperty("--win-color", colorOf(first));
    }

    if (title) {
      title.textContent = demoMode
        ? "ДЕМО-РЕЗУЛЬТАТ"
        : "РЕЗУЛЬТАТ ОТКРЫТИЯ";
    }

    if (description) {
      description.textContent =
        "Демонстрация: подарки не добавляются в инвентарь";
    }

    if (image) {
      image.src = first.image;
      image.alt = first.name;
    }

    if (name) name.textContent = first.name;
    if (rarity) rarity.textContent = rarityOf(first);

    if (multiple) {
      multiple.replaceChildren();
      multiple.hidden = winners.length === 1;

      if (winners.length > 1) {
        winners.forEach(reward => {
          const card = document.createElement("div");
          card.className = "shadrop-win-multiple__item";

          const img = document.createElement("img");
          img.src = reward.image;
          img.alt = reward.name;

          const text = document.createElement("span");
          text.textContent = reward.name;

          card.append(img, text);
          multiple.appendChild(card);
        });
      }
    }

    overlay.hidden = false;
  }

  /* ===== ЗАПУСК РУЛЕТОК ===== */

  async function spinRoulettes() {
    if (spinning || !activeCase) return;

    const root = container();

    const roulettes = [
      ...root.querySelectorAll(".shadrop-roulette")
    ];

    if (!roulettes.length) return;

    closeModal();
    setSpinning(true);

    const token = ++spinToken;
    const winners = [];

    // Создаём независимый результат для каждой рулетки.
    roulettes.forEach(roulette => {
      const winner = randomReward();
      winners.push(winner);

      const track = roulette.querySelector(
        ".shadrop-roulette__track"
      );

      fillTrack(track, winner);
      setPreviewPosition(track);
    });

    // Применяем стартовые позиции.
    void root.offsetWidth;

    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    if (token !== spinToken) return;

    // Запускаем все рулетки.
    roulettes.forEach((roulette, index) => {
      const track = roulette.querySelector(
        ".shadrop-roulette__track"
      );

      const viewport = roulette.querySelector(
        ".shadrop-roulette__viewport"
      );

      const position = getPosition(
        track,
        viewport,
        WIN_INDEX
      );

      const randomOffset = (Math.random() - 0.5) * 8;
      const duration = SPIN_DURATION + index * 180;

      track.style.transition =
        `transform ${duration}ms cubic-bezier(0.12,0.7,0.12,1)`;

      track.style.transform =
        `translate3d(${position + randomOffset}px,0,0)`;
    });

    const totalDuration =
      SPIN_DURATION + (roulettes.length - 1) * 180 + 150;

    setTimeout(() => {
      if (token !== spinToken) return;

      setSpinning(false);
      showResults(winners);

      window.Telegram?.WebApp?.HapticFeedback
        ?.notificationOccurred?.("success");

    }, totalDuration);
  }

  /* ===== ВОЗМОЖНЫЕ НАГРАДЫ ===== */

  function renderRewards() {
    const grid = container()?.querySelector("#caseRewardsGrid");

    if (!grid || !activeCase) return;

    const order = {
      legendary: 0,
      epic: 1,
      rare: 2,
      uncommon: 3,
      common: 4
    };

    const rewards = [...activeCase.rewards].sort(
      (a, b) =>
        (order[a.rarity] ?? 99) -
        (order[b.rarity] ?? 99)
    );

    grid.replaceChildren();

    rewards.forEach(reward => {
      grid.appendChild(createRewardCard(reward));
    });
  }

  /* ===== СОБЫТИЯ ===== */

  function bindEvents() {
    const root = container();

    if (!root || root.dataset.caseEventsBound === "true") {
      return;
    }

    root.dataset.caseEventsBound = "true";

    // Множители x1–x5
    root.querySelectorAll(".shadrop-multiplier")
      .forEach(button => {
        button.addEventListener("click", () => {
          if (spinning) return;

          multiplier = Number(button.dataset.multiplier);

          updateMultiplierButtons();
          updatePrice();
          renderRoulettes();
        });
      });

    // Переключатель деморежима
    root.querySelector("#caseDemoButton")
      ?.addEventListener("click", () => {
        if (spinning) return;

        demoMode = !demoMode;

        updateDemoButton();
        updatePrice();
      });

    // Открытие
    root.querySelector("#caseOpenButton")
      ?.addEventListener("click", spinRoulettes);

    // Закрытие результата
    root.querySelector("#caseWinClose")
      ?.addEventListener("click", closeModal);

    root.querySelector("#caseWinContinue")
      ?.addEventListener("click", closeModal);

    root.querySelector("#caseWinOverlay")
      ?.addEventListener("click", event => {
        if (event.target.id === "caseWinOverlay") {
          closeModal();
        }
      });
  }

  /* ===== ОТКРЫТИЕ СТРАНИЦЫ КЕЙСА ===== */

  window.renderShadropCase = function (caseId) {
    const config = window.SHADROP_CASES?.[caseId];

    if (!config || !config.rewards?.length) {
      console.error("SHADROP: кейс не найден:", caseId);
      return;
    }

    spinToken++;
    spinning = false;

    activeCase = config;
    multiplier = 1;
    demoMode = false;

    const root = container();
    if (!root) return;

    const page = root.querySelector(".shadrop-case-page");

    if (!page) return;

    page.style.setProperty(
      "--case-accent",
      config.color || "#a46aff"
    );

    closeModal();
    setSpinning(false);

    updateMultiplierButtons();
    updateDemoButton();
    updatePrice();

    renderRoulettes();
    renderRewards();
    bindEvents();
  };

  /* ===== АДАПТАЦИЯ ПРИ ИЗМЕНЕНИИ ШИРИНЫ ===== */

  window.addEventListener("resize", () => {
    if (!activeCase || spinning) return;

    const root = container();

    if (!root || root.hidden) return;

    updateRouletteSizes();

    root.querySelectorAll(".shadrop-roulette__track")
      .forEach(track => {
        setPreviewPosition(track);
      });
  });

})();
