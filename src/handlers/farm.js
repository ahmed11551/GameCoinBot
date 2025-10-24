const DatabaseService = require('../services/DatabaseService');

// Обработчик команды /farm (idle ферма)
const farmHandler = async (ctx) => {
  const user = ctx.user;
  
  const farmText = `🚜 <b>Idle ферма</b>

💰 <b>Ваш баланс:</b> ${user.coins} монет

🌱 <b>Ваша ферма:</b>
• Куры: 0 (доход: 1 монета/час)
• Коровы: 0 (доход: 5 монет/час)
• Пшеница: 0 (доход: 2 монеты/час)
• Деревья: 0 (доход: 3 монеты/час)

💰 <b>Пассивный доход:</b> 0 монет/час
⏰ <b>Последний сбор:</b> Никогда

💡 <b>Как работает:</b>
Покупайте животных и растения для пассивного дохода. Доход начисляется каждые 24 часа!`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🐔 Куры (100 монет)', callback_data: 'farm_buy_chicken' },
        { text: '🐄 Коровы (500 монет)', callback_data: 'farm_buy_cow' }
      ],
      [
        { text: '🌾 Пшеница (200 монет)', callback_data: 'farm_buy_wheat' },
        { text: '🌳 Деревья (300 монет)', callback_data: 'farm_buy_tree' }
      ],
      [
        { text: '💰 Собрать доход', callback_data: 'farm_collect' },
        { text: '📊 Статистика', callback_data: 'farm_stats' }
      ],
      [
        { text: '🔙 Главное меню', callback_data: 'main_menu' }
      ]
    ]
  };

  await ctx.reply(farmText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

module.exports = farmHandler;
