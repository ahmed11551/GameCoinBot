const DatabaseService = require('../services/DatabaseService');

// Показ магазина
const showShop = async (ctx) => {
  const user = ctx.user;
  
  // Получаем товары из магазина
  const shopItems = await DatabaseService.query(
    'SELECT * FROM shop_items WHERE is_active = true ORDER BY type, price_stars'
  );
  
  const shopText = `🛒 <b>Магазин</b>

💰 <b>Ваш баланс:</b>
🪙 Монеты: ${user.coins}
💎 Драгоценные камни: ${user.gems}
⭐ Telegram Stars: ${user.telegram_stars || 0}

💡 <b>Как купить:</b>
Используйте Telegram Stars для покупки валюты и премиум подписки`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🪙 Пакеты монет', callback_data: 'shop_coins' },
        { text: '💎 Драгоценные камни', callback_data: 'shop_gems' }
      ],
      [
        { text: '💎 Премиум подписка', callback_data: 'shop_premium' },
        { text: '📊 История покупок', callback_data: 'shop_history' }
      ],
      [
        { text: '🔙 Главное меню', callback_data: 'main_menu' }
      ]
    ]
  };

  await ctx.editMessageText(shopText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Обработка callback-ов магазина
const handleCallback = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  
  switch (callbackData) {
    case 'shop_coins':
      await showCoinsPackages(ctx);
      break;
    case 'shop_gems':
      await showGemsPackages(ctx);
      break;
    case 'shop_premium':
      await showPremiumSubscription(ctx);
      break;
    case 'shop_history':
      await showPurchaseHistory(ctx);
      break;
    case 'shop':
      await showShop(ctx);
      break;
    default:
      if (callbackData.startsWith('shop_buy_')) {
        await buyItem(ctx);
      }
  }
};

// Показ пакетов монет
const showCoinsPackages = async (ctx) => {
  const coinsText = `🪙 <b>Пакеты монет</b>

💰 <b>Доступные пакеты:</b>

🥉 <b>Базовый пакет</b>
• 1000 монет
• Цена: 49 Telegram Stars
• Бонус: 0%

🥈 <b>Стандартный пакет</b>
• 5000 монет  
• Цена: 199 Telegram Stars
• Бонус: +10% (500 монет)

🥇 <b>Премиум пакет</b>
• 15000 монет
• Цена: 499 Telegram Stars
• Бонус: +20% (3000 монет)

💎 <b>VIP пакет</b>
• 50000 монет
• Цена: 1499 Telegram Stars
• Бонус: +30% (15000 монет)

💡 <b>Совет:</b> Чем больше пакет, тем больше бонус!`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🥉 1000 монет - 49⭐', callback_data: 'shop_buy_coins_1000' },
        { text: '🥈 5000 монет - 199⭐', callback_data: 'shop_buy_coins_5000' }
      ],
      [
        { text: '🥇 15000 монет - 499⭐', callback_data: 'shop_buy_coins_15000' },
        { text: '💎 50000 монет - 1499⭐', callback_data: 'shop_buy_coins_50000' }
      ],
      [
        { text: '🔙 Назад', callback_data: 'shop' }
      ]
    ]
  };

  await ctx.editMessageText(coinsText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Показ пакетов драгоценных камней
const showGemsPackages = async (ctx) => {
  const gemsText = `💎 <b>Драгоценные камни</b>

💎 <b>Доступные пакеты:</b>

💎 <b>Малый пакет</b>
• 100 драгоценных камней
• Цена: 99 Telegram Stars

💎💎 <b>Средний пакет</b>
• 600 драгоценных камней
• Цена: 499 Telegram Stars
• Бонус: +20% (120 камней)

💎💎💎 <b>Большой пакет</b>
• 1500 драгоценных камней
• Цена: 999 Telegram Stars
• Бонус: +25% (375 камней)

💡 <b>Для чего нужны драгоценные камни:</b>
• Покупка эксклюзивных улучшений
• Участие в специальных турнирах
• Премиум функции`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💎 100 камней - 99⭐', callback_data: 'shop_buy_gems_100' },
        { text: '💎💎 600 камней - 499⭐', callback_data: 'shop_buy_gems_600' }
      ],
      [
        { text: '💎💎💎 1500 камней - 999⭐', callback_data: 'shop_buy_gems_1500' }
      ],
      [
        { text: '🔙 Назад', callback_data: 'shop' }
      ]
    ]
  };

  await ctx.editMessageText(gemsText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Показ премиум подписки
const showPremiumSubscription = async (ctx) => {
  const user = ctx.user;
  const isPremium = user.is_premium && new Date(user.premium_expires_at) > new Date();
  
  const premiumText = `💎 <b>Премиум подписка</b>

${isPremium ? 
  `✅ <b>Статус:</b> Активна до ${new Date(user.premium_expires_at).toLocaleDateString('ru-RU')}` :
  `❌ <b>Статус:</b> Неактивна`
}

💰 <b>Цена:</b> 299 Telegram Stars/месяц

🎁 <b>Преимущества:</b>
• +20% к заработку во всех играх
• Ежедневный бонус: 200 монет (вместо 100)
• Эксклюзивные аватары и темы
• Приоритетная поддержка
• Участие в специальных турнирах
• Удвоенный опыт за достижения
• Эксклюзивные улучшения для игр

💡 <b>Совет:</b> Премиум подписка окупается за счет увеличенного заработка!`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: isPremium ? '🔄 Продлить подписку' : '💎 Купить подписку', 
          callback_data: 'shop_buy_premium' }
      ],
      [
        { text: '🔙 Назад', callback_data: 'shop' }
      ]
    ]
  };

  await ctx.editMessageText(premiumText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Покупка товара
const buyItem = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const parts = callbackData.replace('shop_buy_', '').split('_');
  const itemType = parts[0];
  const itemValue = parts[1];
  
  try {
    let item;
    let price;
    let description;
    
    switch (itemType) {
      case 'coins':
        const coinsPackages = {
          '1000': { price: 49, amount: 1000, bonus: 0 },
          '5000': { price: 199, amount: 5000, bonus: 500 },
          '15000': { price: 499, amount: 15000, bonus: 3000 },
          '50000': { price: 1499, amount: 50000, bonus: 15000 }
        };
        
        item = coinsPackages[itemValue];
        price = item.price;
        description = `Пакет монет: ${item.amount} (+${item.bonus} бонус)`;
        break;
        
      case 'gems':
        const gemsPackages = {
          '100': { price: 99, amount: 100 },
          '600': { price: 499, amount: 720 }, // +20% бонус
          '1500': { price: 999, amount: 1875 } // +25% бонус
        };
        
        item = gemsPackages[itemValue];
        price = item.price;
        description = `Пакет драгоценных камней: ${item.amount}`;
        break;
        
      case 'premium':
        price = 299;
        description = 'Премиум подписка на 30 дней';
        break;
        
      default:
        await ctx.answerCbQuery('❌ Неизвестный товар');
        return;
    }
    
    // Здесь должна быть интеграция с Telegram Stars API
    // Пока что симулируем покупку
    
    const confirmText = `🛒 <b>Подтверждение покупки</b>

📦 <b>Товар:</b> ${description}
💰 <b>Цена:</b> ${price} Telegram Stars

⚠️ <b>Внимание:</b> Это тестовая версия. В реальном боте здесь будет интеграция с Telegram Stars API.

Продолжить покупку?`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Подтвердить', callback_data: `shop_confirm_${itemType}_${itemValue}` },
          { text: '❌ Отмена', callback_data: 'shop' }
        ]
      ]
    };

    await ctx.editMessageText(confirmText, { 
      parse_mode: 'HTML', 
      reply_markup: keyboard 
    });
    
  } catch (error) {
    console.error('Buy item error:', error);
    await ctx.answerCbQuery('❌ Ошибка при покупке товара');
  }
};

// Подтверждение покупки
const confirmPurchase = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const parts = callbackData.replace('shop_confirm_', '').split('_');
  const itemType = parts[0];
  const itemValue = parts[1];
  
  try {
    // Симулируем успешную покупку
    let coinsToAdd = 0;
    let gemsToAdd = 0;
    let premiumDays = 0;
    
    switch (itemType) {
      case 'coins':
        const coinsPackages = {
          '1000': { amount: 1000, bonus: 0 },
          '5000': { amount: 5000, bonus: 500 },
          '15000': { amount: 15000, bonus: 3000 },
          '50000': { amount: 50000, bonus: 15000 }
        };
        const coinsItem = coinsPackages[itemValue];
        coinsToAdd = coinsItem.amount + coinsItem.bonus;
        break;
        
      case 'gems':
        const gemsPackages = {
          '100': { amount: 100 },
          '600': { amount: 720 },
          '1500': { amount: 1875 }
        };
        gemsToAdd = gemsPackages[itemValue].amount;
        break;
        
      case 'premium':
        premiumDays = 30;
        break;
    }
    
    // Обновляем пользователя
    const updates = {};
    if (coinsToAdd > 0) updates.coins = ctx.user.coins + coinsToAdd;
    if (gemsToAdd > 0) updates.gems = ctx.user.gems + gemsToAdd;
    if (premiumDays > 0) {
      const currentExpiry = ctx.user.premium_expires_at ? new Date(ctx.user.premium_expires_at) : new Date();
      updates.premium_expires_at = new Date(currentExpiry.getTime() + premiumDays * 24 * 60 * 60 * 1000);
      updates.is_premium = true;
    }
    
    await DatabaseService.updateUser(ctx.user.id, updates);
    
    // Добавляем транзакцию
    await DatabaseService.addTransaction(
      ctx.user.id,
      'purchase',
      coinsToAdd || gemsToAdd || premiumDays,
      itemType === 'premium' ? 'premium' : itemType,
      `Покупка в магазине: ${itemType}`
    );
    
    // Записываем покупку
    await DatabaseService.query(
      'INSERT INTO purchases (user_id, item_id, stars_spent) VALUES ($1, $2, $3)',
      [ctx.user.id, 'test_item', 0] // В реальном боте здесь будет ID товара и потраченные Stars
    );
    
    const successText = `✅ <b>Покупка успешна!</b>

${coinsToAdd > 0 ? `🪙 Получено монет: ${coinsToAdd}` : ''}
${gemsToAdd > 0 ? `💎 Получено драгоценных камней: ${gemsToAdd}` : ''}
${premiumDays > 0 ? `💎 Премиум подписка активирована на ${premiumDays} дней` : ''}

Спасибо за покупку! 🎉`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🛒 Еще покупки', callback_data: 'shop' },
          { text: '🔙 Главное меню', callback_data: 'main_menu' }
        ]
      ]
    };

    await ctx.editMessageText(successText, { 
      parse_mode: 'HTML', 
      reply_markup: keyboard 
    });
    
  } catch (error) {
    console.error('Confirm purchase error:', error);
    await ctx.answerCbQuery('❌ Ошибка при подтверждении покупки');
  }
};

// История покупок
const showPurchaseHistory = async (ctx) => {
  try {
    const purchases = await DatabaseService.query(
      `SELECT p.*, si.name, si.type 
       FROM purchases p
       LEFT JOIN shop_items si ON p.item_id = si.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 10`,
      [ctx.user.id]
    );
    
    let historyText = `📊 <b>История покупок</b>\n\n`;
    
    if (purchases.rows.length === 0) {
      historyText += `❌ Покупок не найдено`;
    } else {
      purchases.rows.forEach((purchase, index) => {
        historyText += `${index + 1}. <b>${purchase.name || 'Товар'}</b>\n`;
        historyText += `💰 Потрачено: ${purchase.stars_spent} Telegram Stars\n`;
        historyText += `📅 Дата: ${new Date(purchase.created_at).toLocaleDateString('ru-RU')}\n\n`;
      });
    }
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔙 Назад', callback_data: 'shop' }
        ]
      ]
    };

    await ctx.editMessageText(historyText, { 
      parse_mode: 'HTML', 
      reply_markup: keyboard 
    });
    
  } catch (error) {
    console.error('Show purchase history error:', error);
    await ctx.answerCbQuery('❌ Ошибка при загрузке истории покупок');
  }
};

module.exports = {
  showShop,
  handleCallback
};
