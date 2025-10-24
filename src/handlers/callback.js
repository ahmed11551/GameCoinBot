const DatabaseService = require('../services/DatabaseService');
const RedisService = require('../services/RedisService');

// Обработчик callback-запросов
const callbackHandler = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const user = ctx.user;
  
  try {
    switch (callbackData) {
      case 'main_menu':
        await ctx.answerCbQuery();
        await require('./start')(ctx);
        break;
        
      case 'profile':
        await ctx.answerCbQuery();
        await require('./profile')(ctx);
        break;
        
      case 'balance':
        await ctx.answerCbQuery();
        await require('./balance')(ctx);
        break;
        
      case 'quiz_menu':
        await ctx.answerCbQuery();
        await require('./quiz').showQuizMenu(ctx);
        break;
        
      case 'casino_menu':
        await ctx.answerCbQuery();
        await require('./casino').showCasinoMenu(ctx);
        break;
        
      case 'clicker_menu':
        await ctx.answerCbQuery();
        await require('./clicker').showClickerMenu(ctx);
        break;
        
      case 'tournaments':
        await ctx.answerCbQuery();
        await require('./tournament').showTournaments(ctx);
        break;
        
      case 'leaderboard':
        await ctx.answerCbQuery();
        await require('./leaderboard')(ctx);
        break;
        
      case 'shop':
        await ctx.answerCbQuery();
        await require('./shop').showShop(ctx);
        break;
        
      case 'support':
        await ctx.answerCbQuery();
        await require('./support')(ctx);
        break;
        
      case 'claim_daily_bonus':
        await claimDailyBonus(ctx);
        break;
        
      case 'verify_age':
        await verifyAge(ctx);
        break;
        
      case 'age_denied':
        await ctx.answerCbQuery('❌ Доступ к казино ограничен для лиц младше 18 лет');
        break;
        
      default:
        // Обработка игровых callback-ов
        if (callbackData.startsWith('quiz_')) {
          await require('./quiz').handleCallback(ctx);
        } else if (callbackData.startsWith('casino_')) {
          await require('./casino').handleCallback(ctx);
        } else if (callbackData.startsWith('clicker_')) {
          await require('./clicker').handleCallback(ctx);
        } else if (callbackData.startsWith('tournament_')) {
          await require('./tournament').handleCallback(ctx);
        } else if (callbackData.startsWith('shop_')) {
          await require('./shop').handleCallback(ctx);
        } else {
          await ctx.answerCbQuery('❌ Неизвестная команда');
        }
    }
  } catch (error) {
    console.error('Callback handler error:', error);
    await ctx.answerCbQuery('❌ Произошла ошибка');
  }
};

// Получение ежедневного бонуса
async function claimDailyBonus(ctx) {
  const user = ctx.user;
  
  try {
    // Проверяем, можно ли получить бонус
    const hasDailyBonus = await RedisService.hasDailyBonus(user.id);
    const canClaimDailyBonus = !hasDailyBonus && 
      (!user.daily_bonus_claimed_at || 
       new Date(user.daily_bonus_claimed_at).toDateString() !== new Date().toDateString());
    
    if (!canClaimDailyBonus) {
      await ctx.answerCbQuery('❌ Бонус уже получен сегодня');
      return;
    }
    
    // Даем бонус
    const bonusAmount = 100;
    await DatabaseService.updateUser(user.id, {
      coins: user.coins + bonusAmount,
      daily_bonus_claimed_at: new Date()
    });
    
    // Добавляем транзакцию
    await DatabaseService.addTransaction(
      user.id,
      'earn',
      bonusAmount,
      'coins',
      'Ежедневный бонус'
    );
    
    // Устанавливаем флаг в Redis
    await RedisService.setDailyBonus(user.id);
    
    await ctx.answerCbQuery(`🎁 Получен ежедневный бонус: ${bonusAmount} монет!`);
    
    // Обновляем сообщение
    await require('./balance')(ctx);
    
  } catch (error) {
    console.error('Claim daily bonus error:', error);
    await ctx.answerCbQuery('❌ Ошибка при получении бонуса');
  }
}

// Подтверждение возраста для казино
async function verifyAge(ctx) {
  const user = ctx.user;
  
  try {
    // Устанавливаем флаг подтверждения возраста на 30 дней
    await RedisService.set(`age_verified:${user.id}`, true, 30 * 24 * 3600);
    
    await ctx.answerCbQuery('✅ Возраст подтвержден! Добро пожаловать в казино!');
    
    // Показываем меню казино
    await require('./casino').showCasinoMenu(ctx);
    
  } catch (error) {
    console.error('Age verification error:', error);
    await ctx.answerCbQuery('❌ Ошибка при подтверждении возраста');
  }
}

module.exports = callbackHandler;
