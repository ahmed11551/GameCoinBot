// Система достижений
const achievements = {
  // Достижения викторин
  quiz_first: {
    id: 'quiz_first',
    name: 'Первый шаг',
    description: 'Сыграйте первую викторину',
    icon: '🎯',
    category: 'quiz',
    condition: { type: 'quiz_played', value: 1 },
    reward: { coins: 50, gems: 0, experience: 10 },
    rarity: 'common'
  },
  quiz_expert: {
    id: 'quiz_expert',
    name: 'Знаток',
    description: 'Правильно ответьте на 100 вопросов',
    icon: '🧠',
    category: 'quiz',
    condition: { type: 'quiz_correct', value: 100 },
    reward: { coins: 500, gems: 25, experience: 100 },
    rarity: 'rare'
  },
  quiz_master: {
    id: 'quiz_master',
    name: 'Мастер викторин',
    description: 'Сыграйте 50 викторин',
    icon: '🏆',
    category: 'quiz',
    condition: { type: 'quiz_played', value: 50 },
    reward: { coins: 1000, gems: 50, experience: 200 },
    rarity: 'epic'
  },
  quiz_perfect: {
    id: 'quiz_perfect',
    name: 'Идеальный результат',
    description: 'Получите 100% в викторине',
    icon: '💯',
    category: 'quiz',
    condition: { type: 'quiz_perfect', value: 1 },
    reward: { coins: 200, gems: 10, experience: 50 },
    rarity: 'rare'
  },

  // Достижения казино
  casino_first: {
    id: 'casino_first',
    name: 'Азартный игрок',
    description: 'Сыграйте первую игру в казино',
    icon: '🎰',
    category: 'casino',
    condition: { type: 'casino_played', value: 1 },
    reward: { coins: 100, gems: 5, experience: 20 },
    rarity: 'common'
  },
  casino_lucky: {
    id: 'casino_lucky',
    name: 'Счастливчик',
    description: 'Выиграйте 10 игр в казино',
    icon: '🍀',
    category: 'casino',
    condition: { type: 'casino_won', value: 10 },
    reward: { coins: 500, gems: 25, experience: 100 },
    rarity: 'rare'
  },
  casino_high_roller: {
    id: 'casino_high_roller',
    name: 'Высокий игрок',
    description: 'Сделайте ставку на 1000 монет',
    icon: '💎',
    category: 'casino',
    condition: { type: 'casino_max_bet', value: 1 },
    reward: { coins: 300, gems: 15, experience: 75 },
    rarity: 'rare'
  },

  // Достижения кликер игры
  clicker_first: {
    id: 'clicker_first',
    name: 'Кликер',
    description: 'Сделайте 100 кликов',
    icon: '👆',
    category: 'clicker',
    condition: { type: 'clicker_clicks', value: 100 },
    reward: { coins: 100, gems: 5, experience: 20 },
    rarity: 'common'
  },
  clicker_pro: {
    id: 'clicker_pro',
    name: 'Профессиональный кликер',
    description: 'Сделайте 10000 кликов',
    icon: '⚡',
    category: 'clicker',
    condition: { type: 'clicker_clicks', value: 10000 },
    reward: { coins: 1000, gems: 50, experience: 200 },
    rarity: 'epic'
  },
  clicker_upgrader: {
    id: 'clicker_upgrader',
    name: 'Улучшатель',
    description: 'Купите 10 улучшений',
    icon: '🔧',
    category: 'clicker',
    condition: { type: 'clicker_upgrades', value: 10 },
    reward: { coins: 500, gems: 25, experience: 100 },
    rarity: 'rare'
  },

  // Достижения валюты
  coin_collector: {
    id: 'coin_collector',
    name: 'Коллекционер монет',
    description: 'Накопите 10000 монет',
    icon: '💰',
    category: 'currency',
    condition: { type: 'coins_earned', value: 10000 },
    reward: { coins: 500, gems: 25, experience: 100 },
    rarity: 'rare'
  },
  gem_hunter: {
    id: 'gem_hunter',
    name: 'Охотник за драгоценностями',
    description: 'Накопите 100 драгоценных камней',
    icon: '💎',
    category: 'currency',
    condition: { type: 'gems_earned', value: 100 },
    reward: { coins: 200, gems: 10, experience: 50 },
    rarity: 'rare'
  },

  // Достижения уровня
  level_up: {
    id: 'level_up',
    name: 'Повышение уровня',
    description: 'Достигните 10 уровня',
    icon: '⭐',
    category: 'level',
    condition: { type: 'level_reached', value: 10 },
    reward: { coins: 1000, gems: 50, experience: 0 },
    rarity: 'epic'
  },
  level_master: {
    id: 'level_master',
    name: 'Мастер уровней',
    description: 'Достигните 25 уровня',
    icon: '🌟',
    category: 'level',
    condition: { type: 'level_reached', value: 25 },
    reward: { coins: 2500, gems: 100, experience: 0 },
    rarity: 'legendary'
  },

  // Достижения активности
  daily_player: {
    id: 'daily_player',
    name: 'Ежедневный игрок',
    description: 'Получите ежедневный бонус 7 дней подряд',
    icon: '📅',
    category: 'activity',
    condition: { type: 'daily_bonus_streak', value: 7 },
    reward: { coins: 500, gems: 25, experience: 100 },
    rarity: 'rare'
  },
  marathon_player: {
    id: 'marathon_player',
    name: 'Марафонец',
    description: 'Играйте 30 дней подряд',
    icon: '🏃',
    category: 'activity',
    condition: { type: 'daily_bonus_streak', value: 30 },
    reward: { coins: 2000, gems: 100, experience: 500 },
    rarity: 'legendary'
  }
};

// Полученные достижения пользователей
const userAchievements = new Map();

// Получение достижений пользователя
function getUserAchievements(userId) {
  if (!userAchievements.has(userId)) {
    userAchievements.set(userId, new Set());
  }
  return userAchievements.get(userId);
}

// Проверка и выдача достижений
function checkAchievements(userId, stats) {
  const userAchievementsSet = getUserAchievements(userId);
  const newAchievements = [];

  for (const [achievementId, achievement] of Object.entries(achievements)) {
    // Пропускаем уже полученные достижения
    if (userAchievementsSet.has(achievementId)) {
      continue;
    }

    // Проверяем условие достижения
    if (checkAchievementCondition(achievement.condition, stats)) {
      // Выдаем достижение
      userAchievementsSet.add(achievementId);
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

// Проверка условия достижения
function checkAchievementCondition(condition, stats) {
  const { type, value } = condition;

  switch (type) {
    case 'quiz_played':
      return (stats.quizPlayed || 0) >= value;
    case 'quiz_correct':
      return (stats.quizCorrect || 0) >= value;
    case 'quiz_perfect':
      return (stats.quizPerfect || 0) >= value;
    case 'casino_played':
      return (stats.casinoPlayed || 0) >= value;
    case 'casino_won':
      return (stats.casinoWon || 0) >= value;
    case 'casino_max_bet':
      return (stats.casinoMaxBet || 0) >= value;
    case 'clicker_clicks':
      return (stats.clickerClicks || 0) >= value;
    case 'clicker_upgrades':
      return (stats.clickerUpgrades || 0) >= value;
    case 'coins_earned':
      return (stats.coinsEarned || 0) >= value;
    case 'gems_earned':
      return (stats.gemsEarned || 0) >= value;
    case 'level_reached':
      return (stats.level || 0) >= value;
    case 'daily_bonus_streak':
      return (stats.dailyBonusStreak || 0) >= value;
    default:
      return false;
  }
}

// Получение всех достижений пользователя
function getAllUserAchievements(userId) {
  const userAchievementsSet = getUserAchievements(userId);
  const result = [];

  for (const achievementId of userAchievementsSet) {
    const achievement = achievements[achievementId];
    if (achievement) {
      result.push(achievement);
    }
  }

  return result.sort((a, b) => {
    const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
    return rarityOrder[b.rarity] - rarityOrder[a.rarity];
  });
}

// Получение достижений по категории
function getAchievementsByCategory(category) {
  return Object.values(achievements).filter(achievement => achievement.category === category);
}

// Получение достижений по редкости
function getAchievementsByRarity(rarity) {
  return Object.values(achievements).filter(achievement => achievement.rarity === rarity);
}

// Получение прогресса достижения
function getAchievementProgress(userId, achievementId) {
  const achievement = achievements[achievementId];
  if (!achievement) return null;

  const userAchievementsSet = getUserAchievements(userId);
  const isCompleted = userAchievementsSet.has(achievementId);

  return {
    achievement,
    isCompleted,
    progress: isCompleted ? 100 : 0 // В реальной версии нужно вычислять прогресс
  };
}

// Получение статистики достижений
function getAchievementStats(userId) {
  const userAchievementsSet = getUserAchievements(userId);
  const totalAchievements = Object.keys(achievements).length;
  const completedAchievements = userAchievementsSet.size;
  
  const statsByCategory = {};
  const statsByRarity = {};

  for (const achievementId of userAchievementsSet) {
    const achievement = achievements[achievementId];
    if (achievement) {
      // По категориям
      statsByCategory[achievement.category] = (statsByCategory[achievement.category] || 0) + 1;
      // По редкости
      statsByRarity[achievement.rarity] = (statsByRarity[achievement.rarity] || 0) + 1;
    }
  }

  return {
    total: totalAchievements,
    completed: completedAchievements,
    percentage: Math.round((completedAchievements / totalAchievements) * 100),
    byCategory: statsByCategory,
    byRarity: statsByRarity
  };
}

// Сброс достижений пользователя (для тестирования)
function resetUserAchievements(userId) {
  userAchievements.delete(userId);
}

// Получение всех достижений
function getAllAchievements() {
  return Object.values(achievements);
}

module.exports = {
  achievements,
  checkAchievements,
  getUserAchievements,
  getAllUserAchievements,
  getAchievementsByCategory,
  getAchievementsByRarity,
  getAchievementProgress,
  getAchievementStats,
  resetUserAchievements,
  getAllAchievements
};
