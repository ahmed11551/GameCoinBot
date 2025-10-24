const DatabaseService = require('../services/DatabaseService');
const RedisService = require('../services/RedisService');

// Показ меню кликер игры
const showClickerMenu = async (ctx) => {
  const user = ctx.user;
  
  // Получаем улучшения пользователя
  const upgrades = await DatabaseService.query(
    'SELECT * FROM clicker_upgrades WHERE user_id = $1',
    [user.id]
  );
  
  const upgradesMap = {};
  upgrades.rows.forEach(upgrade => {
    upgradesMap[upgrade.upgrade_type] = upgrade.level;
  });
  
  // Получаем активную сессию
  const session = await RedisService.getClickerSession(user.id);
  
  const clickerText = `👆 <b>Кликер игра</b>

💰 <b>Доход за клик:</b> ${calculateClickValue(upgradesMap)} монет
⚡ <b>Автокликер:</b> ${calculateAutoClickValue(upgradesMap)} монет/сек
🪙 <b>Монеты в сессии:</b> ${session ? session.coinsEarned : 0}
👆 <b>Кликов в сессии:</b> ${session ? session.clicks : 0}

🔧 <b>Ваши улучшения:</b>
• Усиленный палец: ${upgradesMap.finger || 0} уровень
• Автокликер: ${upgradesMap.autoclicker || 0} уровень  
• Золотая рука: ${upgradesMap.golden_hand || 0} уровень
• Бизнес-центр: ${upgradesMap.business || 0} уровень

💡 <b>Как играть:</b>
Нажимайте кнопку "Клик!" для заработка монет. Покупайте улучшения для увеличения дохода!`;

  const keyboard = {
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
  };

  await ctx.editMessageText(clickerText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Обработка callback-ов кликер игры
const handleCallback = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  
  switch (callbackData) {
    case 'clicker_click':
      await handleClick(ctx);
      break;
    case 'clicker_upgrades':
      await showUpgrades(ctx);
      break;
    case 'clicker_stats':
      await showStats(ctx);
      break;
    case 'clicker_menu':
      await showClickerMenu(ctx);
      break;
    default:
      if (callbackData.startsWith('clicker_buy_')) {
        await buyUpgrade(ctx);
      }
  }
};

// Обработка клика
const handleClick = async (ctx) => {
  const user = ctx.user;
  
  try {
    // Получаем или создаем сессию
    let session = await RedisService.getClickerSession(user.id);
    if (!session) {
      session = {
        clicks: 0,
        coinsEarned: 0,
        startTime: Date.now()
      };
    }
    
    // Получаем улучшения
    const upgrades = await DatabaseService.query(
      'SELECT * FROM clicker_upgrades WHERE user_id = $1',
      [user.id]
    );
    
    const upgradesMap = {};
    upgrades.rows.forEach(upgrade => {
      upgradesMap[upgrade.upgrade_type] = upgrade.level;
    });
    
    // Вычисляем доход за клик
    const clickValue = calculateClickValue(upgradesMap);
    
    // Обновляем сессию
    session.clicks++;
    session.coinsEarned += clickValue;
    
    await RedisService.setClickerSession(user.id, session, 3600);
    
    // Обновляем статистику
    await DatabaseService.updateUserStats(user.id, {
      clicker_clicks: 1
    });
    
    // Проверяем достижения
    const newAchievements = await DatabaseService.checkAndAwardAchievement(
      user.id, 
      'clicker_clicks', 
      session.clicks
    );
    
    await ctx.answerCbQuery(`+${clickValue} монет! 💰`);
    
    // Обновляем сообщение каждые 10 кликов
    if (session.clicks % 10 === 0) {
      await showClickerMenu(ctx);
    }
    
  } catch (error) {
    console.error('Handle click error:', error);
    await ctx.answerCbQuery('❌ Ошибка при обработке клика');
  }
};

// Показ улучшений
const showUpgrades = async (ctx) => {
  const user = ctx.user;
  
  // Получаем улучшения пользователя
  const upgrades = await DatabaseService.query(
    'SELECT * FROM clicker_upgrades WHERE user_id = $1',
    [user.id]
  );
  
  const upgradesMap = {};
  upgrades.rows.forEach(upgrade => {
    upgradesMap[upgrade.upgrade_type] = upgrade.level;
  });
  
  const upgradesText = `🔧 <b>Улучшения кликер игры</b>

💰 <b>Ваши монеты:</b> ${user.coins}

🛠️ <b>Доступные улучшения:</b>

👆 <b>Усиленный палец</b> (Уровень ${upgradesMap.finger || 0})
• +1 монета за клик
• Цена: ${calculateUpgradePrice('finger', upgradesMap.finger || 0)} монет

⚡ <b>Автокликер</b> (Уровень ${upgradesMap.autoclicker || 0})
• +1 монета в секунду
• Цена: ${calculateUpgradePrice('autoclicker', upgradesMap.autoclicker || 0)} монет

✨ <b>Золотая рука</b> (Уровень ${upgradesMap.golden_hand || 0})
• x2 к доходу от кликов
• Цена: ${calculateUpgradePrice('golden_hand', upgradesMap.golden_hand || 0)} монет

🏢 <b>Бизнес-центр</b> (Уровень ${upgradesMap.business || 0})
• +10 монет в секунду
• Цена: ${calculateUpgradePrice('business', upgradesMap.business || 0)} монет`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '👆 Усиленный палец', callback_data: 'clicker_buy_finger' },
        { text: '⚡ Автокликер', callback_data: 'clicker_buy_autoclicker' }
      ],
      [
        { text: '✨ Золотая рука', callback_data: 'clicker_buy_golden_hand' },
        { text: '🏢 Бизнес-центр', callback_data: 'clicker_buy_business' }
      ],
      [
        { text: '🔙 Назад', callback_data: 'clicker_menu' }
      ]
    ]
  };

  await ctx.editMessageText(upgradesText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Покупка улучшения
const buyUpgrade = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const upgradeType = callbackData.replace('clicker_buy_', '');
  const user = ctx.user;
  
  try {
    // Получаем текущий уровень улучшения
    const currentUpgrade = await DatabaseService.query(
      'SELECT level FROM clicker_upgrades WHERE user_id = $1 AND upgrade_type = $2',
      [user.id, upgradeType]
    );
    
    const currentLevel = currentUpgrade.rows[0]?.level || 0;
    const price = calculateUpgradePrice(upgradeType, currentLevel);
    
    if (user.coins < price) {
      await ctx.answerCbQuery('❌ Недостаточно монет!');
      return;
    }
    
    // Покупаем улучшение
    if (currentLevel === 0) {
      // Создаем новое улучшение
      await DatabaseService.query(
        'INSERT INTO clicker_upgrades (user_id, upgrade_type, level) VALUES ($1, $2, $3)',
        [user.id, upgradeType, 1]
      );
    } else {
      // Увеличиваем уровень
      await DatabaseService.query(
        'UPDATE clicker_upgrades SET level = level + 1 WHERE user_id = $1 AND upgrade_type = $2',
        [user.id, upgradeType]
      );
    }
    
    // Списываем монеты
    await DatabaseService.updateUser(user.id, {
      coins: user.coins - price
    });
    
    // Добавляем транзакцию
    await DatabaseService.addTransaction(
      user.id,
      'spend',
      price,
      'coins',
      `Покупка улучшения: ${getUpgradeName(upgradeType)}`
    );
    
    await ctx.answerCbQuery(`✅ Улучшение куплено!`);
    await showUpgrades(ctx);
    
  } catch (error) {
    console.error('Buy upgrade error:', error);
    await ctx.answerCbQuery('❌ Ошибка при покупке улучшения');
  }
};

// Показ статистики
const showStats = async (ctx) => {
  const user = ctx.user;
  
  // Получаем статистику
  const stats = await DatabaseService.query(
    'SELECT * FROM user_stats WHERE user_id = $1',
    [user.id]
  );
  
  const userStats = stats.rows[0] || {};
  
  // Получаем улучшения
  const upgrades = await DatabaseService.query(
    'SELECT * FROM clicker_upgrades WHERE user_id = $1',
    [user.id]
  );
  
  const upgradesMap = {};
  upgrades.rows.forEach(upgrade => {
    upgradesMap[upgrade.upgrade_type] = upgrade.level;
  });
  
  const statsText = `📊 <b>Статистика кликер игры</b>

👆 <b>Общие клики:</b> ${userStats.clicker_clicks || 0}
💰 <b>Доход за клик:</b> ${calculateClickValue(upgradesMap)} монет
⚡ <b>Автокликер:</b> ${calculateAutoClickValue(upgradesMap)} монет/сек

🔧 <b>Улучшения:</b>
• Усиленный палец: ${upgradesMap.finger || 0} уровень
• Автокликер: ${upgradesMap.autoclicker || 0} уровень
• Золотая рука: ${upgradesMap.golden_hand || 0} уровень
• Бизнес-центр: ${upgradesMap.business || 0} уровень

💡 <b>Совет:</b> Автокликер работает даже когда вы не в игре!`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔙 Назад', callback_data: 'clicker_menu' }
      ]
    ]
  };

  await ctx.editMessageText(statsText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Вычисление стоимости улучшения
function calculateUpgradePrice(upgradeType, currentLevel) {
  const basePrices = {
    finger: 100,
    autoclicker: 500,
    golden_hand: 1000,
    business: 5000
  };
  
  const basePrice = basePrices[upgradeType];
  return basePrice * Math.pow(1.5, currentLevel);
}

// Вычисление дохода за клик
function calculateClickValue(upgradesMap) {
  let baseValue = 1;
  
  // Усиленный палец
  baseValue += (upgradesMap.finger || 0);
  
  // Золотая рука (множитель)
  if (upgradesMap.golden_hand > 0) {
    baseValue *= Math.pow(2, upgradesMap.golden_hand);
  }
  
  return Math.floor(baseValue);
}

// Вычисление автокликера
function calculateAutoClickValue(upgradesMap) {
  let autoValue = 0;
  
  // Автокликер
  autoValue += (upgradesMap.autoclicker || 0);
  
  // Бизнес-центр
  autoValue += (upgradesMap.business || 0) * 10;
  
  return autoValue;
}

// Получение названия улучшения
function getUpgradeName(upgradeType) {
  const names = {
    finger: 'Усиленный палец',
    autoclicker: 'Автокликер',
    golden_hand: 'Золотая рука',
    business: 'Бизнес-центр'
  };
  
  return names[upgradeType] || upgradeType;
}

module.exports = {
  showClickerMenu,
  handleCallback
};
