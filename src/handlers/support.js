const DatabaseService = require('../services/DatabaseService');

// Обработчик команды /support
const supportHandler = async (ctx) => {
  const supportText = `❓ <b>Техническая поддержка</b>

🆔 <b>Ваш ID:</b> ${ctx.user.telegram_id}

📞 <b>Способы связи:</b>
• Telegram: @support_username
• Email: support@gamebot.com
• Время ответа: до 24 часов

🔧 <b>Частые проблемы:</b>

❓ <b>Не работает игра?</b>
Попробуйте перезапустить бота командой /start

💰 <b>Проблемы с балансом?</b>
Проверьте историю транзакций в профиле

🎮 <b>Ошибки в играх?</b>
Опишите проблему и приложите скриншот

💎 <b>Премиум подписка?</b>
Обратитесь в поддержку для решения проблем

📋 <b>При обращении укажите:</b>
• Ваш Telegram ID
• Описание проблемы
• Скриншоты (если есть)
• Время возникновения проблемы`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📧 Написать в поддержку', url: 'https://t.me/support_username' }
      ],
      [
        { text: '🔙 Главное меню', callback_data: 'main_menu' }
      ]
    ]
  };

  await ctx.reply(supportText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

module.exports = supportHandler;
