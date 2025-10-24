// Система квестов и ежедневных заданий
const questTypes = {
  quiz_play: {
    name: 'Игрок викторин',
    description: 'Сыграйте викторины',
    icon: '🎯',
    unit: 'игр'
  },
  quiz_correct: {
    name: 'Знаток',
    description: 'Правильно ответьте на вопросы',
    icon: '✅',
    unit: 'ответов'
  },
  casino_play: {
    name: 'Азартный игрок',
    description: 'Сыграйте в казино',
    icon: '🎰',
    unit: 'игр'
  },
  casino_win: {
    name: 'Победитель',
    description: 'Выиграйте в казино',
    icon: '🏆',
    unit: 'побед'
  },
  clicker_clicks: {
    name: 'Кликер',
    description: 'Сделайте клики',
    icon: '👆',
    unit: 'кликов'
  },
  coins_earn: {
    name: 'Заработок',
    description: 'Заработайте монеты',
    icon: '💰',
    unit: 'монет'
  },
  daily_bonus: {
    name: 'Ежедневный бонус',
    description: 'Получите ежедневный бонус',
    icon: '🎁',
    unit: 'раз'
  }
};

// Ежедневные квесты
const dailyQuests = [
  {
    id: 'daily_quiz_3',
    name: 'Ежедневная викторина',
    description: 'Сыграйте 3 викторины',
    type: 'quiz_play',
    target: 3,
    reward: { coins: 100, gems: 5, experience: 20 },
    difficulty: 'easy'
  },
  {
    id: 'daily_quiz_correct_10',
    name: 'Знаток дня',
    description: 'Правильно ответьте на 10 вопросов',
    type: 'quiz_correct',
    target: 10,
    reward: { coins: 150, gems: 10, experience: 30 },
    difficulty: 'medium'
  },
  {
    id: 'daily_casino_2',
    name: 'Казино-эксперт',
    description: 'Сыграйте 2 игры в казино',
    type: 'casino_play',
    target: 2,
    reward: { coins: 80, gems: 5, experience: 15 },
    difficulty: 'easy'
  },
  {
    id: 'daily_casino_win_1',
    name: 'Победитель дня',
    description: 'Выиграйте 1 игру в казино',
    type: 'casino_win',
    target: 1,
    reward: { coins: 200, gems: 15, experience: 40 },
    difficulty: 'medium'
  },
  {
    id: 'daily_clicker_50',
    name: 'Кликер-марафон',
    description: 'Сделайте 50 кликов',
    type: 'clicker_clicks',
    target: 50,
    reward: { coins: 75, gems: 3, experience: 15 },
    difficulty: 'easy'
  },
  {
    id: 'daily_coins_500',
    name: 'Заработок дня',
    description: 'Заработайте 500 монет',
    type: 'coins_earn',
    target: 500,
    reward: { coins: 100, gems: 5, experience: 20 },
    difficulty: 'medium'
  },
  {
    id: 'daily_bonus_1',
    name: 'Ежедневный бонус',
    description: 'Получите ежедневный бонус',
    type: 'daily_bonus',
    target: 1,
    reward: { coins: 50, gems: 2, experience: 10 },
    difficulty: 'easy'
  }
];

// Еженедельные квесты
const weeklyQuests = [
  {
    id: 'weekly_quiz_20',
    name: 'Неделя викторин',
    description: 'Сыграйте 20 викторин за неделю',
    type: 'quiz_play',
    target: 20,
    reward: { coins: 1000, gems: 50, experience: 200 },
    difficulty: 'hard'
  },
  {
    id: 'weekly_casino_10',
    name: 'Неделя казино',
    description: 'Сыграйте 10 игр в казино за неделю',
    type: 'casino_play',
    target: 10,
    reward: { coins: 800, gems: 40, experience: 150 },
    difficulty: 'medium'
  },
  {
    id: 'weekly_clicker_1000',
    name: 'Неделя кликов',
    description: 'Сделайте 1000 кликов за неделю',
    type: 'clicker_clicks',
    target: 1000,
    reward: { coins: 600, gems: 30, experience: 120 },
    difficulty: 'medium'
  },
  {
    id: 'weekly_coins_5000',
    name: 'Неделя заработка',
    description: 'Заработайте 5000 монет за неделю',
    type: 'coins_earn',
    target: 5000,
    reward: { coins: 1200, gems: 60, experience: 250 },
    difficulty: 'hard'
  }
];

// Прогресс квестов пользователей
const questProgress = new Map();

// Получение или создание прогресса пользователя
function getOrCreateProgress(userId) {
  if (!questProgress.has(userId)) {
    questProgress.set(userId, {
      daily: {},
      weekly: {},
      lastDailyReset: new Date().toDateString(),
      lastWeeklyReset: getWeekStart(new Date()).toDateString()
    });
  }
  return questProgress.get(userId);
}

// Получение начала недели
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Понедельник
  return new Date(d.setDate(diff));
}

// Сброс ежедневных квестов
function resetDailyQuests(userId) {
  const progress = getOrCreateProgress(userId);
  const today = new Date().toDateString();
  
  if (progress.lastDailyReset !== today) {
    progress.daily = {};
    progress.lastDailyReset = today;
  }
}

// Сброс еженедельных квестов
function resetWeeklyQuests(userId) {
  const progress = getOrCreateProgress(userId);
  const weekStart = getWeekStart(new Date()).toDateString();
  
  if (progress.lastWeeklyReset !== weekStart) {
    progress.weekly = {};
    progress.lastWeeklyReset = weekStart;
  }
}

// Обновление прогресса квеста
function updateQuestProgress(userId, questType, amount = 1) {
  const progress = getOrCreateProgress(userId);
  
  // Сбрасываем квесты если нужно
  resetDailyQuests(userId);
  resetWeeklyQuests(userId);
  
  // Обновляем ежедневные квесты
  for (const quest of dailyQuests) {
    if (quest.type === questType) {
      if (!progress.daily[quest.id]) {
        progress.daily[quest.id] = 0;
      }
      progress.daily[quest.id] += amount;
    }
  }
  
  // Обновляем еженедельные квесты
  for (const quest of weeklyQuests) {
    if (quest.type === questType) {
      if (!progress.weekly[quest.id]) {
        progress.weekly[quest.id] = 0;
      }
      progress.weekly[quest.id] += amount;
    }
  }
}

// Получение активных квестов пользователя
function getActiveQuests(userId) {
  const progress = getOrCreateProgress(userId);
  
  // Сбрасываем квесты если нужно
  resetDailyQuests(userId);
  resetWeeklyQuests(userId);
  
  const activeQuests = [];
  
  // Ежедневные квесты
  for (const quest of dailyQuests) {
    const currentProgress = progress.daily[quest.id] || 0;
    const isCompleted = currentProgress >= quest.target;
    
    activeQuests.push({
      ...quest,
      currentProgress,
      isCompleted,
      progress: Math.min((currentProgress / quest.target) * 100, 100)
    });
  }
  
  // Еженедельные квесты
  for (const quest of weeklyQuests) {
    const currentProgress = progress.weekly[quest.id] || 0;
    const isCompleted = currentProgress >= quest.target;
    
    activeQuests.push({
      ...quest,
      currentProgress,
      isCompleted,
      progress: Math.min((currentProgress / quest.target) * 100, 100),
      isWeekly: true
    });
  }
  
  return activeQuests;
}

// Завершение квеста
function completeQuest(userId, questId) {
  const progress = getOrCreateProgress(userId);
  const quest = [...dailyQuests, ...weeklyQuests].find(q => q.id === questId);
  
  if (!quest) return null;
  
  const questProgress = quest.isWeekly ? progress.weekly[questId] : progress.daily[questId];
  
  if (!questProgress || questProgress < quest.target) {
    return { error: 'Квест не завершен' };
  }
  
  // Отмечаем квест как завершенный
  if (quest.isWeekly) {
    progress.weekly[questId] = -1; // -1 означает завершенный
  } else {
    progress.daily[questId] = -1;
  }
  
  return quest.reward;
}

// Получение статистики квестов
function getQuestStats(userId) {
  const progress = getOrCreateProgress(userId);
  const activeQuests = getActiveQuests(userId);
  
  const dailyCompleted = activeQuests.filter(q => !q.isWeekly && q.isCompleted).length;
  const weeklyCompleted = activeQuests.filter(q => q.isWeekly && q.isCompleted).length;
  const totalDaily = dailyQuests.length;
  const totalWeekly = weeklyQuests.length;
  
  return {
    daily: {
      completed: dailyCompleted,
      total: totalDaily,
      percentage: Math.round((dailyCompleted / totalDaily) * 100)
    },
    weekly: {
      completed: weeklyCompleted,
      total: totalWeekly,
      percentage: Math.round((weeklyCompleted / totalWeekly) * 100)
    },
    activeQuests: activeQuests.filter(q => !q.isCompleted)
  };
}

// Получение квестов по типу
function getQuestsByType(questType) {
  return [...dailyQuests, ...weeklyQuests].filter(quest => quest.type === questType);
}

// Получение квестов по сложности
function getQuestsByDifficulty(difficulty) {
  return [...dailyQuests, ...weeklyQuests].filter(quest => quest.difficulty === difficulty);
}

// Сброс прогресса пользователя (для тестирования)
function resetUserProgress(userId) {
  questProgress.delete(userId);
}

// Получение всех квестов
function getAllQuests() {
  return {
    daily: dailyQuests,
    weekly: weeklyQuests,
    types: questTypes
  };
}

module.exports = {
  questTypes,
  dailyQuests,
  weeklyQuests,
  updateQuestProgress,
  getActiveQuests,
  completeQuest,
  getQuestStats,
  getQuestsByType,
  getQuestsByDifficulty,
  resetUserProgress,
  getAllQuests
};
