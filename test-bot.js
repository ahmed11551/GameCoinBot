require('dotenv').config();
const { Telegraf } = require('telegraf');

// Простая версия бота для тестирования
const bot = new Telegraf(process.env.BOT_TOKEN || '8479237154:AAGPnOMzFdHcOi6A5Y-gPxQnq2q7BHJULq8');

// Обработчик команды /start
bot.start((ctx) => {
  const welcomeText = `🎮 <b>Добро пожаловать в CoinMaster!</b>

👋 Привет, ${ctx.from.first_name || 'Игрок'}!

🎯 <b>Доступные игры:</b>
• Викторины - проверьте свои знания
• Казино - азартные игры на монеты
• Кликер - зарабатывайте кликами
• Турниры - соревнуйтесь с другими

💰 <b>Ваш баланс:</b>
🪙 Монеты: 1000
💎 Драгоценные камни: 0
⭐ Уровень: 1

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

  ctx.reply(welcomeText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
});

// Обработчик callback-запросов
bot.on('callback_query', (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  
  switch (callbackData) {
    case 'profile':
      ctx.answerCbQuery();
      ctx.editMessageText(`👤 <b>Профиль игрока</b>

🆔 <b>ID:</b> ${ctx.from.id}
👤 <b>Имя:</b> ${ctx.from.first_name || 'Не указано'}
📅 <b>Регистрация:</b> ${new Date().toLocaleDateString('ru-RU')}
⭐ <b>Уровень:</b> 1
📈 <b>Опыт:</b> 0

💰 <b>Валюта:</b>
🪙 Монеты: 1000
💎 Драгоценные камни: 0

📊 <b>Статистика игр:</b>
🎯 Игр сыграно: 0
🏆 Побед: 0
🎰 Казино игр: 0
👆 Кликов: 0

💎 <b>Премиум статус:</b> ❌ Неактивен`, { 
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '🔙 Главное меню', callback_data: 'main_menu' }
          ]]
        }
      });
      break;
      
    case 'balance':
      ctx.answerCbQuery();
      ctx.editMessageText(`💰 <b>Баланс и валюта</b>

🪙 <b>Монеты:</b> 1000
💎 <b>Драгоценные камни:</b> 0

💡 <b>Как заработать:</b>
• Ежедневный бонус: 100 монет
• Викторины: 50-200 монет
• Кликер игра
• Турниры и достижения

🎁 <b>Доступен ежедневный бонус!</b>`, { 
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🎁 Получить ежедневный бонус', callback_data: 'claim_bonus' }
            ],
            [
              { text: '🛒 Купить монеты', callback_data: 'buy_coins' },
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    case 'quiz_menu':
      ctx.answerCbQuery();
      ctx.editMessageText(`🎯 <b>Викторины</b>

Выберите категорию и сложность:

📚 <b>Категории:</b>
• 🎬 Кино - вопросы о фильмах
• 🎵 Музыка - музыкальные вопросы  
• 🔬 Наука - научные факты
• 🎮 Игры - игровая индустрия

⭐ <b>Сложность:</b>
• 🟢 Легкая - 50 монет за победу
• 🟡 Средняя - 100 монет + 10 драгоценных камней
• 🔴 Сложная - 200 монет + 25 драгоценных камней

⏱️ <b>Время на вопрос:</b> 15 секунд
📝 <b>Количество вопросов:</b> 10`, { 
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🎬 Кино', callback_data: 'quiz_movies' },
              { text: '🎵 Музыка', callback_data: 'quiz_music' }
            ],
            [
              { text: '🔬 Наука', callback_data: 'quiz_science' },
              { text: '🎮 Игры', callback_data: 'quiz_games' }
            ],
            [
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    case 'casino_menu':
      ctx.answerCbQuery();
      ctx.editMessageText(`🎰 <b>Казино игры</b>

💰 <b>Ваш баланс:</b> 1000 монет

🎮 <b>Доступные игры:</b>

🎰 <b>Слот-машина</b>
• Минимальная ставка: 10 монет
• Максимальная ставка: 1000 монет
• Шанс выигрыша: 30%

🎲 <b>Кости</b>
• Минимальная ставка: 20 монет
• Максимальная ставка: 1000 монет
• Шанс выигрыша: 50%

🎯 <b>Рулетка</b>
• Минимальная ставка: 50 монет
• Максимальная ставка: 1000 монет
• Шанс выигрыша: 48%

🃏 <b>Блэкджек</b>
• Минимальная ставка: 100 монет
• Максимальная ставка: 1000 монет
• Шанс выигрыша: 49%

⚠️ <b>Предупреждение:</b> Играйте ответственно!`, { 
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🎰 Слот-машина', callback_data: 'casino_slots' },
              { text: '🎲 Кости', callback_data: 'casino_dice' }
            ],
            [
              { text: '🎯 Рулетка', callback_data: 'casino_roulette' },
              { text: '🃏 Блэкджек', callback_data: 'casino_blackjack' }
            ],
            [
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    case 'clicker_menu':
      ctx.answerCbQuery();
      ctx.editMessageText(`👆 <b>Кликер игра</b>

💰 <b>Доход за клик:</b> 1 монета
⚡ <b>Автокликер:</b> 0 монет/сек
🪙 <b>Монеты в сессии:</b> 0
👆 <b>Кликов в сессии:</b> 0

🔧 <b>Ваши улучшения:</b>
• Усиленный палец: 0 уровень
• Автокликер: 0 уровень  
• Золотая рука: 0 уровень
• Бизнес-центр: 0 уровень

💡 <b>Как играть:</b>
Нажимайте кнопку "Клик!" для заработка монет. Покупайте улучшения для увеличения дохода!`, { 
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '👆 Клик!', callback_data: 'clicker_click' }
            ],
            [
              { text: '🔧 Улучшения', callback_data: 'clicker_upgrades' },
              { text: '📊 Статистика', callback_data: 'clicker_stats' }
            ],
            [
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    case 'claim_bonus':
      ctx.answerCbQuery('🎁 Получен ежедневный бонус: 100 монет!');
      ctx.editMessageText(`💰 <b>Баланс и валюта</b>

🪙 <b>Монеты:</b> 1100 (+100)
💎 <b>Драгоценные камни:</b> 0

✅ <b>Ежедневный бонус получен!</b>

💡 <b>Как заработать:</b>
• Ежедневный бонус: 100 монет
• Викторины: 50-200 монет
• Кликер игра
• Турниры и достижения`, { 
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🛒 Купить монеты', callback_data: 'buy_coins' },
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    case 'main_menu':
      ctx.answerCbQuery();
      ctx.reply(`🎮 <b>Добро пожаловать в CoinMaster!</b>

👋 Привет, ${ctx.from.first_name || 'Игрок'}!

🎯 <b>Доступные игры:</b>
• Викторины - проверьте свои знания
• Казино - азартные игры на монеты
• Кликер - зарабатывайте кликами
• Турниры - соревнуйтесь с другими

💰 <b>Ваш баланс:</b>
🪙 Монеты: 1000
💎 Драгоценные камни: 0
⭐ Уровень: 1

💡 <b>Совет:</b> Используйте кнопки ниже для навигации!`, { 
        parse_mode: 'HTML',
        reply_markup: {
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
        }
      });
      break;
      
    default:
      ctx.answerCbQuery('🚧 Функция в разработке!');
  }
});

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже или обратитесь в поддержку.');
});

// Запуск бота
console.log('🚀 Запуск CoinMaster Bot...');
console.log('🤖 Бот: @new_coinmaster_game_bot');
console.log('📱 Найдите бота в Telegram и отправьте /start');

bot.launch().then(() => {
  console.log('✅ Бот успешно запущен!');
}).catch((error) => {
  console.error('❌ Ошибка запуска бота:', error);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
