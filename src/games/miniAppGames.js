// Модуль Mini App игр
const miniAppGames = {
  // Конфигурация Mini App
  config: {
    appUrl: process.env.MINI_APP_URL || 'https://coinmaster-miniapp.vercel.app',
    appName: 'CoinMaster Games',
    appDescription: 'Игровая платформа с внутренней валютой',
    appIcon: 'https://coinmaster-miniapp.vercel.app/icon.png',
    appScreenshot: 'https://coinmaster-miniapp.vercel.app/screenshot.png'
  },

  // Доступные игры
  games: [
    {
      id: 'snake',
      name: 'Змейка',
      description: 'Классическая игра змейка с наградами',
      icon: '🐍',
      difficulty: 'easy',
      rewards: {
        coins: { min: 10, max: 50 },
        gems: { min: 1, max: 5 },
        experience: { min: 5, max: 25 }
      },
      requirements: {
        level: 1,
        coins: 0
      }
    },
    {
      id: 'tetris',
      name: 'Тетрис',
      description: 'Собирайте линии и зарабатывайте монеты',
      icon: '🧩',
      difficulty: 'medium',
      rewards: {
        coins: { min: 20, max: 100 },
        gems: { min: 2, max: 10 },
        experience: { min: 10, max: 50 }
      },
      requirements: {
        level: 3,
        coins: 100
      }
    },
    {
      id: 'puzzle',
      name: 'Головоломка',
      description: 'Решайте головоломки и получайте награды',
      icon: '🧩',
      difficulty: 'medium',
      rewards: {
        coins: { min: 15, max: 75 },
        gems: { min: 1, max: 8 },
        experience: { min: 8, max: 40 }
      },
      requirements: {
        level: 2,
        coins: 50
      }
    },
    {
      id: 'memory',
      name: 'Память',
      description: 'Тренируйте память и зарабатывайте',
      icon: '🧠',
      difficulty: 'easy',
      rewards: {
        coins: { min: 5, max: 30 },
        gems: { min: 1, max: 3 },
        experience: { min: 3, max: 15 }
      },
      requirements: {
        level: 1,
        coins: 0
      }
    },
    {
      id: 'racing',
      name: 'Гонки',
      description: 'Гонки на выживание с призовыми',
      icon: '🏎️',
      difficulty: 'hard',
      rewards: {
        coins: { min: 50, max: 200 },
        gems: { min: 5, max: 20 },
        experience: { min: 25, max: 100 }
      },
      requirements: {
        level: 5,
        coins: 500
      }
    },
    {
      id: 'arcade',
      name: 'Аркада',
      description: 'Классические аркадные игры',
      icon: '🎮',
      difficulty: 'medium',
      rewards: {
        coins: { min: 25, max: 125 },
        gems: { min: 3, max: 12 },
        experience: { min: 12, max: 60 }
      },
      requirements: {
        level: 4,
        coins: 250
      }
    }
  ],

  // Турниры Mini App игр
  tournaments: [
    {
      id: 'snake_tournament',
      name: 'Турнир змейки',
      game: 'snake',
      type: 'daily',
      entryFee: 100,
      prizePool: 1000,
      participants: 0,
      maxParticipants: 50,
      startTime: null,
      endTime: null,
      status: 'upcoming'
    },
    {
      id: 'tetris_championship',
      name: 'Чемпионат тетриса',
      game: 'tetris',
      type: 'weekly',
      entryFee: 500,
      prizePool: 5000,
      participants: 0,
      maxParticipants: 100,
      startTime: null,
      endTime: null,
      status: 'upcoming'
    }
  ],

  // Достижения для Mini App игр
  achievements: [
    {
      id: 'snake_master',
      name: 'Мастер змейки',
      description: 'Наберите 1000 очков в змейке',
      icon: '🐍',
      reward: { coins: 500, gems: 25, experience: 100 },
      condition: { game: 'snake', score: 1000 }
    },
    {
      id: 'tetris_expert',
      name: 'Эксперт тетриса',
      description: 'Очистите 50 линий в тетрисе',
      icon: '🧩',
      reward: { coins: 1000, gems: 50, experience: 200 },
      condition: { game: 'tetris', lines: 50 }
    },
    {
      id: 'puzzle_solver',
      name: 'Решатель головоломок',
      description: 'Решите 100 головоломок',
      icon: '🧩',
      reward: { coins: 750, gems: 35, experience: 150 },
      condition: { game: 'puzzle', solved: 100 }
    }
  ]
};

// Активные сессии игр
const gameSessions = new Map();

// Статистика игр пользователей
const userGameStats = new Map();

// Начало игры
function startGame(userId, gameId) {
  const game = miniAppGames.games.find(g => g.id === gameId);
  if (!game) return { success: false, error: 'Игра не найдена' };

  const user = getUserData(userId);
  
  // Проверка требований
  if (user.level < game.requirements.level) {
    return { success: false, error: `Требуется уровень ${game.requirements.level}` };
  }
  
  if (user.coins < game.requirements.coins) {
    return { success: false, error: `Требуется ${game.requirements.coins} монет` };
  }

  // Создание сессии
  const sessionId = `${userId}_${gameId}_${Date.now()}`;
  const session = {
    id: sessionId,
    userId: userId,
    gameId: gameId,
    startTime: Date.now(),
    score: 0,
    level: 1,
    status: 'active'
  };

  gameSessions.set(sessionId, session);

  return {
    success: true,
    sessionId: sessionId,
    game: game,
    miniAppUrl: `${miniAppGames.config.appUrl}/game/${gameId}?session=${sessionId}&user=${userId}`
  };
}

// Завершение игры
function finishGame(sessionId, score, level = 1) {
  const session = gameSessions.get(sessionId);
  if (!session) return { success: false, error: 'Сессия не найдена' };

  const game = miniAppGames.games.find(g => g.id === session.gameId);
  if (!game) return { success: false, error: 'Игра не найдена' };

  // Расчет наград
  const rewards = calculateRewards(game, score, level);
  
  // Обновление статистики пользователя
  updateUserGameStats(session.userId, session.gameId, score, level);
  
  // Выдача наград
  const user = getUserData(session.userId);
  user.coins += rewards.coins;
  user.gems += rewards.gems;
  user.experience += rewards.experience;
  
  // Проверка достижений
  checkMiniAppAchievements(session.userId, session.gameId, score, level);
  
  // Завершение сессии
  session.status = 'completed';
  session.endTime = Date.now();
  session.score = score;
  session.level = level;

  return {
    success: true,
    score: score,
    level: level,
    rewards: rewards,
    achievements: getNewAchievements(session.userId, session.gameId)
  };
}

// Расчет наград
function calculateRewards(game, score, level) {
  const baseRewards = game.rewards;
  
  // Базовые награды
  let coins = Math.floor(Math.random() * (baseRewards.coins.max - baseRewards.coins.min + 1)) + baseRewards.coins.min;
  let gems = Math.floor(Math.random() * (baseRewards.gems.max - baseRewards.gems.min + 1)) + baseRewards.gems.min;
  let experience = Math.floor(Math.random() * (baseRewards.experience.max - baseRewards.experience.min + 1)) + baseRewards.experience.min;
  
  // Бонусы за счет
  const scoreMultiplier = Math.min(score / 1000, 3); // Максимум x3
  coins = Math.floor(coins * (1 + scoreMultiplier * 0.5));
  gems = Math.floor(gems * (1 + scoreMultiplier * 0.3));
  experience = Math.floor(experience * (1 + scoreMultiplier * 0.4));
  
  // Бонусы за уровень
  const levelMultiplier = Math.min(level / 10, 2); // Максимум x2
  coins = Math.floor(coins * (1 + levelMultiplier * 0.3));
  gems = Math.floor(gems * (1 + levelMultiplier * 0.2));
  experience = Math.floor(experience * (1 + levelMultiplier * 0.25));

  return {
    coins: Math.max(coins, 1),
    gems: Math.max(gems, 0),
    experience: Math.max(experience, 1)
  };
}

// Обновление статистики игр пользователя
function updateUserGameStats(userId, gameId, score, level) {
  if (!userGameStats.has(userId)) {
    userGameStats.set(userId, {});
  }
  
  const stats = userGameStats.get(userId);
  if (!stats[gameId]) {
    stats[gameId] = {
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      totalLevel: 0,
      bestLevel: 0,
      totalTime: 0
    };
  }
  
  const gameStats = stats[gameId];
  gameStats.gamesPlayed++;
  gameStats.totalScore += score;
  gameStats.bestScore = Math.max(gameStats.bestScore, score);
  gameStats.totalLevel += level;
  gameStats.bestLevel = Math.max(gameStats.bestLevel, level);
}

// Проверка достижений Mini App игр
function checkMiniAppAchievements(userId, gameId, score, level) {
  const achievements = miniAppGames.achievements.filter(a => a.condition.game === gameId);
  
  for (const achievement of achievements) {
    const condition = achievement.condition;
    const userStats = getUserGameStats(userId, gameId);
    
    let achieved = false;
    
    if (condition.score && score >= condition.score) {
      achieved = true;
    } else if (condition.lines && userStats.totalScore >= condition.lines * 100) {
      achieved = true;
    } else if (condition.solved && userStats.gamesPlayed >= condition.solved) {
      achieved = true;
    }
    
    if (achieved) {
      // Выдача награды за достижение
      const user = getUserData(userId);
      user.coins += achievement.reward.coins;
      user.gems += achievement.reward.gems;
      user.experience += achievement.reward.experience;
    }
  }
}

// Получение статистики игр пользователя
function getUserGameStats(userId, gameId = null) {
  if (!userGameStats.has(userId)) {
    userGameStats.set(userId, {});
  }
  
  const stats = userGameStats.get(userId);
  
  if (gameId) {
    return stats[gameId] || {
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      totalLevel: 0,
      bestLevel: 0,
      totalTime: 0
    };
  }
  
  return stats;
}

// Получение новых достижений
function getNewAchievements(userId, gameId) {
  // Здесь можно добавить логику получения новых достижений
  return [];
}

// Получение доступных игр для пользователя
function getAvailableGames(userId) {
  const user = getUserData(userId);
  
  return miniAppGames.games.filter(game => 
    user.level >= game.requirements.level && 
    user.coins >= game.requirements.coins
  );
}

// Получение турниров
function getTournaments(gameId = null) {
  if (gameId) {
    return miniAppGames.tournaments.filter(t => t.game === gameId);
  }
  
  return miniAppGames.tournaments;
}

// Участие в турнире
function joinTournament(userId, tournamentId) {
  const tournament = miniAppGames.tournaments.find(t => t.id === tournamentId);
  if (!tournament) return { success: false, error: 'Турнир не найден' };
  
  const user = getUserData(userId);
  if (user.coins < tournament.entryFee) {
    return { success: false, error: 'Недостаточно монет для участия' };
  }
  
  if (tournament.participants >= tournament.maxParticipants) {
    return { success: false, error: 'Турнир заполнен' };
  }
  
  // Списание вступительного взноса
  user.coins -= tournament.entryFee;
  
  // Добавление участника
  tournament.participants++;
  
  return {
    success: true,
    tournament: tournament,
    entryFee: tournament.entryFee
  };
}

module.exports = {
  miniAppGames,
  startGame,
  finishGame,
  getUserGameStats,
  getAvailableGames,
  getTournaments,
  joinTournament,
  calculateRewards
};
