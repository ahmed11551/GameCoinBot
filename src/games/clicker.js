// Модуль кликер игры с улучшениями
const clickerUpgrades = {
  finger: {
    name: 'Усиленный палец',
    description: '+1 монета за клик',
    basePrice: 100,
    priceMultiplier: 1.5,
    effect: 'clickValue',
    effectValue: 1,
    maxLevel: 50
  },
  autoclicker: {
    name: 'Автокликер',
    description: '+1 монета в секунду',
    basePrice: 500,
    priceMultiplier: 2,
    effect: 'passiveIncome',
    effectValue: 1,
    maxLevel: 20
  },
  golden_hand: {
    name: 'Золотая рука',
    description: 'x2 к доходу от кликов',
    basePrice: 1000,
    priceMultiplier: 3,
    effect: 'clickMultiplier',
    effectValue: 2,
    maxLevel: 10
  },
  business: {
    name: 'Бизнес-центр',
    description: '+10 монет в секунду',
    basePrice: 5000,
    priceMultiplier: 4,
    effect: 'passiveIncome',
    effectValue: 10,
    maxLevel: 15
  }
};

// Активные сессии кликер игры
const clickerSessions = new Map();

// Создание или получение сессии пользователя
function getOrCreateSession(userId) {
  if (!clickerSessions.has(userId)) {
    clickerSessions.set(userId, {
      userId,
      clicks: 0,
      coinsEarned: 0,
      upgrades: {
        finger: 0,
        autoclicker: 0,
        golden_hand: 0,
        business: 0
      },
      lastClickTime: Date.now(),
      lastPassiveTime: Date.now(),
      totalClicks: 0,
      totalCoinsEarned: 0
    });
  }
  return clickerSessions.get(userId);
}

// Клик
function click(userId) {
  const session = getOrCreateSession(userId);
  const now = Date.now();
  
  // Вычисляем доход за клик
  const clickValue = calculateClickValue(session.upgrades);
  
  // Обновляем статистику
  session.clicks++;
  session.totalClicks++;
  session.coinsEarned += clickValue;
  session.totalCoinsEarned += clickValue;
  session.lastClickTime = now;

  return {
    clickValue,
    totalClicks: session.totalClicks,
    coinsEarned: session.coinsEarned,
    upgrades: session.upgrades
  };
}

// Вычисление дохода за клик
function calculateClickValue(upgrades) {
  let baseValue = 1;
  
  // Усиленный палец
  baseValue += upgrades.finger;
  
  // Золотая рука (множитель)
  const multiplier = Math.pow(clickerUpgrades.golden_hand.effectValue, upgrades.golden_hand);
  baseValue *= multiplier;
  
  return Math.floor(baseValue);
}

// Вычисление пассивного дохода
function calculatePassiveIncome(upgrades) {
  let passiveIncome = 0;
  
  // Автокликер
  passiveIncome += upgrades.autoclicker * clickerUpgrades.autoclicker.effectValue;
  
  // Бизнес-центр
  passiveIncome += upgrades.business * clickerUpgrades.business.effectValue;
  
  return passiveIncome;
}

// Получение пассивного дохода
function collectPassiveIncome(userId) {
  const session = getOrCreateSession(userId);
  const now = Date.now();
  const timeDiff = now - session.lastPassiveTime;
  
  const passiveIncome = calculatePassiveIncome(session.upgrades);
  const coinsEarned = Math.floor((passiveIncome * timeDiff) / 1000); // в секундах
  
  if (coinsEarned > 0) {
    session.coinsEarned += coinsEarned;
    session.totalCoinsEarned += coinsEarned;
    session.lastPassiveTime = now;
  }
  
  return coinsEarned;
}

// Покупка улучшения
function buyUpgrade(userId, upgradeType, userCoins) {
  const session = getOrCreateSession(userId);
  const upgrade = clickerUpgrades[upgradeType];
  
  if (!upgrade) {
    return { error: 'Неверный тип улучшения' };
  }
  
  const currentLevel = session.upgrades[upgradeType];
  if (currentLevel >= upgrade.maxLevel) {
    return { error: 'Максимальный уровень достигнут' };
  }
  
  const price = calculateUpgradePrice(upgradeType, currentLevel);
  
  if (userCoins < price) {
    return { error: 'Недостаточно монет' };
  }
  
  // Покупаем улучшение
  session.upgrades[upgradeType]++;
  
  return {
    success: true,
    newLevel: session.upgrades[upgradeType],
    price,
    upgrade: upgrade.name
  };
}

// Вычисление цены улучшения
function calculateUpgradePrice(upgradeType, currentLevel) {
  const upgrade = clickerUpgrades[upgradeType];
  return Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, currentLevel));
}

// Получение статистики
function getStats(userId) {
  const session = getOrCreateSession(userId);
  
  // Собираем пассивный доход
  const passiveIncome = collectPassiveIncome(userId);
  
  return {
    clicks: session.totalClicks,
    coinsEarned: session.coinsEarned,
    passiveIncome: calculatePassiveIncome(session.upgrades),
    upgrades: session.upgrades,
    clickValue: calculateClickValue(session.upgrades),
    lastPassiveIncome: passiveIncome
  };
}

// Получение информации об улучшениях
function getUpgradesInfo(userId) {
  const session = getOrCreateSession(userId);
  const upgradesInfo = {};
  
  for (const [upgradeType, upgrade] of Object.entries(clickerUpgrades)) {
    const currentLevel = session.upgrades[upgradeType];
    const price = calculateUpgradePrice(upgradeType, currentLevel);
    
    upgradesInfo[upgradeType] = {
      name: upgrade.name,
      description: upgrade.description,
      currentLevel,
      maxLevel: upgrade.maxLevel,
      price,
      canBuy: currentLevel < upgrade.maxLevel,
      effect: upgrade.effect,
      effectValue: upgrade.effectValue
    };
  }
  
  return upgradesInfo;
}

// Сброс сессии (для тестирования)
function resetSession(userId) {
  clickerSessions.delete(userId);
}

// Получение всех активных сессий (для админов)
function getAllSessions() {
  return Array.from(clickerSessions.values());
}

// Очистка неактивных сессий
function cleanupInactiveSessions() {
  const now = Date.now();
  const maxInactiveTime = 24 * 60 * 60 * 1000; // 24 часа
  
  for (const [userId, session] of clickerSessions) {
    if (now - session.lastClickTime > maxInactiveTime) {
      clickerSessions.delete(userId);
    }
  }
}

// Запуск очистки каждые 6 часов
setInterval(cleanupInactiveSessions, 6 * 60 * 60 * 1000);

// Автоматический сбор пассивного дохода каждую минуту
setInterval(() => {
  for (const [userId, session] of clickerSessions) {
    collectPassiveIncome(userId);
  }
}, 60 * 1000);

module.exports = {
  clickerUpgrades,
  click,
  collectPassiveIncome,
  buyUpgrade,
  getStats,
  getUpgradesInfo,
  calculateClickValue,
  calculatePassiveIncome,
  calculateUpgradePrice,
  resetSession,
  getAllSessions,
  cleanupInactiveSessions
};
