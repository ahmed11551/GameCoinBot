// Конфигурация бота
module.exports = {
  // Основные настройки
  bot: {
    token: process.env.BOT_TOKEN,
    webhookUrl: process.env.WEBHOOK_URL,
    port: process.env.PORT || 3000
  },
  
  // Настройки базы данных
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'game_bot',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  
  // Настройки Redis
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  },
  
  // Игровые настройки
  game: {
    dailyBonusCoins: parseInt(process.env.DAILY_BONUS_COINS) || 100,
    newUserBonusCoins: parseInt(process.env.NEW_USER_BONUS_COINS) || 1000,
    maxDailyCasinoLoss: parseInt(process.env.MAX_DAILY_CASINO_LOSS) || 5000,
    maxBetAmount: parseInt(process.env.MAX_BET_AMOUNT) || 1000,
    quizTimePerQuestion: 15, // секунд
    quizQuestionsPerGame: 10,
    clickerAutoClickInterval: 1000, // миллисекунды
    farmIncomeInterval: 24 * 60 * 60 * 1000 // 24 часа в миллисекундах
  },
  
  // Настройки Telegram Stars
  stars: {
    enabled: process.env.TELEGRAM_STARS_ENABLED === 'true',
    coinsRate: parseFloat(process.env.STARS_TO_COINS_RATE) || 1,
    gemsRate: parseFloat(process.env.STARS_TO_GEMS_RATE) || 0.1
  },
  
  // Настройки безопасности
  security: {
    jwtSecret: process.env.JWT_SECRET,
    encryptionKey: process.env.ENCRYPTION_KEY,
    rateLimitPerMinute: 30,
    maxSessionDuration: 24 * 60 * 60 // 24 часа в секундах
  },
  
  // Админские настройки
  admin: {
    userIds: process.env.ADMIN_USER_IDS ? process.env.ADMIN_USER_IDS.split(',') : [],
    supportChatId: process.env.SUPPORT_CHAT_ID
  },
  
  // Настройки логирования
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.NODE_ENV !== 'production'
  }
};
