require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

// Импорт игровых модулей
const quizModule = require('./games/quiz');
const casinoModule = require('./games/casino');
const clickerModule = require('./games/clicker');
const achievementsModule = require('./games/achievements');
const questsModule = require('./games/quests');

// Импорт сервисов
const monetizationService = require('./services/MonetizationService');
const referralService = require('./services/ReferralService');
const telegramStarsService = require('./services/TelegramStarsService');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN || '8479237154:AAGPnOMzFdHcOi6A5Y-gPxQnq2q7BHJULq8');

// Настройка обработчиков платежей
telegramStarsService.setupPaymentHandlers(bot);

// Middleware для парсинга JSON
app.use(express.json());

// Простое хранилище в памяти (для демо)
const userData = new Map();

// Получение данных пользователя
function getUserData(userId) {
  if (!userData.has(userId)) {
    userData.set(userId, {
      coins: 1000,
      gems: 0,
      level: 1,
      experience: 0,
      gamesPlayed: 0,
      wins: 0,
      clicks: 0,
      quizPlayed: 0,
      quizCorrect: 0,
      quizPerfect: 0,
      casinoPlayed: 0,
      casinoWon: 0,
      casinoMaxBet: 0,
      clickerClicks: 0,
      clickerUpgrades: 0,
      coinsEarned: 1000,
      gemsEarned: 0,
      dailyBonusStreak: 0,
      lastDailyBonus: null
    });
  }
  return userData.get(userId);
}

// Обновление статистики пользователя
function updateUserStats(userId, stats) {
  const user = getUserData(userId);
  Object.assign(user, stats);
  
  // Проверяем достижения
  const newAchievements = achievementsModule.checkAchievements(userId, user);
  if (newAchievements.length > 0) {
    // Выдаем награды за достижения
    for (const achievement of newAchievements) {
      user.coins += achievement.reward.coins;
      user.gems += achievement.reward.gems;
      user.experience += achievement.reward.experience;
    }
  }
  
  // Проверяем квесты
  questsModule.updateQuestProgress(userId, 'coins_earn', stats.coinsEarned || 0);
  
  return newAchievements;
}

// Добавление монет пользователю
function addCoins(userId, amount, source = 'game') {
  const user = getUserData(userId);
  user.coins += amount;
  user.coinsEarned += amount;
  
  // Обновляем статистику для квестов
  questsModule.updateQuestProgress(userId, 'coins_earn', amount);
  
  return user.coins;
}

// Добавление драгоценных камней
function addGems(userId, amount) {
  const user = getUserData(userId);
  user.gems += amount;
  user.gemsEarned += amount;
  return user.gems;
}

// Обработчик команды /start
bot.start((ctx) => {
  const user = getUserData(ctx.from.id);
  
  // Проверяем реферальную ссылку
  const startParam = ctx.message?.text?.split(' ')[1];
  const referralInfo = referralService.parseStartCommand(startParam);
  
  let welcomeText = `🎮 <b>Добро пожаловать в CoinMaster!</b>

👋 Привет, ${ctx.from.first_name || 'Игрок'}!

💰 <b>Ваш баланс:</b>
🪙 Монеты: ${user.coins}
💎 Драгоценные камни: ${user.gems}
⭐ Уровень: ${user.level}`;

  // Если это реферальная регистрация
  if (referralInfo.isReferral && !user.referredBy) {
    const referralResult = referralService.registerReferral(ctx.from.id, referralInfo.referralCode);
    
    if (referralResult.success) {
      // Выдаем награды
      addCoins(ctx.from.id, referralResult.referee.reward.coins);
      addGems(ctx.from.id, referralResult.referee.reward.gems);
      
      welcomeText += `

🎉 <b>Реферальный бонус!</b>
Вы зарегистрированы по реферальной ссылке!
💎 Получено: ${referralResult.referee.reward.gems} драгоценных камней
🪙 Получено: ${referralResult.referee.reward.coins} монет`;
      
      user.referredBy = referralResult.referrer.userId;
    }
  }

  welcomeText += `

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

  ctx.reply(welcomeText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
});

// Обработчик callback-запросов
bot.on('callback_query', (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const user = getUserData(ctx.from.id);
  
  switch (callbackData) {
    case 'profile':
      ctx.answerCbQuery();
      ctx.editMessageText(`👤 <b>Профиль игрока</b>

🆔 <b>ID:</b> ${ctx.from.id}
👤 <b>Имя:</b> ${ctx.from.first_name || 'Не указано'}
📅 <b>Регистрация:</b> ${new Date().toLocaleDateString('ru-RU')}
⭐ <b>Уровень:</b> ${user.level}
📈 <b>Опыт:</b> ${user.experience}

💰 <b>Валюта:</b>
🪙 Монеты: ${user.coins}
💎 Драгоценные камни: ${user.gems}

📊 <b>Статистика игр:</b>
🎯 Игр сыграно: ${user.gamesPlayed}
🏆 Побед: ${user.wins}
🎰 Казино игр: 0
👆 Кликов: ${user.clicks}

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

🪙 <b>Монеты:</b> ${user.coins}
💎 <b>Драгоценные камни:</b> ${user.gems}

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
      
    // Викторины по категориям
    case 'quiz_movies':
    case 'quiz_music':
    case 'quiz_science':
    case 'quiz_games':
      ctx.answerCbQuery();
      const quizCategory = callbackData.replace('quiz_', '');
      ctx.editMessageText(`🎯 <b>Викторина: ${getCategoryName(quizCategory)}</b>

Выберите сложность:

🟢 <b>Легкая</b> - 50 монет за победу
🟡 <b>Средняя</b> - 100 монет + 10 драгоценных камней  
🔴 <b>Сложная</b> - 200 монет + 25 драгоценных камней`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🟢 Легкая', callback_data: `quiz_start_${quizCategory}_easy` },
              { text: '🟡 Средняя', callback_data: `quiz_start_${quizCategory}_medium` }
            ],
            [
              { text: '🔴 Сложная', callback_data: `quiz_start_${quizCategory}_hard` }
            ],
            [
              { text: '🔙 К викторинам', callback_data: 'quiz_menu' }
            ]
          ]
        }
      });
      break;
      
    // Начало викторины
    case 'quiz_start_movies_easy':
    case 'quiz_start_movies_medium':
    case 'quiz_start_movies_hard':
    case 'quiz_start_music_easy':
    case 'quiz_start_music_medium':
    case 'quiz_start_music_hard':
    case 'quiz_start_science_easy':
    case 'quiz_start_science_medium':
    case 'quiz_start_science_hard':
    case 'quiz_start_games_easy':
    case 'quiz_start_games_medium':
    case 'quiz_start_games_hard':
      const [, , category, difficulty] = callbackData.split('_');
      const session = quizModule.startQuiz(ctx.from.id, category, difficulty);
      
      if (!session) {
        ctx.answerCbQuery('Ошибка запуска викторины');
        return;
      }
      
      const question = quizModule.getCurrentQuestion(ctx.from.id);
      if (!question) {
        ctx.answerCbQuery('Нет доступных вопросов');
        return;
      }
      
      ctx.answerCbQuery();
      ctx.editMessageText(`🎯 <b>Вопрос ${session.currentQuestion + 1}/${session.questions.length}</b>

${question.question}`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            question.options.map((option, index) => [
              { text: option, callback_data: `quiz_answer_${index}` }
            ]).flat(),
            [
              { text: '❌ Выйти', callback_data: 'quiz_exit' }
            ]
          ]
        }
      });
      break;
      
    // Ответ на вопрос викторины
    case 'quiz_answer_0':
    case 'quiz_answer_1':
    case 'quiz_answer_2':
    case 'quiz_answer_3':
      const answerIndex = parseInt(callbackData.split('_')[2]);
      const result = quizModule.answerQuestion(ctx.from.id, answerIndex);
      
      if (!result) {
        ctx.answerCbQuery('Ошибка обработки ответа');
        return;
      }
      
      if (result.isFinished) {
        // Завершение викторины
        const finalResult = quizModule.finishQuiz(ctx.from.id);
        const grade = quizModule.getQuizGrade(finalResult.percentage);
        
        // Выдаем награды
        addCoins(ctx.from.id, finalResult.rewards.coins);
        addGems(ctx.from.id, finalResult.rewards.gems);
        user.experience += finalResult.rewards.experience;
        
        // Обновляем статистику
        updateUserStats(ctx.from.id, {
          quizPlayed: 1,
          quizCorrect: finalResult.score,
          quizPerfect: finalResult.percentage === 100 ? 1 : 0
        });
        
        ctx.answerCbQuery();
        ctx.editMessageText(`🎯 <b>Викторина завершена!</b>

📊 <b>Результат:</b> ${finalResult.score}/${finalResult.totalQuestions}
📈 <b>Процент:</b> ${finalResult.percentage}%
⭐ <b>Оценка:</b> ${grade}

💰 <b>Награды:</b>
🪙 Монеты: +${finalResult.rewards.coins}
💎 Драгоценные камни: +${finalResult.rewards.gems}
📈 Опыт: +${finalResult.rewards.experience}

⏱️ <b>Время:</b> ${Math.round(finalResult.timeSpent / 1000)} сек`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎯 Еще викторину', callback_data: 'quiz_menu' },
                { text: '🏠 Главное меню', callback_data: 'main_menu' }
              ]
            ]
          }
        });
      } else {
        // Следующий вопрос
        const nextQuestion = quizModule.getCurrentQuestion(ctx.from.id);
        if (!nextQuestion) {
          ctx.answerCbQuery('Ошибка получения следующего вопроса');
          return;
        }
        
        const progress = quizModule.getQuizProgress(ctx.from.id);
        const emoji = result.isCorrect ? '✅' : '❌';
        
        ctx.answerCbQuery(`${emoji} ${result.isCorrect ? 'Правильно!' : 'Неправильно!'}`);
        
        setTimeout(() => {
          ctx.editMessageText(`🎯 <b>Вопрос ${progress.currentQuestion}/${progress.totalQuestions}</b>

${nextQuestion.question}`, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                nextQuestion.options.map((option, index) => [
                  { text: option, callback_data: `quiz_answer_${index}` }
                ]).flat(),
                [
                  { text: '❌ Выйти', callback_data: 'quiz_exit' }
                ]
              ]
            }
          });
        }, 2000);
      }
      break;
      
    case 'quiz_exit':
      quizModule.finishQuiz(ctx.from.id);
      ctx.answerCbQuery('Викторина отменена');
      ctx.editMessageText('🎯 Викторина отменена. Выберите действие:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🎯 Еще викторину', callback_data: 'quiz_menu' },
              { text: '🏠 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    case 'casino_menu':
      ctx.answerCbQuery();
      ctx.editMessageText(`🎰 <b>Казино игры</b>

💰 <b>Ваш баланс:</b> ${user.coins} монет

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
👆 <b>Кликов в сессии:</b> ${user.clicks}

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
      
    case 'clicker_click':
      const clickResult = clickerModule.click(ctx.from.id);
      addCoins(ctx.from.id, clickResult.clickValue);
      updateUserStats(ctx.from.id, { clickerClicks: clickResult.totalClicks });
      ctx.answerCbQuery(`+${clickResult.clickValue} монет! 💰 Всего кликов: ${clickResult.totalClicks}`);
      break;
      
    case 'clicker_upgrades':
      ctx.answerCbQuery();
      const upgradesInfo = clickerModule.getUpgradesInfo(ctx.from.id);
      let upgradesText = `🔧 <b>Улучшения кликер игры</b>\n\n`;
      
      for (const [upgradeType, info] of Object.entries(upgradesInfo)) {
        upgradesText += `${info.name} (Ур. ${info.currentLevel}/${info.maxLevel})\n`;
        upgradesText += `${info.description}\n`;
        upgradesText += `💰 Цена: ${info.price} монет\n`;
        upgradesText += `${info.canBuy ? '✅ Доступно' : '❌ Недоступно'}\n\n`;
      }
      
      ctx.editMessageText(upgradesText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔧 Усиленный палец', callback_data: 'buy_upgrade_finger' },
              { text: '⚡ Автокликер', callback_data: 'buy_upgrade_autoclicker' }
            ],
            [
              { text: '👑 Золотая рука', callback_data: 'buy_upgrade_golden_hand' },
              { text: '🏢 Бизнес-центр', callback_data: 'buy_upgrade_business' }
            ],
            [
              { text: '🔙 Кликер меню', callback_data: 'clicker_menu' }
            ]
          ]
        }
      });
      break;
      
    case 'clicker_stats':
      ctx.answerCbQuery();
      const stats = clickerModule.getStats(ctx.from.id);
      ctx.editMessageText(`📊 <b>Статистика кликер игры</b>

👆 <b>Всего кликов:</b> ${stats.clicks}
💰 <b>Заработано монет:</b> ${stats.coinsEarned}
⚡ <b>Пассивный доход:</b> ${stats.passiveIncome} монет/сек
💎 <b>Доход за клик:</b> ${stats.clickValue} монет

🔧 <b>Улучшения:</b>
• Усиленный палец: ${stats.upgrades.finger} ур.
• Автокликер: ${stats.upgrades.autoclicker} ур.
• Золотая рука: ${stats.upgrades.golden_hand} ур.
• Бизнес-центр: ${stats.upgrades.business} ур.`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '🔙 Кликер меню', callback_data: 'clicker_menu' }
          ]]
        }
      });
      break;
      
    // Покупка улучшений
    case 'buy_upgrade_finger':
    case 'buy_upgrade_autoclicker':
    case 'buy_upgrade_golden_hand':
    case 'buy_upgrade_business':
      const upgradeType = callbackData.replace('buy_upgrade_', '');
      const buyResult = clickerModule.buyUpgrade(ctx.from.id, upgradeType, user.coins);
      
      if (buyResult.error) {
        ctx.answerCbQuery(buyResult.error);
      } else {
        user.coins -= buyResult.price;
        ctx.answerCbQuery(`✅ Куплено: ${buyResult.upgrade} (Ур. ${buyResult.newLevel})`);
        ctx.editMessageText(`🔧 <b>Улучшения кликер игры</b>

✅ <b>Успешно куплено:</b> ${buyResult.upgrade}
📈 <b>Новый уровень:</b> ${buyResult.newLevel}
💰 <b>Потрачено:</b> ${buyResult.price} монет
💎 <b>Ваш баланс:</b> ${user.coins} монет`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[
              { text: '🔙 К улучшениям', callback_data: 'clicker_upgrades' }
            ]]
          }
        });
      }
      break;
      
    case 'claim_bonus':
      user.coins += 100;
      ctx.answerCbQuery('🎁 Получен ежедневный бонус: 100 монет!');
      ctx.editMessageText(`💰 <b>Баланс и валюта</b>

🪙 <b>Монеты:</b> ${user.coins} (+100)
💎 <b>Драгоценные камни:</b> ${user.gems}

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

💰 <b>Ваш баланс:</b>
🪙 Монеты: ${user.coins}
💎 Драгоценные камни: ${user.gems}
⭐ Уровень: ${user.level}

🎯 <b>Доступные игры:</b>
• Викторины - проверьте свои знания
• Казино - азартные игры на монеты
• Кликер - зарабатывайте кликами
• Турниры - соревнуйтесь с другими

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
              { text: '🏆 Достижения', callback_data: 'achievements' },
              { text: '📋 Квесты', callback_data: 'quests' }
            ],
            [
              { text: '💎 Купить драгоценные камни', callback_data: 'buy_gems_stars' },
              { text: '👥 Реферальная система', callback_data: 'referral_system' }
            ],
            [
              { text: '❓ Поддержка', callback_data: 'support' }
            ]
          ]
        }
      });
      break;
      
    // Казино игры
    case 'casino_slots':
      ctx.answerCbQuery();
      ctx.editMessageText(`🎰 <b>Слот-машина</b>

💰 <b>Ваш баланс:</b> ${user.coins} монет
🎯 <b>Минимальная ставка:</b> 10 монет
🎯 <b>Максимальная ставка:</b> 1000 монет

Выберите сумму ставки:`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '10 монет', callback_data: 'slots_bet_10' },
              { text: '50 монет', callback_data: 'slots_bet_50' }
            ],
            [
              { text: '100 монет', callback_data: 'slots_bet_100' },
              { text: '500 монет', callback_data: 'slots_bet_500' }
            ],
            [
              { text: '🔙 К казино', callback_data: 'casino_menu' }
            ]
          ]
        }
      });
      break;
      
    case 'casino_dice':
      ctx.answerCbQuery();
      ctx.editMessageText(`🎲 <b>Кости</b>

💰 <b>Ваш баланс:</b> ${user.coins} монет
🎯 <b>Минимальная ставка:</b> 20 монет
🎯 <b>Максимальная ставка:</b> 1000 монет

Выберите сумму ставки:`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '20 монет', callback_data: 'dice_bet_20' },
              { text: '100 монет', callback_data: 'dice_bet_100' }
            ],
            [
              { text: '500 монет', callback_data: 'dice_bet_500' },
              { text: '1000 монет', callback_data: 'dice_bet_1000' }
            ],
            [
              { text: '🔙 К казино', callback_data: 'casino_menu' }
            ]
          ]
        }
      });
      break;
      
    // Игра в слоты
    case 'slots_bet_10':
    case 'slots_bet_50':
    case 'slots_bet_100':
    case 'slots_bet_500':
      const slotsBet = parseInt(callbackData.split('_')[2]);
      
      if (user.coins < slotsBet) {
        ctx.answerCbQuery('Недостаточно монет!');
        return;
      }
      
      const slotsResult = casinoModule.playSlots(ctx.from.id, slotsBet);
      user.coins -= slotsBet;
      
      if (slotsResult.isWin) {
        user.coins += slotsResult.winAmount;
        addCoins(ctx.from.id, slotsResult.winAmount);
        updateUserStats(ctx.from.id, { casinoPlayed: 1, casinoWon: 1 });
        
        ctx.answerCbQuery(`🎉 Выигрыш! +${slotsResult.winAmount} монет!`);
        ctx.editMessageText(`🎰 <b>Слот-машина</b>

${slotsResult.reels.join(' ')} 

🎉 <b>Выигрыш!</b>
💰 <b>Выиграно:</b> ${slotsResult.winAmount} монет
📈 <b>Множитель:</b> x${slotsResult.multiplier}

💎 <b>Ваш баланс:</b> ${user.coins} монет`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎰 Играть снова', callback_data: 'casino_slots' },
                { text: '🔙 К казино', callback_data: 'casino_menu' }
              ]
            ]
          }
        });
      } else {
        updateUserStats(ctx.from.id, { casinoPlayed: 1 });
        
        ctx.answerCbQuery('😔 Проигрыш');
        ctx.editMessageText(`🎰 <b>Слот-машина</b>

${slotsResult.reels.join(' ')} 

😔 <b>Проигрыш</b>
💰 <b>Потеряно:</b> ${slotsBet} монет

💎 <b>Ваш баланс:</b> ${user.coins} монет`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎰 Играть снова', callback_data: 'casino_slots' },
                { text: '🔙 К казино', callback_data: 'casino_menu' }
              ]
            ]
          }
        });
      }
      break;
      
    // Игра в кости
    case 'dice_bet_20':
    case 'dice_bet_100':
    case 'dice_bet_500':
    case 'dice_bet_1000':
      const diceBet = parseInt(callbackData.split('_')[2]);
      
      if (user.coins < diceBet) {
        ctx.answerCbQuery('Недостаточно монет!');
        return;
      }
      
      ctx.answerCbQuery();
      ctx.editMessageText(`🎲 <b>Кости</b>

💰 <b>Ставка:</b> ${diceBet} монет

Выберите прогноз:
• 🔴 Меньше 7 (сумма 2-6)
• 🔵 Больше 7 (сумма 8-12)`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔴 Меньше 7', callback_data: `dice_play_${diceBet}_low` },
              { text: '🔵 Больше 7', callback_data: `dice_play_${diceBet}_high` }
            ],
            [
              { text: '🔙 К костям', callback_data: 'casino_dice' }
            ]
          ]
        }
      });
      break;
      
    case 'dice_play_20_low':
    case 'dice_play_20_high':
    case 'dice_play_100_low':
    case 'dice_play_100_high':
    case 'dice_play_500_low':
    case 'dice_play_500_high':
    case 'dice_play_1000_low':
    case 'dice_play_1000_high':
      const [, , diceBetAmount, prediction] = callbackData.split('_');
      const diceBetAmountNum = parseInt(diceBetAmount);
      
      if (user.coins < diceBetAmountNum) {
        ctx.answerCbQuery('Недостаточно монет!');
        return;
      }
      
      const diceResult = casinoModule.playDice(ctx.from.id, diceBetAmountNum, prediction);
      user.coins -= diceBetAmountNum;
      
      if (diceResult.isWin) {
        user.coins += diceResult.winAmount;
        addCoins(ctx.from.id, diceResult.winAmount);
        updateUserStats(ctx.from.id, { casinoPlayed: 1, casinoWon: 1 });
        
        ctx.answerCbQuery(`🎉 Выигрыш! +${diceResult.winAmount} монет!`);
        ctx.editMessageText(`🎲 <b>Кости</b>

🎲 <b>Результат:</b> ${diceResult.dice1} + ${diceResult.dice2} = ${diceResult.sum}
🎯 <b>Ваш прогноз:</b> ${prediction === 'low' ? 'Меньше 7' : 'Больше 7'}

🎉 <b>Выигрыш!</b>
💰 <b>Выиграно:</b> ${diceResult.winAmount} монет
📈 <b>Множитель:</b> x${diceResult.multiplier}

💎 <b>Ваш баланс:</b> ${user.coins} монет`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎲 Играть снова', callback_data: 'casino_dice' },
                { text: '🔙 К казино', callback_data: 'casino_menu' }
              ]
            ]
          }
        });
      } else {
        updateUserStats(ctx.from.id, { casinoPlayed: 1 });
        
        ctx.answerCbQuery('😔 Проигрыш');
        ctx.editMessageText(`🎲 <b>Кости</b>

🎲 <b>Результат:</b> ${diceResult.dice1} + ${diceResult.dice2} = ${diceResult.sum}
🎯 <b>Ваш прогноз:</b> ${prediction === 'low' ? 'Меньше 7' : 'Больше 7'}

😔 <b>Проигрыш</b>
💰 <b>Потеряно:</b> ${diceBetAmountNum} монет

💎 <b>Ваш баланс:</b> ${user.coins} монет`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎲 Играть снова', callback_data: 'casino_dice' },
                { text: '🔙 К казино', callback_data: 'casino_menu' }
              ]
            ]
          }
        });
      }
      break;
      
    // Достижения
    case 'achievements':
      ctx.answerCbQuery();
      const userAchievements = achievementsModule.getAllUserAchievements(ctx.from.id);
      const achievementStats = achievementsModule.getAchievementStats(ctx.from.id);
      
      let achievementsText = `🏆 <b>Достижения</b>

📊 <b>Прогресс:</b> ${achievementStats.completed}/${achievementStats.total} (${achievementStats.percentage}%)

🎖️ <b>Полученные достижения:</b>\n`;
      
      if (userAchievements.length === 0) {
        achievementsText += 'Пока нет достижений. Играйте больше!';
      } else {
        userAchievements.slice(0, 5).forEach(achievement => {
          achievementsText += `${achievement.icon} ${achievement.name}\n`;
        });
        if (userAchievements.length > 5) {
          achievementsText += `... и еще ${userAchievements.length - 5}`;
        }
      }
      
      ctx.editMessageText(achievementsText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    // Квесты
    case 'quests':
      ctx.answerCbQuery();
      const activeQuests = questsModule.getActiveQuests(ctx.from.id);
      const questStats = questsModule.getQuestStats(ctx.from.id);
      
      let questsText = `📋 <b>Квесты и задания</b>

📅 <b>Ежедневные:</b> ${questStats.daily.completed}/${questStats.daily.total} (${questStats.daily.percentage}%)
📆 <b>Еженедельные:</b> ${questStats.weekly.completed}/${questStats.weekly.total} (${questStats.weekly.percentage}%)

🎯 <b>Активные квесты:</b>\n`;
      
      if (activeQuests.length === 0) {
        questsText += 'Все квесты завершены! 🎉';
      } else {
        activeQuests.slice(0, 3).forEach(quest => {
          const typeInfo = questsModule.getAllQuests().types[quest.type];
          questsText += `${typeInfo.icon} ${quest.name}\n`;
          questsText += `📈 ${quest.currentProgress}/${quest.target} ${typeInfo.unit}\n`;
          questsText += `💰 Награда: ${quest.reward.coins} монет, ${quest.reward.gems} драгоценных камней\n\n`;
        });
      }
      
      ctx.editMessageText(questsText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    // Турниры
    case 'tournaments':
      ctx.answerCbQuery();
      ctx.editMessageText(`🏆 <b>Турниры</b>

🎯 <b>Доступные турниры:</b>

🆓 <b>Бесплатный турнир</b>
• Участие: Бесплатно
• Призовой фонд: 1000 монет
• Участники: 0/50
• Статус: Активен

💰 <b>Платный турнир</b>
• Участие: 100 монет
• Призовой фонд: 5000 монет
• Участники: 0/20
• Статус: Активен

🎖️ <b>VIP турнир</b>
• Участие: 10 драгоценных камней
• Призовой фонд: 50 драгоценных камней
• Участники: 0/10
• Статус: Активен`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🆓 Участвовать (Бесплатно)', callback_data: 'join_free_tournament' },
              { text: '💰 Участвовать (100 монет)', callback_data: 'join_paid_tournament' }
            ],
            [
              { text: '🎖️ Участвовать (10 драгоценных камней)', callback_data: 'join_vip_tournament' }
            ],
            [
              { text: '📊 Мои турниры', callback_data: 'my_tournaments' },
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    // Магазин
    case 'shop':
      ctx.answerCbQuery();
      ctx.editMessageText(`🛒 <b>Магазин</b>

💰 <b>Ваш баланс:</b> ${user.coins} монет, ${user.gems} драгоценных камней

🛍️ <b>Товары:</b>

💎 <b>Драгоценные камни</b>
• Обмен монет на драгоценные камни
• Покупка за Telegram Stars

🪙 <b>Монеты</b>
• Покупка монет за драгоценные камни
• Разные пакеты с бонусами

🎁 <b>Бонусы</b>
• Двойной доход на 1 час - 50 драгоценных камней
• Удача +50% на 1 час - 30 драгоценных камней
• Экстра опыт на 1 час - 25 драгоценных камней

⭐ <b>Премиум подписка</b>
• Премиум статус на 7 дней - 100 драгоценных камней
• Премиум статус на 30 дней - 350 драгоценных камней`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '💎 Драгоценные камни', callback_data: 'buy_gems' },
              { text: '🪙 Монеты', callback_data: 'buy_coins' }
            ],
            [
              { text: '🎁 Бонусы', callback_data: 'buy_bonuses' },
              { text: '⭐ Премиум', callback_data: 'buy_premium' }
            ],
            [
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    // Таблица лидеров
    case 'leaderboard':
      ctx.answerCbQuery();
      ctx.editMessageText(`📊 <b>Таблица лидеров</b>

🏆 <b>Топ игроков по монетам:</b>
1. 🥇 Игрок #1 - 15,420 монет
2. 🥈 Игрок #2 - 12,350 монет  
3. 🥉 Игрок #3 - 9,800 монет
4. 👤 Игрок #4 - 8,200 монет
5. 👤 Игрок #5 - 7,100 монет

💎 <b>Топ игроков по драгоценным камням:</b>
1. 🥇 Игрок #1 - 250 драгоценных камней
2. 🥈 Игрок #2 - 180 драгоценных камней
3. 🥉 Игрок #3 - 150 драгоценных камней

⭐ <b>Топ игроков по уровню:</b>
1. 🥇 Игрок #1 - 25 уровень
2. 🥈 Игрок #2 - 22 уровень
3. 🥉 Игрок #3 - 20 уровень

📈 <b>Ваша позиция:</b> #${Math.floor(Math.random() * 100) + 1}`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔄 Обновить', callback_data: 'leaderboard' },
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    // Поддержка
    case 'support':
      ctx.answerCbQuery();
      ctx.editMessageText(`❓ <b>Поддержка</b>

👋 <b>Добро пожаловать в службу поддержки!</b>

📞 <b>Способы связи:</b>
• 💬 Telegram: @new_coinmaster_game_bot
• 📧 Email: support@coinmaster.com
• 🌐 Сайт: coinmaster.com/support

🆘 <b>Частые вопросы:</b>
• Как получить монеты?
• Как играть в викторины?
• Как работает казино?
• Как купить драгоценные камни?

📋 <b>Статус сервера:</b> ✅ Работает нормально
🕐 <b>Время ответа:</b> До 24 часов

💡 <b>Совет:</b> Перед обращением проверьте FAQ в главном меню!`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📋 FAQ', callback_data: 'faq' },
              { text: '💬 Написать в поддержку', callback_data: 'contact_support' }
            ],
            [
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    // FAQ
    case 'faq':
      ctx.answerCbQuery();
      ctx.editMessageText(`📋 <b>Часто задаваемые вопросы</b>

❓ <b>Как получить монеты?</b>
• Играйте в викторины
• Играйте в казино
• Используйте кликер игру
• Получайте ежедневные бонусы
• Выполняйте квесты

❓ <b>Как играть в викторины?</b>
• Выберите категорию (Кино, Музыка, Наука, Игры)
• Выберите сложность (Легкая, Средняя, Сложная)
• Отвечайте на вопросы правильно
• Получайте награды за правильные ответы

❓ <b>Как работает казино?</b>
• Делайте ставки на игры
• Слоты: совпадающие символы = выигрыш
• Кости: угадайте сумму больше/меньше 7
• Играйте ответственно!

❓ <b>Как купить драгоценные камни?</b>
• Перейдите в магазин
• Выберите количество драгоценных камней
• Используйте их для покупки бонусов

❓ <b>Что такое достижения?</b>
• Специальные награды за выполнение задач
• Получайте монеты, драгоценные камни и опыт
• Открывайте новые достижения играя`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔙 К поддержке', callback_data: 'support' }
            ]
          ]
        }
      });
      break;
      
    // Контакт с поддержкой
    case 'contact_support':
      ctx.answerCbQuery();
      ctx.editMessageText(`💬 <b>Связаться с поддержкой</b>

📝 <b>Опишите вашу проблему:</b>

Примеры вопросов:
• Не работает викторина
• Проблемы с балансом
• Ошибки в казино
• Вопросы по достижениям
• Технические проблемы

📞 <b>Контакты:</b>
• Telegram: @new_coinmaster_game_bot
• Email: support@coinmaster.com

⏰ <b>Время ответа:</b> До 24 часов
🕐 <b>Рабочие часы:</b> 24/7`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📞 Telegram', url: 'https://t.me/new_coinmaster_game_bot' },
              { text: '📧 Email', url: 'mailto:support@coinmaster.com' }
            ],
            [
              { text: '🔙 К поддержке', callback_data: 'support' }
            ]
          ]
        }
      });
      break;
      
    // Покупка монет
    case 'buy_coins':
      ctx.answerCbQuery();
      ctx.editMessageText(`🛒 <b>Покупка монет</b>

💰 <b>Пакеты монет:</b>

🪙 <b>Базовый пакет</b>
• 1000 монет - 10 драгоценных камней
• Бонус: +100 монет

🪙 <b>Стандартный пакет</b>
• 5000 монет - 45 драгоценных камней
• Бонус: +500 монет

🪙 <b>Премиум пакет</b>
• 10000 монет - 80 драгоценных камней
• Бонус: +1000 монет

🪙 <b>Мега пакет</b>
• 25000 монет - 180 драгоценных камней
• Бонус: +2500 монет`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🪙 Базовый (10💎)', callback_data: 'buy_coins_basic' },
              { text: '🪙 Стандартный (45💎)', callback_data: 'buy_coins_standard' }
            ],
            [
              { text: '🪙 Премиум (80💎)', callback_data: 'buy_coins_premium' },
              { text: '🪙 Мега (180💎)', callback_data: 'buy_coins_mega' }
            ],
            [
              { text: '🔙 К балансу', callback_data: 'balance' }
            ]
          ]
        }
      });
      break;
      
    // Покупка драгоценных камней за Telegram Stars
    case 'buy_gems_stars':
      ctx.answerCbQuery();
      ctx.editMessageText(`💎 <b>Покупка драгоценных камней</b>

⭐ <b>Оплата через Telegram Stars</b>

💎 <b>Доступные пакеты:</b>

💎 <b>Малый пакет</b>
• 10 драгоценных камней
• Цена: 100 ⭐ Telegram Stars
• Бонус: 0 драгоценных камней

💎 <b>Средний пакет</b>
• 50 драгоценных камней
• Цена: 450 ⭐ Telegram Stars
• Бонус: +5 драгоценных камней

💎 <b>Большой пакет</b>
• 100 драгоценных камней
• Цена: 800 ⭐ Telegram Stars
• Бонус: +15 драгоценных камней

💎 <b>Мега пакет</b>
• 250 драгоценных камней
• Цена: 1800 ⭐ Telegram Stars
• Бонус: +50 драгоценных камней

💡 <b>Как купить:</b>
1. Выберите пакет
2. Оплатите через Telegram Stars
3. Получите драгоценные камни мгновенно!`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '💎 Малый (100⭐)', callback_data: 'buy_gems_stars_small' },
              { text: '💎 Средний (450⭐)', callback_data: 'buy_gems_stars_medium' }
            ],
            [
              { text: '💎 Большой (800⭐)', callback_data: 'buy_gems_stars_large' },
              { text: '💎 Мега (1800⭐)', callback_data: 'buy_gems_stars_mega' }
            ],
            [
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    // Покупка драгоценных камней за монеты (старая система)
    case 'buy_gems':
      ctx.answerCbQuery();
      ctx.editMessageText(`💎 <b>Обмен монет на драгоценные камни</b>

💰 <b>Ваш баланс:</b> ${user.coins} монет

💎 <b>Курс обмена:</b>
• 1 драгоценный камень = 10 монет

💎 <b>Пакеты:</b>

💎 <b>Базовый пакет</b>
• 10 драгоценных камней - 100 монет
• Бонус: +1 драгоценный камень

💎 <b>Стандартный пакет</b>
• 50 драгоценных камней - 450 монет
• Бонус: +5 драгоценных камней

💎 <b>Премиум пакет</b>
• 100 драгоценных камней - 800 монет
• Бонус: +10 драгоценных камней`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '💎 Базовый (100🪙)', callback_data: 'buy_gems_basic' },
              { text: '💎 Стандартный (450🪙)', callback_data: 'buy_gems_standard' }
            ],
            [
              { text: '💎 Премиум (800🪙)', callback_data: 'buy_gems_premium' }
            ],
            [
              { text: '🔙 К магазину', callback_data: 'shop' }
            ]
          ]
        }
      });
      break;
      
    // Покупка бонусов
    case 'buy_bonuses':
      ctx.answerCbQuery();
      ctx.editMessageText(`🎁 <b>Покупка бонусов</b>

💎 <b>Ваш баланс:</b> ${user.gems} драгоценных камней

🎁 <b>Доступные бонусы:</b>

⚡ <b>Двойной доход</b>
• Длительность: 1 час
• Эффект: x2 к доходу от всех игр
• Цена: 50 драгоценных камней

🍀 <b>Удача +50%</b>
• Длительность: 1 час
• Эффект: +50% к шансу выигрыша в казино
• Цена: 30 драгоценных камней

📈 <b>Экстра опыт</b>
• Длительность: 1 час
• Эффект: +100% к получаемому опыту
• Цена: 25 драгоценных камней`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '⚡ Двойной доход (50💎)', callback_data: 'buy_bonus_double' },
              { text: '🍀 Удача +50% (30💎)', callback_data: 'buy_bonus_luck' }
            ],
            [
              { text: '📈 Экстра опыт (25💎)', callback_data: 'buy_bonus_exp' }
            ],
            [
              { text: '🔙 К магазину', callback_data: 'shop' }
            ]
          ]
        }
      });
      break;
      
    // Премиум подписка
    case 'buy_premium':
      ctx.answerCbQuery();
      ctx.editMessageText(`⭐ <b>Премиум подписка</b>

💎 <b>Ваш баланс:</b> ${user.gems} драгоценных камней

⭐ <b>Преимущества премиум:</b>
• +50% к доходу от всех игр
• Эксклюзивные достижения
• Приоритетная поддержка
• Ежедневный бонус драгоценных камней
• Доступ к VIP турнирам

📅 <b>Варианты подписки:</b>

⭐ <b>Недельная подписка</b>
• Длительность: 7 дней
• Цена: 100 драгоценных камней
• Бонус: +10 драгоценных камней

⭐ <b>Месячная подписка</b>
• Длительность: 30 дней
• Цена: 350 драгоценных камней
• Бонус: +50 драгоценных камней`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '⭐ Недельная (100💎)', callback_data: 'buy_premium_week' },
              { text: '⭐ Месячная (350💎)', callback_data: 'buy_premium_month' }
            ],
            [
              { text: '🔙 К магазину', callback_data: 'shop' }
            ]
          ]
        }
      });
      break;
      
    // Участие в турнирах
    case 'join_free_tournament':
      ctx.answerCbQuery('🎉 Вы успешно зарегистрированы в бесплатном турнире!');
      ctx.editMessageText(`🏆 <b>Регистрация в турнире</b>

✅ <b>Вы успешно зарегистрированы!</b>

🆓 <b>Бесплатный турнир</b>
• Участие: Бесплатно
• Призовой фонд: 1000 монет
• Участники: 1/50
• Статус: Активен

📅 <b>Турнир начнется:</b> Через 2 часа
⏰ <b>Длительность:</b> 24 часа

💡 <b>Совет:</b> Играйте в викторины и казино для набора очков!`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🏆 Мои турниры', callback_data: 'my_tournaments' },
              { text: '🔙 К турнирам', callback_data: 'tournaments' }
            ]
          ]
        }
      });
      break;
      
    case 'join_paid_tournament':
      if (user.coins < 100) {
        ctx.answerCbQuery('Недостаточно монет! Нужно 100 монет.');
        return;
      }
      user.coins -= 100;
      ctx.answerCbQuery('🎉 Вы успешно зарегистрированы в платном турнире!');
      ctx.editMessageText(`🏆 <b>Регистрация в турнире</b>

✅ <b>Вы успешно зарегистрированы!</b>

💰 <b>Платный турнир</b>
• Участие: 100 монет ✅
• Призовой фонд: 5000 монет
• Участники: 1/20
• Статус: Активен

📅 <b>Турнир начнется:</b> Через 1 час
⏰ <b>Длительность:</b> 12 часов

💎 <b>Ваш баланс:</b> ${user.coins} монет`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🏆 Мои турниры', callback_data: 'my_tournaments' },
              { text: '🔙 К турнирам', callback_data: 'tournaments' }
            ]
          ]
        }
      });
      break;
      
    case 'join_vip_tournament':
      if (user.gems < 10) {
        ctx.answerCbQuery('Недостаточно драгоценных камней! Нужно 10 драгоценных камней.');
        return;
      }
      user.gems -= 10;
      ctx.answerCbQuery('🎉 Вы успешно зарегистрированы в VIP турнире!');
      ctx.editMessageText(`🏆 <b>Регистрация в турнире</b>

✅ <b>Вы успешно зарегистрированы!</b>

🎖️ <b>VIP турнир</b>
• Участие: 10 драгоценных камней ✅
• Призовой фонд: 50 драгоценных камней
• Участники: 1/10
• Статус: Активен

📅 <b>Турнир начнется:</b> Через 30 минут
⏰ <b>Длительность:</b> 6 часов

💎 <b>Ваш баланс:</b> ${user.gems} драгоценных камней`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🏆 Мои турниры', callback_data: 'my_tournaments' },
              { text: '🔙 К турнирам', callback_data: 'tournaments' }
            ]
          ]
        }
      });
      break;
      
    // Мои турниры
    case 'my_tournaments':
      ctx.answerCbQuery();
      ctx.editMessageText(`🏆 <b>Мои турниры</b>

📊 <b>Активные турниры:</b>

🆓 <b>Бесплатный турнир</b>
• Позиция: #1 из 50
• Очки: 0
• Время до окончания: 23:45

💰 <b>Платный турнир</b>
• Позиция: #1 из 20
• Очки: 0
• Время до окончания: 11:30

🎖️ <b>VIP турнир</b>
• Позиция: #1 из 10
• Очки: 0
• Время до окончания: 5:45

📈 <b>Общая статистика:</b>
• Турниров сыграно: 0
• Побед: 0
• Призовых мест: 0`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔄 Обновить', callback_data: 'my_tournaments' },
              { text: '🔙 К турнирам', callback_data: 'tournaments' }
            ]
          ]
        }
      });
      break;
      
    // Покупка пакетов монет
    case 'buy_coins_basic':
      if (user.gems < 10) {
        ctx.answerCbQuery('Недостаточно драгоценных камней!');
        return;
      }
      user.gems -= 10;
      user.coins += 1100; // 1000 + 100 бонус
      ctx.answerCbQuery('✅ Куплен базовый пакет монет!');
      ctx.editMessageText(`🪙 <b>Покупка монет</b>

✅ <b>Успешно куплено!</b>

🪙 <b>Базовый пакет</b>
• Получено: 1100 монет (1000 + 100 бонус)
• Потрачено: 10 драгоценных камней

💎 <b>Ваш баланс:</b>
🪙 Монеты: ${user.coins}
💎 Драгоценные камни: ${user.gems}`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🛒 Еще покупки', callback_data: 'buy_coins' },
              { text: '🔙 К балансу', callback_data: 'balance' }
            ]
          ]
        }
      });
      break;
      
    case 'buy_coins_standard':
      if (user.gems < 45) {
        ctx.answerCbQuery('Недостаточно драгоценных камней!');
        return;
      }
      user.gems -= 45;
      user.coins += 5500; // 5000 + 500 бонус
      ctx.answerCbQuery('✅ Куплен стандартный пакет монет!');
      ctx.editMessageText(`🪙 <b>Покупка монет</b>

✅ <b>Успешно куплено!</b>

🪙 <b>Стандартный пакет</b>
• Получено: 5500 монет (5000 + 500 бонус)
• Потрачено: 45 драгоценных камней

💎 <b>Ваш баланс:</b>
🪙 Монеты: ${user.coins}
💎 Драгоценные камни: ${user.gems}`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🛒 Еще покупки', callback_data: 'buy_coins' },
              { text: '🔙 К балансу', callback_data: 'balance' }
            ]
          ]
        }
      });
      break;
      
    case 'buy_coins_premium':
      if (user.gems < 80) {
        ctx.answerCbQuery('Недостаточно драгоценных камней!');
        return;
      }
      user.gems -= 80;
      user.coins += 11000; // 10000 + 1000 бонус
      ctx.answerCbQuery('✅ Куплен премиум пакет монет!');
      ctx.editMessageText(`🪙 <b>Покупка монет</b>

✅ <b>Успешно куплено!</b>

🪙 <b>Премиум пакет</b>
• Получено: 11000 монет (10000 + 1000 бонус)
• Потрачено: 80 драгоценных камней

💎 <b>Ваш баланс:</b>
🪙 Монеты: ${user.coins}
💎 Драгоценные камни: ${user.gems}`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🛒 Еще покупки', callback_data: 'buy_coins' },
              { text: '🔙 К балансу', callback_data: 'balance' }
            ]
          ]
        }
      });
      break;
      
    case 'buy_coins_mega':
      if (user.gems < 180) {
        ctx.answerCbQuery('Недостаточно драгоценных камней!');
        return;
      }
      user.gems -= 180;
      user.coins += 27500; // 25000 + 2500 бонус
      ctx.answerCbQuery('✅ Куплен мега пакет монет!');
      ctx.editMessageText(`🪙 <b>Покупка монет</b>

✅ <b>Успешно куплено!</b>

🪙 <b>Мега пакет</b>
• Получено: 27500 монет (25000 + 2500 бонус)
• Потрачено: 180 драгоценных камней

💎 <b>Ваш баланс:</b>
🪙 Монеты: ${user.coins}
💎 Драгоценные камни: ${user.gems}`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🛒 Еще покупки', callback_data: 'buy_coins' },
              { text: '🔙 К балансу', callback_data: 'balance' }
            ]
          ]
        }
      });
      break;
      
    // Реферальная система
    case 'referral_system':
      ctx.answerCbQuery();
      const referralStats = referralService.getReferralStats(ctx.from.id);
      const referralLink = referralService.getReferralLink(ctx.from.id);
      
      ctx.editMessageText(`👥 <b>Реферальная система</b>

🔗 <b>Ваша реферальная ссылка:</b>
<code>${referralLink}</code>

📊 <b>Ваша статистика:</b>
• Рефералов привлечено: ${referralStats.referralCount}
• Заработано драгоценных камней: ${referralStats.totalEarnings.gems}
• Заработано монет: ${referralStats.totalEarnings.coins}
• Достижений: ${referralStats.milestones.length}

🎁 <b>Награды за рефералов:</b>
• За каждого реферала: 5💎 + 100🪙
• Достижения за количество рефералов

🏆 <b>Достижения:</b>
• 5 рефералов: 25💎 + 500🪙
• 10 рефералов: 50💎 + 1000🪙
• 25 рефералов: 100💎 + 2500🪙
• 50 рефералов: 200💎 + 5000🪙

💡 <b>Как работает:</b>
1. Поделитесь ссылкой с друзьями
2. Они регистрируются по вашей ссылке
3. Вы получаете награды за каждого реферала!`, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📋 Поделиться ссылкой', url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=🎮 Присоединяйся к CoinMaster - игровому боту с внутренней валютой!` }
            ],
            [
              { text: '🏆 Топ рекрутеров', callback_data: 'top_recruiters' },
              { text: '📊 Мои рефералы', callback_data: 'my_referrals' }
            ],
            [
              { text: '🔙 Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      });
      break;
      
    // Топ рекрутеров
    case 'top_recruiters':
      ctx.answerCbQuery();
      const topRecruiters = referralService.getTopRecruiters(10);
      
      let topText = `🏆 <b>Топ рекрутеров</b>

📊 <b>Лучшие по количеству рефералов:</b>\n`;
      
      if (topRecruiters.length === 0) {
        topText += 'Пока нет рекрутеров. Станьте первым!';
      } else {
        topRecruiters.forEach((recruiter, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
          topText += `${medal} ${index + 1}. Рефералов: ${recruiter.referralCount}\n`;
          topText += `   💎 Заработано: ${recruiter.totalEarnings.gems}\n`;
          topText += `   🪙 Заработано: ${recruiter.totalEarnings.coins}\n\n`;
        });
      }
      
      ctx.editMessageText(topText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔙 К реферальной системе', callback_data: 'referral_system' }
            ]
          ]
        }
      });
      break;
      
    // Мои рефералы
    case 'my_referrals':
      ctx.answerCbQuery();
      const myReferrals = referralService.getReferralStats(ctx.from.id);
      
      let referralsText = `👥 <b>Мои рефералы</b>

📊 <b>Общая статистика:</b>
• Всего рефералов: ${myReferrals.referralCount}
• Заработано драгоценных камней: ${myReferrals.totalEarnings.gems}
• Заработано монет: ${myReferrals.totalEarnings.coins}

🎯 <b>Достижения:</b>`;
      
      if (myReferrals.milestones.length === 0) {
        referralsText += '\nПока нет достижений. Привлекайте больше рефералов!';
      } else {
        myReferrals.milestones.forEach(milestone => {
          referralsText += `\n✅ ${milestone} рефералов`;
        });
      }
      
      referralsText += `\n\n🔗 <b>Ваша ссылка:</b>
<code>${referralService.getReferralLink(ctx.from.id)}</code>`;
      
      ctx.editMessageText(referralsText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔙 К реферальной системе', callback_data: 'referral_system' }
            ]
          ]
        }
      });
      break;
      
    // Покупка драгоценных камней за Telegram Stars
    case 'buy_gems_stars_small':
      telegramStarsService.sendInvoice(ctx, 'gems_small');
      break;
      
    case 'buy_gems_stars_medium':
      telegramStarsService.sendInvoice(ctx, 'gems_medium');
      break;
      
    case 'buy_gems_stars_large':
      telegramStarsService.sendInvoice(ctx, 'gems_large');
      break;
      
    case 'buy_gems_stars_mega':
      telegramStarsService.sendInvoice(ctx, 'gems_mega');
      break;
      
    case 'cancel_payment':
      ctx.answerCbQuery('Платеж отменен');
      ctx.editMessageText('💎 <b>Покупка драгоценных камней</b>

Платеж отменен. Вы можете попробовать снова или выбрать другой способ оплаты.', {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔙 К покупке драгоценных камней', callback_data: 'buy_gems_stars' }
            ]
          ]
        }
      });
      break;
      
    default:
      ctx.answerCbQuery('🚧 Функция в разработке!');
  }
});

// Вспомогательные функции
function getCategoryName(category) {
  const names = {
    movies: 'Кино',
    music: 'Музыка',
    science: 'Наука',
    games: 'Игры'
  };
  return names[category] || category;
}

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже или обратитесь в поддержку.');
});

// Настройка для Vercel
if (process.env.NODE_ENV === 'production') {
  // Вебхук для продакшена
  app.post('/webhook', (req, res) => {
    bot.handleUpdate(req.body);
    res.status(200).send('OK');
  });
  
  // Главная страница
  app.get('/', (req, res) => {
    res.json({
      message: 'CoinMaster Bot is running!',
      bot: '@new_coinmaster_game_bot',
      status: 'active'
    });
  });
  
  // Запуск сервера
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 CoinMaster Bot running on port ${PORT}`);
  });
} else {
  // Обычный запуск для разработки
  console.log('🚀 Запуск CoinMaster Bot в режиме разработки...');
  console.log('🤖 Бот: @new_coinmaster_game_bot');
  console.log('📱 Найдите бота в Telegram и отправьте /start');
  
  bot.launch().then(() => {
    console.log('✅ Бот успешно запущен!');
  }).catch((error) => {
    console.error('❌ Ошибка запуска бота:', error);
  });
}

module.exports = app;