const DatabaseService = require('../services/DatabaseService');
const RedisService = require('../services/RedisService');

// Обработчик команды /balance
const balanceHandler = async (ctx) => {
  const user = ctx.user;
  
  // Проверяем ежедневный бонус
  const hasDailyBonus = await RedisService.hasDailyBonus(user.id);
  const canClaimDailyBonus = !hasDailyBonus && 
    (!user.daily_bonus_claimed_at || 
     new Date(user.daily_bonus_claimed_at).toDateString() !== new Date().toDateString());
  
  const balanceText = `💰 <b>Баланс и валюта</b>

🪙 <b>Монеты:</b> ${user.coins}
💎 <b>Драгоценные камни:</b> ${user.gems}

${canClaimDailyBonus ? '🎁 <b>Доступен ежедневный бонус!</b>' : ''}

💡 <b>Как заработать:</b>
• Ежедневный бонус: 100 монет
• Викторины: 50-200 монет
• Кликер игра
• Турниры и достижения
• Премиум подписка: +20% к заработку`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🛒 Купить монеты', callback_data: 'buy_coins' },
        { text: '💎 Купить драгоценные камни', callback_data: 'buy_gems' }
      ],
      [
        { text: '💎 Премиум подписка', callback_data: 'premium_subscription' }
      ],
      ...(canClaimDailyBonus ? [[
        { text: '🎁 Получить ежедневный бонус', callback_data: 'claim_daily_bonus' }
      ]] : []),
      [
        { text: '📊 История транзакций', callback_data: 'transaction_history' },
        { text: '🔙 Главное меню', callback_data: 'main_menu' }
      ]
    ]
  };

  await ctx.reply(balanceText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

module.exports = balanceHandler;
