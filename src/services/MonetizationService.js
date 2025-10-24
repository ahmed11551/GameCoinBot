// Модуль монетизации и Telegram Stars
const telegramStars = {
  // Курсы обмена
  exchangeRates: {
    starsToGems: 0.1, // 1 звезда = 0.1 драгоценного камня
    gemsToCoins: 10,  // 1 драгоценный камень = 10 монет
    starsToCoins: 1   // 1 звезда = 1 монета
  },

  // Пакеты драгоценных камней
  gemPackages: [
    {
      id: 'gems_small',
      name: 'Малый пакет',
      gems: 10,
      stars: 100,
      bonus: 0,
      description: '10 драгоценных камней'
    },
    {
      id: 'gems_medium',
      name: 'Средний пакет',
      gems: 50,
      stars: 450,
      bonus: 5,
      description: '50 драгоценных камней + 5 бонус'
    },
    {
      id: 'gems_large',
      name: 'Большой пакет',
      gems: 100,
      stars: 800,
      bonus: 15,
      description: '100 драгоценных камней + 15 бонус'
    },
    {
      id: 'gems_mega',
      name: 'Мега пакет',
      gems: 250,
      stars: 1800,
      bonus: 50,
      description: '250 драгоценных камней + 50 бонус'
    }
  ],

  // Пакеты монет
  coinPackages: [
    {
      id: 'coins_small',
      name: 'Малый пакет монет',
      coins: 1000,
      gems: 10,
      bonus: 100,
      description: '1000 монет + 100 бонус'
    },
    {
      id: 'coins_medium',
      name: 'Средний пакет монет',
      coins: 5000,
      gems: 45,
      bonus: 500,
      description: '5000 монет + 500 бонус'
    },
    {
      id: 'coins_large',
      name: 'Большой пакет монет',
      coins: 10000,
      gems: 80,
      bonus: 1000,
      description: '10000 монет + 1000 бонус'
    },
    {
      id: 'coins_mega',
      name: 'Мега пакет монет',
      coins: 25000,
      gems: 180,
      bonus: 2500,
      description: '25000 монет + 2500 бонус'
    }
  ],

  // Премиум подписки
  premiumSubscriptions: [
    {
      id: 'premium_week',
      name: 'Премиум на неделю',
      duration: 7, // дней
      gems: 100,
      benefits: [
        '+50% к доходу от всех игр',
        'Эксклюзивные достижения',
        'Приоритетная поддержка',
        'Ежедневный бонус драгоценных камней',
        'Доступ к VIP турнирам'
      ]
    },
    {
      id: 'premium_month',
      name: 'Премиум на месяц',
      duration: 30, // дней
      gems: 350,
      benefits: [
        '+50% к доходу от всех игр',
        'Эксклюзивные достижения',
        'Приоритетная поддержка',
        'Ежедневный бонус драгоценных камней',
        'Доступ к VIP турнирам',
        'Специальные еженедельные награды'
      ]
    }
  ],

  // Бонусы
  bonuses: [
    {
      id: 'double_income',
      name: 'Двойной доход',
      duration: 3600, // 1 час в секундах
      gems: 50,
      effect: 'doubleIncome',
      description: 'x2 к доходу от всех игр на 1 час'
    },
    {
      id: 'lucky_casino',
      name: 'Удача в казино',
      duration: 3600, // 1 час в секундах
      gems: 30,
      effect: 'casinoLuck',
      description: '+50% к шансу выигрыша в казино на 1 час'
    },
    {
      id: 'extra_experience',
      name: 'Экстра опыт',
      duration: 3600, // 1 час в секундах
      gems: 25,
      effect: 'extraExp',
      description: '+100% к получаемому опыту на 1 час'
    }
  ]
};

// Активные бонусы пользователей
const activeBonuses = new Map();

// Премиум подписки пользователей
const premiumSubscriptions = new Map();

// История покупок
const purchaseHistory = new Map();

// Получение активных бонусов пользователя
function getUserBonuses(userId) {
  if (!activeBonuses.has(userId)) {
    activeBonuses.set(userId, []);
  }
  return activeBonuses.get(userId);
}

// Получение премиум статуса пользователя
function getUserPremium(userId) {
  return premiumSubscriptions.get(userId) || null;
}

// Проверка активного бонуса
function hasActiveBonus(userId, bonusType) {
  const bonuses = getUserBonuses(userId);
  const now = Date.now();
  
  return bonuses.some(bonus => 
    bonus.type === bonusType && 
    bonus.expiresAt > now
  );
}

// Активация бонуса
function activateBonus(userId, bonusId) {
  const bonus = telegramStars.bonuses.find(b => b.id === bonusId);
  if (!bonus) return false;

  const bonuses = getUserBonuses(userId);
  const now = Date.now();
  
  // Удаляем истекшие бонусы
  const activeBonusesList = bonuses.filter(b => b.expiresAt > now);
  
  // Добавляем новый бонус
  activeBonusesList.push({
    id: bonusId,
    type: bonus.effect,
    expiresAt: now + (bonus.duration * 1000),
    activatedAt: now
  });
  
  activeBonuses.set(userId, activeBonusesList);
  return true;
}

// Активация премиум подписки
function activatePremium(userId, subscriptionId) {
  const subscription = telegramStars.premiumSubscriptions.find(s => s.id === subscriptionId);
  if (!subscription) return false;

  const now = Date.now();
  const expiresAt = now + (subscription.duration * 24 * 60 * 60 * 1000); // в миллисекундах

  premiumSubscriptions.set(userId, {
    id: subscriptionId,
    activatedAt: now,
    expiresAt: expiresAt,
    benefits: subscription.benefits
  });

  return true;
}

// Проверка премиум статуса
function isPremiumActive(userId) {
  const premium = getUserPremium(userId);
  if (!premium) return false;
  
  return premium.expiresAt > Date.now();
}

// Получение множителя дохода
function getIncomeMultiplier(userId) {
  let multiplier = 1;
  
  // Премиум подписка
  if (isPremiumActive(userId)) {
    multiplier += 0.5; // +50%
  }
  
  // Бонус двойного дохода
  if (hasActiveBonus(userId, 'doubleIncome')) {
    multiplier += 1; // +100% (итого x2)
  }
  
  return multiplier;
}

// Получение множителя опыта
function getExperienceMultiplier(userId) {
  let multiplier = 1;
  
  // Бонус экстра опыта
  if (hasActiveBonus(userId, 'extraExp')) {
    multiplier += 1; // +100%
  }
  
  return multiplier;
}

// Получение множителя удачи в казино
function getCasinoLuckMultiplier(userId) {
  let multiplier = 1;
  
  // Бонус удачи в казино
  if (hasActiveBonus(userId, 'casinoLuck')) {
    multiplier += 0.5; // +50%
  }
  
  return multiplier;
}

// Покупка драгоценных камней за Telegram Stars
function purchaseGems(userId, packageId, starsAmount) {
  const gemPackage = telegramStars.gemPackages.find(p => p.id === packageId);
  if (!gemPackage) return { success: false, error: 'Неверный пакет' };

  if (starsAmount < gemPackage.stars) {
    return { success: false, error: 'Недостаточно звезд' };
  }

  // Здесь должна быть интеграция с Telegram Stars API
  // Пока что симулируем успешную покупку
  
  const totalGems = gemPackage.gems + gemPackage.bonus;
  
  // Записываем покупку в историю
  if (!purchaseHistory.has(userId)) {
    purchaseHistory.set(userId, []);
  }
  
  purchaseHistory.get(userId).push({
    type: 'gems',
    packageId: packageId,
    amount: totalGems,
    cost: gemPackage.stars,
    timestamp: Date.now()
  });

  return {
    success: true,
    gems: totalGems,
    stars: gemPackage.stars,
    package: gemPackage
  };
}

// Покупка монет за драгоценные камни
function purchaseCoins(userId, packageId, gemsAmount) {
  const coinPackage = telegramStars.coinPackages.find(p => p.id === packageId);
  if (!coinPackage) return { success: false, error: 'Неверный пакет' };

  if (gemsAmount < coinPackage.gems) {
    return { success: false, error: 'Недостаточно драгоценных камней' };
  }

  const totalCoins = coinPackage.coins + coinPackage.bonus;
  
  // Записываем покупку в историю
  if (!purchaseHistory.has(userId)) {
    purchaseHistory.set(userId, []);
  }
  
  purchaseHistory.get(userId).push({
    type: 'coins',
    packageId: packageId,
    amount: totalCoins,
    cost: coinPackage.gems,
    timestamp: Date.now()
  });

  return {
    success: true,
    coins: totalCoins,
    gems: coinPackage.gems,
    package: coinPackage
  };
}

// Покупка бонуса
function purchaseBonus(userId, bonusId, gemsAmount) {
  const bonus = telegramStars.bonuses.find(b => b.id === bonusId);
  if (!bonus) return { success: false, error: 'Неверный бонус' };

  if (gemsAmount < bonus.gems) {
    return { success: false, error: 'Недостаточно драгоценных камней' };
  }

  const success = activateBonus(userId, bonusId);
  if (!success) {
    return { success: false, error: 'Ошибка активации бонуса' };
  }

  // Записываем покупку в историю
  if (!purchaseHistory.has(userId)) {
    purchaseHistory.set(userId, []);
  }
  
  purchaseHistory.get(userId).push({
    type: 'bonus',
    packageId: bonusId,
    amount: 1,
    cost: bonus.gems,
    timestamp: Date.now()
  });

  return {
    success: true,
    bonus: bonus,
    gems: bonus.gems
  };
}

// Покупка премиум подписки
function purchasePremium(userId, subscriptionId, gemsAmount) {
  const subscription = telegramStars.premiumSubscriptions.find(s => s.id === subscriptionId);
  if (!subscription) return { success: false, error: 'Неверная подписка' };

  if (gemsAmount < subscription.gems) {
    return { success: false, error: 'Недостаточно драгоценных камней' };
  }

  const success = activatePremium(userId, subscriptionId);
  if (!success) {
    return { success: false, error: 'Ошибка активации подписки' };
  }

  // Записываем покупку в историю
  if (!purchaseHistory.has(userId)) {
    purchaseHistory.set(userId, []);
  }
  
  purchaseHistory.get(userId).push({
    type: 'premium',
    packageId: subscriptionId,
    amount: subscription.duration,
    cost: subscription.gems,
    timestamp: Date.now()
  });

  return {
    success: true,
    subscription: subscription,
    gems: subscription.gems
  };
}

// Получение истории покупок
function getPurchaseHistory(userId) {
  return purchaseHistory.get(userId) || [];
}

// Очистка истекших бонусов
function cleanupExpiredBonuses() {
  const now = Date.now();
  
  for (const [userId, bonuses] of activeBonuses) {
    const activeBonusesList = bonuses.filter(bonus => bonus.expiresAt > now);
    activeBonuses.set(userId, activeBonusesList);
  }
}

// Получение статистики монетизации
function getMonetizationStats() {
  const stats = {
    totalPurchases: 0,
    totalGemsSold: 0,
    totalCoinsSold: 0,
    totalBonusesSold: 0,
    totalPremiumSold: 0,
    revenue: 0
  };

  for (const purchases of purchaseHistory.values()) {
    for (const purchase of purchases) {
      stats.totalPurchases++;
      
      switch (purchase.type) {
        case 'gems':
          stats.totalGemsSold += purchase.amount;
          stats.revenue += purchase.cost;
          break;
        case 'coins':
          stats.totalCoinsSold += purchase.amount;
          break;
        case 'bonus':
          stats.totalBonusesSold += purchase.amount;
          break;
        case 'premium':
          stats.totalPremiumSold += purchase.amount;
          break;
      }
    }
  }

  return stats;
}

// Запуск очистки каждые 5 минут
setInterval(cleanupExpiredBonuses, 5 * 60 * 1000);

module.exports = {
  telegramStars,
  purchaseGems,
  purchaseCoins,
  purchaseBonus,
  purchasePremium,
  getUserBonuses,
  getUserPremium,
  isPremiumActive,
  hasActiveBonus,
  getIncomeMultiplier,
  getExperienceMultiplier,
  getCasinoLuckMultiplier,
  getPurchaseHistory,
  getMonetizationStats
};
