const DatabaseService = require('../services/DatabaseService');

// Обработчик команды /profile
const profileHandler = async (ctx) => {
  const user = ctx.user;
  
  // Получаем статистику пользователя
  const stats = await DatabaseService.query(
    'SELECT * FROM user_stats WHERE user_id = $1',
    [user.id]
  );
  
  const userStats = stats.rows[0] || {};
  
  // Получаем достижения
  const achievements = await DatabaseService.getUserAchievements(user.id);
  
  const profileText = `👤 <b>Профиль игрока</b>

🆔 <b>ID:</b> ${user.telegram_id}
👤 <b>Имя:</b> ${user.first_name || 'Не указано'}
📅 <b>Регистрация:</b> ${new Date(user.created_at).toLocaleDateString('ru-RU')}
⭐ <b>Уровень:</b> ${user.level}
📈 <b>Опыт:</b> ${user.experience}

💰 <b>Валюта:</b>
🪙 Монеты: ${user.coins}
💎 Драгоценные камни: ${user.gems}

📊 <b>Статистика игр:</b>
🎯 Игр сыграно: ${userStats.games_played || 0}
🏆 Побед: ${userStats.games_won || 0}
🎰 Казино игр: ${userStats.casino_games_played || 0}
👆 Кликов: ${userStats.clicker_clicks || 0}
🏆 Турниров выиграно: ${userStats.tournaments_won || 0}

💎 <b>Премиум статус:</b> ${user.is_premium ? '✅ Активен' : '❌ Неактивен'}
${user.is_premium ? `📅 До: ${new Date(user.premium_expires_at).toLocaleDateString('ru-RU')}` : ''}

🏆 <b>Достижения:</b> ${achievements.length}
${achievements.slice(0, 3).map(a => `${a.icon} ${a.name}`).join('\n')}
${achievements.length > 3 ? `... и еще ${achievements.length - 3}` : ''}`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🏆 Все достижения', callback_data: 'achievements' },
        { text: '📊 Подробная статистика', callback_data: 'detailed_stats' }
      ],
      [
        { text: '🔙 Главное меню', callback_data: 'main_menu' }
      ]
    ]
  };

  await ctx.reply(profileText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

module.exports = profileHandler;
