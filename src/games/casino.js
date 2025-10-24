// Модуль казино игр с полной логикой
const casinoGames = {
  // Слот-машина
  slots: {
    minBet: 10,
    maxBet: 1000,
    symbols: ['🍒', '🍋', '🍇', '💎', '🍀', '⭐', '🎰', '💰'],
    payouts: {
      '🍒🍒🍒': 2,
      '🍋🍋🍋': 3,
      '🍇🍇🍇': 5,
      '💎💎💎': 10,
      '🍀🍀🍀': 20,
      '⭐⭐⭐': 15,
      '🎰🎰🎰': 25,
      '💰💰💰': 50
    },
    play: function(betAmount) {
      const reels = [
        this.symbols[Math.floor(Math.random() * this.symbols.length)],
        this.symbols[Math.floor(Math.random() * this.symbols.length)],
        this.symbols[Math.floor(Math.random() * this.symbols.length)]
      ];

      const combination = reels.join('');
      const multiplier = this.payouts[combination] || 0;
      const winAmount = betAmount * multiplier;

      return {
        reels,
        combination,
        multiplier,
        winAmount,
        isWin: multiplier > 0
      };
    }
  },

  // Кости
  dice: {
    minBet: 20,
    maxBet: 1000,
    play: function(betAmount, prediction) {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const sum = dice1 + dice2;

      let isWin = false;
      let multiplier = 0;

      if (prediction === 'low' && sum < 7) {
        isWin = true;
        multiplier = 2;
      } else if (prediction === 'high' && sum > 7) {
        isWin = true;
        multiplier = 2;
      } else if (sum === 7) {
        multiplier = 1; // Ничья - возврат ставки
      }

      const winAmount = betAmount * multiplier;

      return {
        dice1,
        dice2,
        sum,
        prediction,
        multiplier,
        winAmount,
        isWin: multiplier > 1
      };
    }
  },

  // Рулетка
  roulette: {
    minBet: 50,
    maxBet: 1000,
    colors: ['🔴', '⚫', '🟢'],
    numbers: Array.from({length: 37}, (_, i) => i), // 0-36
    play: function(betAmount, betType, betValue) {
      const winningNumber = this.numbers[Math.floor(Math.random() * this.numbers.length)];
      let color = '🟢'; // Зеленый (0)
      
      if (winningNumber >= 1 && winningNumber <= 18) {
        color = '🔴'; // Красный
      } else if (winningNumber >= 19 && winningNumber <= 36) {
        color = '⚫'; // Черный
      }

      let isWin = false;
      let multiplier = 0;

      switch (betType) {
        case 'red':
          isWin = color === '🔴';
          multiplier = isWin ? 2 : 0;
          break;
        case 'black':
          isWin = color === '⚫';
          multiplier = isWin ? 2 : 0;
          break;
        case 'number':
          isWin = winningNumber === betValue;
          multiplier = isWin ? 36 : 0;
          break;
        case 'even':
          isWin = winningNumber > 0 && winningNumber % 2 === 0;
          multiplier = isWin ? 2 : 0;
          break;
        case 'odd':
          isWin = winningNumber > 0 && winningNumber % 2 === 1;
          multiplier = isWin ? 2 : 0;
          break;
      }

      const winAmount = betAmount * multiplier;

      return {
        winningNumber,
        color,
        betType,
        betValue,
        multiplier,
        winAmount,
        isWin
      };
    }
  },

  // Блэкджек
  blackjack: {
    minBet: 100,
    maxBet: 1000,
    play: function(betAmount) {
      // Простая версия блэкджека
      const playerCards = [
        Math.floor(Math.random() * 13) + 1,
        Math.floor(Math.random() * 13) + 1
      ];
      const dealerCards = [
        Math.floor(Math.random() * 13) + 1,
        Math.floor(Math.random() * 13) + 1
      ];

      const playerScore = this.calculateScore(playerCards);
      const dealerScore = this.calculateScore(dealerCards);

      let result = '';
      let multiplier = 0;

      if (playerScore > 21) {
        result = 'Перебор';
        multiplier = 0;
      } else if (dealerScore > 21) {
        result = 'Дилер перебрал';
        multiplier = 2;
      } else if (playerScore > dealerScore) {
        result = 'Выигрыш';
        multiplier = playerScore === 21 ? 2.5 : 2; // Блэкджек
      } else if (playerScore === dealerScore) {
        result = 'Ничья';
        multiplier = 1;
      } else {
        result = 'Проигрыш';
        multiplier = 0;
      }

      const winAmount = betAmount * multiplier;

      return {
        playerCards,
        dealerCards,
        playerScore,
        dealerScore,
        result,
        multiplier,
        winAmount,
        isWin: multiplier > 1
      };
    },

    calculateScore: function(cards) {
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
  }
};

// Активные игры
const activeGames = new Map();

// Начало игры
function startGame(userId, gameType, betAmount, gameData = {}) {
  const game = casinoGames[gameType];
  if (!game) return null;

  if (betAmount < game.minBet || betAmount > game.maxBet) {
    return { error: 'Неверная сумма ставки' };
  }

  const gameId = `${userId}_${Date.now()}`;
  const gameSession = {
    userId,
    gameType,
    betAmount,
    gameData,
    startTime: Date.now()
  };

  activeGames.set(gameId, gameSession);
  return gameId;
}

// Игра в слоты
function playSlots(userId, betAmount) {
  const gameId = startGame(userId, 'slots', betAmount);
  if (!gameId) return null;

  const result = casinoGames.slots.play(betAmount);
  activeGames.delete(gameId);

  return {
    gameType: 'slots',
    betAmount,
    ...result
  };
}

// Игра в кости
function playDice(userId, betAmount, prediction) {
  const gameId = startGame(userId, 'dice', betAmount, { prediction });
  if (!gameId) return null;

  const result = casinoGames.dice.play(betAmount, prediction);
  activeGames.delete(gameId);

  return {
    gameType: 'dice',
    betAmount,
    ...result
  };
}

// Игра в рулетку
function playRoulette(userId, betAmount, betType, betValue = null) {
  const gameId = startGame(userId, 'roulette', betAmount, { betType, betValue });
  if (!gameId) return null;

  const result = casinoGames.roulette.play(betAmount, betType, betValue);
  activeGames.delete(gameId);

  return {
    gameType: 'roulette',
    betAmount,
    ...result
  };
}

// Игра в блэкджек
function playBlackjack(userId, betAmount) {
  const gameId = startGame(userId, 'blackjack', betAmount);
  if (!gameId) return null;

  const result = casinoGames.blackjack.play(betAmount);
  activeGames.delete(gameId);

  return {
    gameType: 'blackjack',
    betAmount,
    ...result
  };
}

// Получение информации об игре
function getGameInfo(gameType) {
  const game = casinoGames[gameType];
  if (!game) return null;

  return {
    minBet: game.minBet,
    maxBet: game.maxBet,
    description: getGameDescription(gameType)
  };
}

// Описание игр
function getGameDescription(gameType) {
  const descriptions = {
    slots: 'Крутите барабаны и выигрывайте при совпадении символов!',
    dice: 'Угадайте, будет ли сумма больше или меньше 7.',
    roulette: 'Ставьте на цвет, число или четность.',
    blackjack: 'Наберите 21 очко или ближе к 21, чем дилер.'
  };
  return descriptions[gameType] || '';
}

// Проверка активной игры
function hasActiveGame(userId) {
  for (const [gameId, session] of activeGames) {
    if (session.userId === userId) {
      return gameId;
    }
  }
  return null;
}

// Очистка старых игр
function cleanupOldGames() {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 минут

  for (const [gameId, session] of activeGames) {
    if (now - session.startTime > maxAge) {
      activeGames.delete(gameId);
    }
  }
}

// Запуск очистки каждые 5 минут
setInterval(cleanupOldGames, 5 * 60 * 1000);

module.exports = {
  casinoGames,
  playSlots,
  playDice,
  playRoulette,
  playBlackjack,
  getGameInfo,
  hasActiveGame,
  cleanupOldGames
};
