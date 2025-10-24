const DatabaseService = require('../services/DatabaseService');
const RedisService = require('../services/RedisService');

// Обработчик команды /leaderboard
const leaderboardHandler = async (ctx) => {
  try {
    // Получаем таблицу лидеров из кэша или базы данных
    let leaderboard = await RedisService.getLeaderboard();
    
    if (!leaderboard) {
      leaderboard = await DatabaseService.getLeaderboard(10);
      await RedisService.setLeaderboard(leaderboard, 300); // Кэшируем на 5 минут
    }
    
    let leaderboardText = `🏆 <b>Таблица лидеров</b>\n\n`;
    
    leaderboard.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const name = user.first_name || user.username || 'Аноним';
      leaderboardText += `${medal} ${name} - ${user.coins} монет (Уровень ${user.level})\n`;
    });
    
    leaderboardText += `\n💡 Обновляется каждые 5 минут`;
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔄 Обновить', callback_data: 'leaderboard_refresh' },
          { text: '🔙 Главное меню', callback_data: 'main_menu' }
        ]
      ]
    };
    
    await ctx.reply(leaderboardText, { 
      parse_mode: 'HTML', 
      reply_markup: keyboard 
    });
    
  } catch (error) {
    console.error('Leaderboard handler error:', error);
    await ctx.reply('❌ Ошибка при загрузке таблицы лидеров');
  }
};

module.exports = leaderboardHandler;
