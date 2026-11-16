/* ===== КОНФИГУРАЦИЯ КЕЙСОВ SHADROP ===== */

window.SHADROP_CASES = {
  anime: {
    id: 'anime',
    name: 'Аниме',
    description: 'Открой мир аниме-подарков',
    image: 'assets/icons/Cases/Anime.png',
    price: 99,
    color: '#a46aff',

    rewards: [
      {
        id: 'anime-1',
        name: 'Event Horizon',
        image: 'assets/icons/NFT/Evil_Eye/Event_Horizon.webp',
        rarity: 'legendary',
        value: 1500
      },
      {
        id: 'anime-2',
        name: 'Deputy',
        image: 'assets/icons/NFT/Liberty_Figure/Deputy.webp',
        rarity: 'epic',
        value: 700
      },
      {
        id: 'anime-3',
        name: 'Tamagotchi',
        image: 'assets/icons/NFT/Lollipop/Tamagotchi.webp',
        rarity: 'rare',
        value: 350
      },
      {
        id: 'anime-4',
        name: 'Raincoat',
        image: 'assets/icons/NFT/Resistance_Dog/Raincoat.webp',
        rarity: 'uncommon',
        value: 120
      },
      {
        id: 'anime-5',
        name: 'Deadpool',
        image: 'assets/icons/NFT/Toy Bear/Deadpool.webp',
        rarity: 'common',
        value: 50
      }
    ]
  },

  comics: {
    id: 'comics',
    name: 'Комиксы',
    description: 'Коллекция супергеройских подарков',
    image: 'assets/icons/Cases/Comics.png',
    price: 199,
    color: '#ff5252',

    rewards: [
      {
        id: 'comics-1',
        name: 'Deadpool',
        image: 'assets/icons/NFT/Toy Bear/Deadpool.webp',
        rarity: 'legendary',
        value: 1500
      },
      {
        id: 'comics-2',
        name: 'Event Horizon',
        image: 'assets/icons/NFT/Evil_Eye/Event_Horizon.webp',
        rarity: 'epic',
        value: 700
      },
      {
        id: 'comics-3',
        name: 'Deputy',
        image: 'assets/icons/NFT/Liberty_Figure/Deputy.webp',
        rarity: 'rare',
        value: 350
      },
      {
        id: 'comics-4',
        name: 'Tamagotchi',
        image: 'assets/icons/NFT/Lollipop/Tamagotchi.webp',
        rarity: 'uncommon',
        value: 120
      },
      {
        id: 'comics-5',
        name: 'Raincoat',
        image: 'assets/icons/NFT/Resistance_Dog/Raincoat.webp',
        rarity: 'common',
        value: 50
      }
    ]
  },

  girls: {
    id: 'girls',
    name: 'Девушки',
    description: 'Яркая коллекция NFT-подарков',
    image: 'assets/icons/Cases/Girls.png',
    price: 299,
    color: '#ff48b8',

    rewards: [
      {
        id: 'girls-1',
        name: 'Tamagotchi',
        image: 'assets/icons/NFT/Lollipop/Tamagotchi.webp',
        rarity: 'legendary',
        value: 1500
      },
      {
        id: 'girls-2',
        name: 'Deputy',
        image: 'assets/icons/NFT/Liberty_Figure/Deputy.webp',
        rarity: 'epic',
        value: 700
      },
      {
        id: 'girls-3',
        name: 'Raincoat',
        image: 'assets/icons/NFT/Resistance_Dog/Raincoat.webp',
        rarity: 'rare',
        value: 350
      },
      {
        id: 'girls-4',
        name: 'Event Horizon',
        image: 'assets/icons/NFT/Evil_Eye/Event_Horizon.webp',
        rarity: 'uncommon',
        value: 120
      },
      {
        id: 'girls-5',
        name: 'Deadpool',
        image: 'assets/icons/NFT/Toy Bear/Deadpool.webp',
        rarity: 'common',
        value: 50
      }
    ]
  },

  ice: {
    id: 'ice',
    name: 'Ледяной',
    description: 'Открой самые холодные подарки',
    image: 'assets/icons/Cases/Ice.png',
    price: 499,
    color: '#35c8ff',

    rewards: [
      {
        id: 'ice-1',
        name: 'Deputy',
        image: 'assets/icons/NFT/Liberty_Figure/Deputy.webp',
        rarity: 'legendary',
        value: 1500
      },
      {
        id: 'ice-2',
        name: 'Event Horizon',
        image: 'assets/icons/NFT/Evil_Eye/Event_Horizon.webp',
        rarity: 'epic',
        value: 700
      },
      {
        id: 'ice-3',
        name: 'Raincoat',
        image: 'assets/icons/NFT/Resistance_Dog/Raincoat.webp',
        rarity: 'rare',
        value: 350
      },
      {
        id: 'ice-4',
        name: 'Tamagotchi',
        image: 'assets/icons/NFT/Lollipop/Tamagotchi.webp',
        rarity: 'uncommon',
        value: 120
      },
      {
        id: 'ice-5',
        name: 'Deadpool',
        image: 'assets/icons/NFT/Toy Bear/Deadpool.webp',
        rarity: 'common',
        value: 50
      }
    ]
  }
};

window.SHADROP_RARITIES = {
  common: {
    name: 'Обычный',
    color: '#747b91'
  },
  uncommon: {
    name: 'Необычный',
    color: '#38cf83'
  },
  rare: {
    name: 'Редкий',
    color: '#398cff'
  },
  epic: {
    name: 'Эпический',
    color: '#bb52ff'
  },
  legendary: {
    name: 'Легендарный',
    color: '#ffb52b'
  }
};