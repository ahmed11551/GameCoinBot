const DatabaseService = require('../services/DatabaseService');
const RedisService = require('../services/RedisService');

// Главное меню бота
const startHandler = async (ctx) => {
  const user = ctx.user;
  
  const welcomeText = `🎮 <b>Добро пожаловать в GameBot!</b>

👋 Привет, ${user.first_name || 'Игрок'}!

💰 <b>Ваш баланс:</b>
🪙 Монеты: ${user.coins}
💎 Драгоценные камни: ${user.gems}
⭐ Уровень: ${user.level}

🎯 <b>Доступные игры:</b>
• Викторины - проверьте свои знания
• Казино - азартные игры на монеты
• Кликер - зарабатывайте кликами
• Турниры - соревнуйтесь с другими

💡 <b>Совет:</b> Используйте кнопки ниже для навигации!`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '👤 Профиль', callback_data: 'profile' },
        { text: '💰 Баланс', callback_data: 'balance' }
      ],
      [
        { text: '🎯 Викторины', callback_data: 'quiz_menu' },
        { text: '🎰 Казино', callback_data: 'casino_menu' }
      ],
      [
        { text: '👆 Кликер', callback_data: 'clicker_menu' },
        { text: '🏆 Турниры', callback_data: 'tournaments' }
      ],
      [
        { text: '📊 Таблица лидеров', callback_data: 'leaderboard' },
        { text: '🛒 Магазин', callback_data: 'shop' }
      ],
      [
        { text: '❓ Поддержка', callback_data: 'support' }
      ]
    ]
  };

  await ctx.reply(welcomeText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

module.exports = startHandler;
