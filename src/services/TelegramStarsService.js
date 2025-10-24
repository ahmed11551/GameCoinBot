// Интеграция с Telegram Stars API
const telegramStarsAPI = {
  // Настройки для Telegram Stars
  config: {
    botToken: process.env.BOT_TOKEN,
    providerToken: process.env.PROVIDER_TOKEN, // Токен платежного провайдера
    currency: 'XTR', // Telegram Stars
    prices: {
      'gems_small': { amount: 100, label: 'Малый пакет драгоценных камней' },
      'gems_medium': { amount: 450, label: 'Средний пакет драгоценных камней' },
      'gems_large': { amount: 800, label: 'Большой пакет драгоценных камней' },
      'gems_mega': { amount: 1800, label: 'Мега пакет драгоценных камней' }
    }
  },

  // Создание инвойса для покупки
  createInvoice: function(packageId, userId) {
    const price = this.config.prices[packageId];
    if (!price) return null;

    return {
      provider_token: this.config.providerToken,
      currency: this.config.currency,
      prices: [{ label: price.label, amount: price.amount }],
      payload: JSON.stringify({
        packageId: packageId,
        userId: userId,
        timestamp: Date.now()
      }),
      description: `Покупка ${price.label} в CoinMaster Bot`
    };
  },

  // Обработка успешного платежа
  handleSuccessfulPayment: function(paymentData) {
    try {
      const payload = JSON.parse(paymentData.invoice_payload);
      const { packageId, userId } = payload;
      
      // Получаем информацию о пакете
      const gemPackage = monetizationService.telegramStars.gemPackages.find(p => p.id === packageId);
      if (!gemPackage) return false;

      // Выдаем драгоценные камни пользователю
      const totalGems = gemPackage.gems + gemPackage.bonus;
      
      // Записываем в историю покупок
      const purchaseResult = monetizationService.purchaseGems(userId, packageId, gemPackage.stars);
      
      if (purchaseResult.success) {
        // Логируем успешную покупку
        console.log(`✅ Успешная покупка: ${userId} купил ${totalGems} драгоценных камней за ${gemPackage.stars} Stars`);
        
        // Отправляем уведомление пользователю
        return {
          success: true,
          gems: totalGems,
          stars: gemPackage.stars,
          package: gemPackage
        };
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка обработки платежа:', error);
      return false;
    }
  },

  // Получение статистики доходов
  getRevenueStats: function() {
    const stats = monetizationService.getMonetizationStats();
    
    return {
      totalRevenue: stats.revenue, // В Telegram Stars
      totalPurchases: stats.totalPurchases,
      averagePurchase: stats.totalPurchases > 0 ? stats.revenue / stats.totalPurchases : 0,
      conversionRate: this.calculateConversionRate(),
      estimatedUSD: this.convertStarsToUSD(stats.revenue)
    };
  },

  // Конвертация Stars в USD (примерный курс)
  convertStarsToUSD: function(stars) {
    // Примерный курс: 1 Star = $0.015 (может варьироваться)
    return Math.round(stars * 0.015 * 100) / 100;
  },

  // Расчет конверсии
  calculateConversionRate: function() {
    // Здесь можно добавить логику расчета конверсии
    // Например, процент пользователей, которые совершили покупку
    return 0.05; // 5% конверсия (пример)
  },

  // Получение топовых пакетов
  getTopPackages: function() {
    const packages = monetizationService.telegramStars.gemPackages;
    return packages.sort((a, b) => b.stars - a.stars);
  },

  // Проверка статуса платежа
  checkPaymentStatus: function(paymentId) {
    // Здесь можно добавить проверку статуса платежа через Telegram API
    return {
      status: 'completed',
      amount: 0,
      currency: 'XTR'
    };
  }
};

// Middleware для обработки платежей
function setupPaymentHandlers(bot) {
  // Обработчик успешного платежа
  bot.on('successful_payment', (ctx) => {
    const paymentData = ctx.message.successful_payment;
    const result = telegramStarsAPI.handleSuccessfulPayment(paymentData);
    
    if (result.success) {
      // Обновляем баланс пользователя
      const user = getUserData(ctx.from.id);
      user.gems += result.gems;
      
      // Отправляем подтверждение
      ctx.reply(`🎉 <b>Покупка успешна!</b>

✅ Получено: ${result.gems} драгоценных камней
⭐ Потрачено: ${result.stars} Telegram Stars

💎 <b>Ваш баланс:</b> ${user.gems} драгоценных камней

Спасибо за покупку!`, { parse_mode: 'HTML' });
    } else {
      ctx.reply('❌ Произошла ошибка при обработке платежа. Обратитесь в поддержку.');
    }
  });

  // Обработчик предварительного запроса на оплату
  bot.on('pre_checkout_query', (ctx) => {
    // Подтверждаем запрос
    ctx.answerPreCheckoutQuery(true);
  });
}

// Функция для отправки инвойса
function sendInvoice(ctx, packageId) {
  const invoice = telegramStarsAPI.createInvoice(packageId, ctx.from.id);
  if (!invoice) {
    ctx.answerCbQuery('Ошибка создания платежа');
    return;
  }

  ctx.replyWithInvoice(invoice, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💳 Оплатить', pay: true }],
        [{ text: '❌ Отмена', callback_data: 'cancel_payment' }]
      ]
    }
  });
}

module.exports = {
  telegramStarsAPI,
  setupPaymentHandlers,
  sendInvoice
};
