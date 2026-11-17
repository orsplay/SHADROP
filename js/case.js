
/* ===== SHADROP MULTI ROULETTE ===== */

(function () {
  "use strict";

  const ITEM_COUNT = 65;
  const WIN_INDEX = 55;
  const SPIN_DURATION = 5200;
  const GAP = 6;
  const STAR_ICON = "assets/icons/telegram-star.png";

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

  function formatStars(value) {
    return Number(value || 0).toLocaleString("ru-RU");
  }

  function randomReward() {
    const rewards = activeCase.rewards;
    return rewards[Math.floor(Math.random() * rewards.length)];
  }

  function createStarValue(value, className) {
    const element = document.createElement("div");
    element.className = className;

    const amount = document.createElement("span");
    amount.textContent = formatStars(value);

    const star = document.createElement("img");
    star.src = STAR_ICON;
    star.alt = "Stars";

    element.append(amount, star);
    return element;
  }

  /* ===== ROULETTE ITEM ===== */

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

  /* ===== POSSIBLE REWARD CARD ===== */

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

    const price = createStarValue(
      reward.value,
      "shadrop-reward-card__value"
    );

    card.append(img, name, price);
    return card;
  }

  /* ===== ROULETTE SIZES ===== */

  function updateRouletteSizes() {
    const root = container();
    if (!root) return;

    root.querySelectorAll(".shadrop-roulette")
      .forEach(roulette => {
        const viewport = roulette.querySelector(
          ".shadrop-roulette__viewport"
        );

        if (!viewport || !viewport.clientWidth) return;

        const itemSize = Math.floor(
          (viewport.clientWidth - GAP * 4) / 5
        );

        roulette.style.setProperty(
          "--roulette-item-size",
          `${itemSize}px`
        );
      });
  }

  /* ===== CREATE ROULETTE ===== */

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

  /* ===== FILL TRACK ===== */

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

  function setPreviewPosition(track) {
    const roulette = track.closest(".shadrop-roulette");
    const viewport = roulette?.querySelector(
      ".shadrop-roulette__viewport"
    );

    if (!viewport) return;

    track.style.transition = "none";
    track.style.transform =
      `translate3d(${getPosition(track, viewport, 4)}px,0,0)`;
  }

  /* ===== RENDER ROULETTES ===== */

  function renderRoulettes() {
    const root = container()?.querySelector("#caseRoulettes");

    if (!root || !activeCase) return;

    root.replaceChildren();
    root.dataset.count = multiplier;

    for (let i = 0; i < multiplier; i++) {
      root.appendChild(createRoulette(i));
    }

    updateRouletteSizes();

    root.querySelectorAll(".shadrop-roulette__track")
      .forEach(track => {
        fillTrack(track);
        setPreviewPosition(track);
      });
  }

  /* ===== MULTIPLIERS ===== */

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

  /* ===== DEMO MODE ===== */

  function updateDemoButton() {
    const button = container()?.querySelector("#caseDemoButton");

    if (!button) return;

    button.classList.toggle("is-active", demoMode);
    button.setAttribute("aria-pressed", String(demoMode));
  }

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

  /* ===== WIN MODAL ===== */

  function closeModal() {
    const overlay = container()?.querySelector("#caseWinOverlay");
    if (overlay) overlay.hidden = true;
  }

  function giftWord(count) {
    if (count === 1) return "подарок";
    if (count >= 2 && count <= 4) return "подарка";
    return "подарков";
  }

  function createWinCard(reward) {
    const card = document.createElement("div");
    card.className = "shadrop-win-multiple__item";
    card.style.setProperty("--reward-color", colorOf(reward));

    const img = document.createElement("img");
    img.src = reward.image;
    img.alt = reward.name;

    const name = document.createElement("span");
    name.className = "shadrop-win-multiple__name";
    name.textContent = reward.name;

    const value = createStarValue(
      reward.value,
      "shadrop-win-multiple__value"
    );

    card.append(img, name, value);
    return card;
  }

  function showResults(winners) {
    const root = container();
    const overlay = root?.querySelector("#caseWinOverlay");

    if (!overlay || !winners.length) return;

    const first = winners[0];
    const count = winners.length;

    const modal = overlay.querySelector(".shadrop-win-modal");
    const title = overlay.querySelector("#caseWinTitle");
    const description = overlay.querySelector("#caseWinDescription");
    const image = overlay.querySelector("#caseWinImage");
    const name = overlay.querySelector("#caseWinName");
    const rarity = overlay.querySelector("#caseWinRarity");
    const multiple = overlay.querySelector("#caseWinMultiple");

    if (modal) {
      modal.style.setProperty("--win-color", colorOf(first));
      modal.classList.toggle("is-multiple", count > 1);
    }

    // Заголовок без декоративной иконки.
    overlay.querySelectorAll(".shadrop-win-sparkle")
      .forEach(element => {
        element.hidden = true;
      });

    if (title) {
      title.textContent = count === 1
        ? "Ваш подарок"
        : `Выпало ${count} ${giftWord(count)}`;
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
      multiple.hidden = count === 1;

      if (count > 1) {
        winners.forEach(reward => {
          multiple.appendChild(createWinCard(reward));
        });
      }
    }

    // Общая стоимость нескольких подарков.
    let total = overlay.querySelector("#caseWinTotal");

    if (!total && modal) {
      total = document.createElement("div");
      total.id = "caseWinTotal";
      total.className = "shadrop-win-total";

      const continueButton = modal.querySelector(
        "#caseWinContinue"
      );

      if (continueButton) {
        continueButton.before(total);
      } else {
        modal.appendChild(total);
      }
    }

    if (total) {
      total.replaceChildren();
      total.hidden = count === 1;

      if (count > 1) {
        const label = document.createElement("span");
        label.textContent = "Общая стоимость: ";

        const value = createStarValue(
          winners.reduce(
            (sum, reward) => sum + Number(reward.value || 0),
            0
          ),
          "shadrop-win-total__value"
        );

        total.append(label, value);
      }
    }

    // При нескольких подарках скрываем большой первый.
    const imageWrap = overlay.querySelector(
      ".shadrop-win-image-wrap"
    );

    if (imageWrap) imageWrap.hidden = count > 1;
    if (name) name.hidden = count > 1;
    if (rarity) rarity.hidden = count > 1;

    overlay.hidden = false;
  }

  /* ===== SPIN ===== */

  async function spinRoulettes() {
    if (spinning || !activeCase) return;

    const root = container();
    if (!root) return;

    const roulettes = [
      ...root.querySelectorAll(".shadrop-roulette")
    ];

    if (!roulettes.length) return;

    closeModal();
    setSpinning(true);

    const token = ++spinToken;
    const winners = [];

    roulettes.forEach(roulette => {
      const winner = randomReward();
      winners.push(winner);

      const track = roulette.querySelector(
        ".shadrop-roulette__track"
      );

      fillTrack(track, winner);
      setPreviewPosition(track);
    });

    void root.offsetWidth;

    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    if (token !== spinToken) return;

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

  /* ===== POSSIBLE REWARDS ===== */

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

  /* ===== EVENTS ===== */

  function bindEvents() {
    const root = container();

    if (!root || root.dataset.caseEventsBound === "true") {
      return;
    }

    root.dataset.caseEventsBound = "true";

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

    root.querySelector("#caseDemoButton")
      ?.addEventListener("click", () => {
        if (spinning) return;

        demoMode = !demoMode;
        updateDemoButton();
        updatePrice();
      });

    root.querySelector("#caseOpenButton")
      ?.addEventListener("click", spinRoulettes);

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

  /* ===== CASE PAGE ===== */

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

  /* ===== RESPONSIVE ===== */

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
