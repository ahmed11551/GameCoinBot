const DatabaseService = require('../services/DatabaseService');
const RedisService = require('../services/RedisService');

// Middleware для обработки пользователей
const userMiddleware = async (ctx, next) => {
  try {
    const telegramId = ctx.from.id;
    
    // Проверяем кэш пользователя
    let user = await RedisService.get(`user:${telegramId}`);
    
    if (!user) {
      // Получаем пользователя из базы данных
      user = await DatabaseService.getUserByTelegramId(telegramId);
      
      if (!user) {
        // Создаем нового пользователя
        user = await DatabaseService.createUser({
          telegramId: telegramId,
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
          languageCode: ctx.from.language_code || 'ru'
        });
      }
      
      // Кэшируем пользователя на 1 час
      await RedisService.set(`user:${telegramId}`, user, 3600);
    }
    
    // Добавляем пользователя в контекст
    ctx.user = user;
    
    // Обновляем время последней активности
    await DatabaseService.updateUser(user.id, {
      last_active_at: new Date()
    });
    
    await next();
  } catch (error) {
    console.error('User middleware error:', error);
    await next();
  }
};

// Middleware для ограничения частоты запросов
const rateLimitMiddleware = async (ctx, next) => {
  try {
    const userId = ctx.from.id;
    const action = ctx.updateType;
    
    const isAllowed = await RedisService.checkRateLimit(userId, action, 30); // 30 запросов в минуту
    
    if (!isAllowed) {
      await ctx.reply('⚠️ Слишком много запросов. Подождите немного.');
      return;
    }
    
    await RedisService.setRateLimit(userId, action, 60);
    await next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    await next();
  }
};

// Middleware для проверки премиум статуса
const premiumMiddleware = async (ctx, next) => {
  if (!ctx.user) {
    await ctx.reply('❌ Пользователь не найден.');
    return;
  }
  
  if (!ctx.user.is_premium || new Date(ctx.user.premium_expires_at) < new Date()) {
    await ctx.reply('💎 Эта функция доступна только для премиум пользователей.\n\nИспользуйте /buy для покупки премиум подписки.');
    return;
  }
  
  await next();
};

// Middleware для проверки возраста (для казино)
const ageVerificationMiddleware = async (ctx, next) => {
  if (!ctx.user) {
    await ctx.reply('❌ Пользователь не найден.');
    return;
  }
  
  // Проверяем, что пользователь подтвердил возраст
  const ageVerified = await RedisService.get(`age_verified:${ctx.user.id}`);
  
  if (!ageVerified) {
    const keyboard = {
      inline_keyboard: [[
        { text: '✅ Мне есть 18 лет', callback_data: 'verify_age' },
        { text: '❌ Мне нет 18 лет', callback_data: 'age_denied' }
      ]]
    };
    
    await ctx.reply(
      '🎰 <b>Казино игры</b>\n\n' +
      '⚠️ <b>Предупреждение:</b> Казино игры предназначены только для лиц старше 18 лет.\n\n' +
      'Подтвердите свой возраст для доступа к играм:',
      { parse_mode: 'HTML', reply_markup: keyboard }
    );
    return;
  }
  
  await next();
};

// Middleware для проверки баланса
const checkBalanceMiddleware = (requiredAmount) => {
  return async (ctx, next) => {
    if (!ctx.user) {
      await ctx.reply('❌ Пользователь не найден.');
      return;
    }
    
    if (ctx.user.coins < requiredAmount) {
      await ctx.reply(
        `💰 Недостаточно монет!\n\n` +
        `Требуется: ${requiredAmount} монет\n` +
        `У вас: ${ctx.user.coins} монет\n\n` +
        `Используйте /buy для покупки монет.`
      );
      return;
    }
    
    await next();
  };
};

module.exports = {
  userMiddleware,
  rateLimitMiddleware,
  premiumMiddleware,
  ageVerificationMiddleware,
  checkBalanceMiddleware
};
