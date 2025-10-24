const DatabaseService = require('../services/DatabaseService');
const RedisService = require('../services/RedisService');

// Показ меню казино
const showCasinoMenu = async (ctx) => {
  const user = ctx.user;
  
  // Проверяем дневной лимит потерь
  const dailyLoss = await RedisService.getCasinoLimit(user.id);
  const maxDailyLoss = parseInt(process.env.MAX_DAILY_CASINO_LOSS) || 5000;
  
  const casinoText = `🎰 <b>Казино игры</b>

💰 <b>Ваш баланс:</b> ${user.coins} монет
📊 <b>Потери сегодня:</b> ${dailyLoss}/${maxDailyLoss} монет

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

⚠️ <b>Предупреждение:</b> Играйте ответственно!`;

  const keyboard = {
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
        { text: '📊 Статистика', callback_data: 'casino_stats' },
        { text: '🔙 Главное меню', callback_data: 'main_menu' }
      ]
    ]
  };

  await ctx.editMessageText(casinoText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Обработка callback-ов казино
const handleCallback = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  
  switch (callbackData) {
    case 'casino_slots':
      await showSlotsMenu(ctx);
      break;
    case 'casino_dice':
      await showDiceMenu(ctx);
      break;
    case 'casino_roulette':
      await showRouletteMenu(ctx);
      break;
    case 'casino_blackjack':
      await showBlackjackMenu(ctx);
      break;
    case 'casino_stats':
      await showCasinoStats(ctx);
      break;
    case 'casino_menu':
      await showCasinoMenu(ctx);
      break;
    default:
      if (callbackData.startsWith('casino_play_')) {
        await playCasinoGame(ctx);
      }
  }
};

// Слот-машина
const showSlotsMenu = async (ctx) => {
  const slotsText = `🎰 <b>Слот-машина</b>

💰 <b>Ваш баланс:</b> ${ctx.user.coins} монет

🎯 <b>Правила:</b>
• Выберите ставку от 10 до 1000 монет
• Нажмите "Крутить!" для игры
• 3 одинаковых символа = выигрыш!

🎁 <b>Выплаты:</b>
• 🍒🍒🍒 = x2 ставки
• 🍋🍋🍋 = x3 ставки  
• 🍇🍇🍇 = x5 ставки
• 💎💎💎 = x10 ставки
• 🍀🍀🍀 = x20 ставки`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '10 монет', callback_data: 'casino_play_slots_10' },
        { text: '50 монет', callback_data: 'casino_play_slots_50' },
        { text: '100 монет', callback_data: 'casino_play_slots_100' }
      ],
      [
        { text: '500 монет', callback_data: 'casino_play_slots_500' },
        { text: '1000 монет', callback_data: 'casino_play_slots_1000' }
      ],
      [
        { text: '🔙 Назад', callback_data: 'casino_menu' }
      ]
    ]
  };

  await ctx.editMessageText(slotsText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Кости
const showDiceMenu = async (ctx) => {
  const diceText = `🎲 <b>Кости</b>

💰 <b>Ваш баланс:</b> ${ctx.user.coins} монет

🎯 <b>Правила:</b>
• Выберите ставку от 20 до 1000 монет
• Угадайте, будет ли сумма больше или меньше 7
• Выигрыш = x2 ставки

🎁 <b>Результаты:</b>
• 2-6 = Меньше 7
• 7 = Ничья (возврат ставки)
• 8-12 = Больше 7`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '20 монет', callback_data: 'casino_play_dice_20' },
        { text: '50 монет', callback_data: 'casino_play_dice_50' },
        { text: '100 монет', callback_data: 'casino_play_dice_100' }
      ],
      [
        { text: '500 монет', callback_data: 'casino_play_dice_500' },
        { text: '1000 монет', callback_data: 'casino_play_dice_1000' }
      ],
      [
        { text: '🔙 Назад', callback_data: 'casino_menu' }
      ]
    ]
  };

  await ctx.editMessageText(diceText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Рулетка
const showRouletteMenu = async (ctx) => {
  const rouletteText = `🎯 <b>Рулетка</b>

💰 <b>Ваш баланс:</b> ${ctx.user.coins} монет

🎯 <b>Правила:</b>
• Выберите ставку от 50 до 1000 монет
• Угадайте цвет: красный или черный
• Выигрыш = x2 ставки

🎁 <b>Результаты:</b>
• 🔴 Красный = выигрыш
• ⚫ Черный = выигрыш
• 🟢 Зеленый = проигрыш`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '50 монет', callback_data: 'casino_play_roulette_50' },
        { text: '100 монет', callback_data: 'casino_play_roulette_100' },
        { text: '200 монет', callback_data: 'casino_play_roulette_200' }
      ],
      [
        { text: '500 монет', callback_data: 'casino_play_roulette_500' },
        { text: '1000 монет', callback_data: 'casino_play_roulette_1000' }
      ],
      [
        { text: '🔙 Назад', callback_data: 'casino_menu' }
      ]
    ]
  };

  await ctx.editMessageText(rouletteText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  );
};

// Блэкджек
const showBlackjackMenu = async (ctx) => {
  const blackjackText = `🃏 <b>Блэкджек</b>

💰 <b>Ваш баланс:</b> ${ctx.user.coins} монет

🎯 <b>Правила:</b>
• Выберите ставку от 100 до 1000 монет
• Цель: набрать 21 очко или ближе к 21, чем дилер
• Выигрыш = x2 ставки, блэкджек = x2.5 ставки

🎁 <b>Карты:</b>
• Туз = 1 или 11 очков
• Король, Дама, Валет = 10 очков
• Остальные = номинал`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '100 монет', callback_data: 'casino_play_blackjack_100' },
        { text: '200 монет', callback_data: 'casino_play_blackjack_200' },
        { text: '500 монет', callback_data: 'casino_play_blackjack_500' }
      ],
      [
        { text: '1000 монет', callback_data: 'casino_play_blackjack_1000' }
      ],
      [
        { text: '🔙 Назад', callback_data: 'casino_menu' }
      ]
    ]
  };

  await ctx.editMessageText(blackjackText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Игра в казино
const playCasinoGame = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const parts = callbackData.replace('casino_play_', '').split('_');
  const gameType = parts[0];
  const betAmount = parseInt(parts[1]);
  
  const user = ctx.user;
  
  try {
    // Проверяем баланс
    if (user.coins < betAmount) {
      await ctx.answerCbQuery('❌ Недостаточно монет!');
      return;
    }
    
    // Проверяем дневной лимит потерь
    const dailyLoss = await RedisService.getCasinoLimit(user.id);
    const maxDailyLoss = parseInt(process.env.MAX_DAILY_CASINO_LOSS) || 5000;
    
    if (dailyLoss >= maxDailyLoss) {
      await ctx.answerCbQuery('❌ Достигнут дневной лимит потерь!');
      return;
    }
    
    // Играем в игру
    let result;
    switch (gameType) {
      case 'slots':
        result = playSlots(betAmount);
        break;
      case 'dice':
        result = playDice(betAmount);
        break;
      case 'roulette':
        result = playRoulette(betAmount);
        break;
      case 'blackjack':
        result = playBlackjack(betAmount);
        break;
      default:
        await ctx.answerCbQuery('❌ Неизвестная игра');
        return;
    }
    
    // Обновляем баланс
    const newBalance = user.coins - betAmount + result.winAmount;
    await DatabaseService.updateUser(user.id, {
      coins: newBalance
    });
    
    // Записываем игру
    await DatabaseService.createCasinoGame(
      user.id,
      gameType,
      betAmount,
      result,
      result.winAmount
    );
    
    // Добавляем транзакции
    await DatabaseService.addTransaction(
      user.id,
      'spend',
      betAmount,
      'coins',
      `Ставка в ${gameType}`
    );
    
    if (result.winAmount > 0) {
      await DatabaseService.addTransaction(
        user.id,
        'earn',
        result.winAmount,
        'coins',
        `Выигрыш в ${gameType}`
      );
    }
    
    // Обновляем статистику
    await DatabaseService.updateUserStats(user.id, {
      casino_games_played: 1,
      casino_winnings: result.winAmount
    });
    
    // Обновляем дневной лимит потерь
    if (result.winAmount < betAmount) {
      await RedisService.setCasinoLimit(user.id, betAmount - result.winAmount);
    }
    
    // Показываем результат
    await showGameResult(ctx, gameType, betAmount, result);
    
  } catch (error) {
    console.error('Play casino game error:', error);
    await ctx.answerCbQuery('❌ Ошибка при игре');
  }
};

// Игра в слоты
function playSlots(betAmount) {
  const symbols = ['🍒', '🍋', '🍇', '💎', '🍀'];
  const reels = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];
  
  const isWin = reels[0] === reels[1] && reels[1] === reels[2];
  
  let multiplier = 0;
  if (isWin) {
    const symbol = reels[0];
    switch (symbol) {
      case '🍒': multiplier = 2; break;
      case '🍋': multiplier = 3; break;
      case '🍇': multiplier = 5; break;
      case '💎': multiplier = 10; break;
      case '🍀': multiplier = 20; break;
    }
  }
  
  return {
    reels,
    isWin,
    winAmount: betAmount * multiplier,
    multiplier
  };
}

// Игра в кости
function playDice(betAmount) {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const sum = dice1 + dice2;
  
  let isWin = false;
  let multiplier = 0;
  
  if (sum < 7) {
    isWin = true;
    multiplier = 2;
  } else if (sum > 7) {
    isWin = true;
    multiplier = 2;
  } else {
    // Ничья - возврат ставки
    multiplier = 1;
  }
  
  return {
    dice1,
    dice2,
    sum,
    isWin,
    winAmount: betAmount * multiplier,
    multiplier
  };
}

// Игра в рулетку
function playRoulette(betAmount) {
  const number = Math.floor(Math.random() * 37); // 0-36
  let color = '🟢'; // Зеленый (0)
  
  if (number >= 1 && number <= 18) {
    color = '🔴'; // Красный
  } else if (number >= 19 && number <= 36) {
    color = '⚫'; // Черный
  }
  
  const isWin = color !== '🟢';
  const multiplier = isWin ? 2 : 0;
  
  return {
    number,
    color,
    isWin,
    winAmount: betAmount * multiplier,
    multiplier
  };
}

// Игра в блэкджек
function playBlackjack(betAmount) {
  // Простая версия блэкджека
  const playerCards = [Math.floor(Math.random() * 13) + 1, Math.floor(Math.random() * 13) + 1];
  const dealerCards = [Math.floor(Math.random() * 13) + 1, Math.floor(Math.random() * 13) + 1];
  
  const playerScore = calculateBlackjackScore(playerCards);
  const dealerScore = calculateBlackjackScore(dealerCards);
  
  let isWin = false;
  let multiplier = 0;
  
  if (playerScore > 21) {
    // Перебор
    multiplier = 0;
  } else if (dealerScore > 21) {
    // Дилер перебрал
    isWin = true;
    multiplier = 2;
  } else if (playerScore > dealerScore) {
    // Игрок выиграл
    isWin = true;
    multiplier = playerScore === 21 ? 2.5 : 2; // Блэкджек
  } else if (playerScore === dealerScore) {
    // Ничья
    multiplier = 1;
  } else {
    // Дилер выиграл
    multiplier = 0;
  }
  
  return {
    playerCards,
    dealerCards,
    playerScore,
    dealerScore,
    isWin,
    winAmount: betAmount * multiplier,
    multiplier
  };
}

// Подсчет очков в блэкджеке
function calculateBlackjackScore(cards) {
  let score = 0;
  let aces = 0;
  
  for (const card of cards) {
    if (card === 1) {
      aces++;
      score += 11;
    } else if (card >= 11) {
      score += 10;
    } else {
      score += card;
    }
  }
  
  // Обработка тузов
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  
  return score;
}

// Показ результата игры
const showGameResult = async (ctx, gameType, betAmount, result) => {
  let resultText = '';
  let gameName = '';
  
  switch (gameType) {
    case 'slots':
      gameName = 'Слот-машина';
      resultText = `🎰 <b>Результат игры</b>

${result.reels.join(' | ')}

${result.isWin ? '🎉 Выигрыш!' : '😔 Проигрыш'}
💰 Ставка: ${betAmount} монет
${result.isWin ? `🎁 Выигрыш: ${result.winAmount} монет (x${result.multiplier})` : ''}`;
      break;
      
    case 'dice':
      gameName = 'Кости';
      resultText = `🎲 <b>Результат игры</b>

🎲 ${result.dice1} + ${result.dice2} = ${result.sum}

${result.isWin ? '🎉 Выигрыш!' : result.multiplier === 1 ? '🤝 Ничья' : '😔 Проигрыш'}
💰 Ставка: ${betAmount} монет
${result.winAmount > 0 ? `🎁 Выигрыш: ${result.winAmount} монет` : ''}`;
      break;
      
    case 'roulette':
      gameName = 'Рулетка';
      resultText = `🎯 <b>Результат игры</b>

🎯 Выпало: ${result.number} ${result.color}

${result.isWin ? '🎉 Выигрыш!' : '😔 Проигрыш'}
💰 Ставка: ${betAmount} монет
${result.isWin ? `🎁 Выигрыш: ${result.winAmount} монет` : ''}`;
      break;
      
    case 'blackjack':
      gameName = 'Блэкджек';
      resultText = `🃏 <b>Результат игры</b>

👤 Ваши карты: ${result.playerCards.join(', ')} (${result.playerScore})
🤖 Дилер: ${result.dealerCards.join(', ')} (${result.dealerScore})

${result.isWin ? '🎉 Выигрыш!' : result.multiplier === 1 ? '🤝 Ничья' : '😔 Проигрыш'}
💰 Ставка: ${betAmount} монет
${result.winAmount > 0 ? `🎁 Выигрыш: ${result.winAmount} монет` : ''}`;
      break;
  }
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🎮 Играть еще', callback_data: `casino_${gameType}` },
        { text: '🔙 Казино', callback_data: 'casino_menu' }
      ]
    ]
  };
  
  await ctx.editMessageText(resultText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
  
  await ctx.answerCbQuery(result.isWin ? '🎉 Выигрыш!' : '😔 Проигрыш');
};

// Статистика казино
const showCasinoStats = async (ctx) => {
  const user = ctx.user;
  
  // Получаем статистику казино
  const stats = await DatabaseService.query(
    `SELECT 
      COUNT(*) as games_played,
      SUM(bet_amount) as total_bet,
      SUM(win_amount) as total_winnings,
      AVG(win_amount) as avg_winnings
    FROM casino_games 
    WHERE user_id = $1`,
    [user.id]
  );
  
  const casinoStats = stats.rows[0] || {};
  
  const statsText = `📊 <b>Статистика казино</b>

🎮 <b>Игр сыграно:</b> ${casinoStats.games_played || 0}
💰 <b>Общая ставка:</b> ${casinoStats.total_bet || 0} монет
🎁 <b>Общий выигрыш:</b> ${casinoStats.total_winnings || 0} монет
📈 <b>Средний выигрыш:</b> ${Math.floor(casinoStats.avg_winnings || 0)} монет

💡 <b>Совет:</b> Играйте ответственно!`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔙 Назад', callback_data: 'casino_menu' }
      ]
    ]
  };

  await ctx.editMessageText(statsText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

module.exports = {
  showCasinoMenu,
  handleCallback
};
