const DatabaseService = require('../services/DatabaseService');

// Показ турниров
const showTournaments = async (ctx) => {
  try {
    const tournaments = await DatabaseService.getActiveTournaments();
    
    let tournamentsText = `🏆 <b>Активные турниры</b>\n\n`;
    
    if (tournaments.length === 0) {
      tournamentsText += `❌ Нет активных турниров\n\n💡 Новые турниры появляются регулярно!`;
    } else {
      tournaments.forEach((tournament, index) => {
        const type = tournament.type === 'free' ? '🆓 Бесплатный' : 
                    tournament.type === 'paid' ? '💰 Платный' : '🎉 Специальный';
        
        tournamentsText += `${index + 1}. <b>${tournament.name}</b>\n`;
        tournamentsText += `${type}\n`;
        tournamentsText += `👥 Участников: ${tournament.current_participants}/${tournament.max_participants || '∞'}\n`;
        tournamentsText += `💰 Призовой фонд: ${tournament.prize_pool} монет\n`;
        tournamentsText += `⏰ До окончания: ${getTimeLeft(tournament.end_date)}\n\n`;
      });
    }
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🆓 Бесплатные турниры', callback_data: 'tournament_free' },
          { text: '💰 Платные турниры', callback_data: 'tournament_paid' }
        ],
        [
          { text: '🎉 Специальные турниры', callback_data: 'tournament_special' },
          { text: '📊 Мои турниры', callback_data: 'tournament_my' }
        ],
        [
          { text: '🔙 Главное меню', callback_data: 'main_menu' }
        ]
      ]
    };
    
    await ctx.editMessageText(tournamentsText, { 
      parse_mode: 'HTML', 
      reply_markup: keyboard 
    });
    
  } catch (error) {
    console.error('Show tournaments error:', error);
    await ctx.answerCbQuery('❌ Ошибка при загрузке турниров');
  }
};

// Обработка callback-ов турниров
const handleCallback = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  
  switch (callbackData) {
    case 'tournament_free':
      await showTournamentsByType(ctx, 'free');
      break;
    case 'tournament_paid':
      await showTournamentsByType(ctx, 'paid');
      break;
    case 'tournament_special':
      await showTournamentsByType(ctx, 'special');
      break;
    case 'tournament_my':
      await showMyTournaments(ctx);
      break;
    case 'tournaments':
      await showTournaments(ctx);
      break;
    default:
      if (callbackData.startsWith('tournament_join_')) {
        await joinTournament(ctx);
      }
  }
};

// Показ турниров по типу
const showTournamentsByType = async (ctx, type) => {
  try {
    const tournaments = await DatabaseService.query(
      `SELECT * FROM tournaments 
       WHERE type = $1 AND status = 'active' AND end_date > NOW() 
       ORDER BY start_date ASC`,
      [type]
    );
    
    const typeNames = {
      free: '🆓 Бесплатные турниры',
      paid: '💰 Платные турниры',
      special: '🎉 Специальные турниры'
    };
    
    let tournamentsText = `${typeNames[type]}\n\n`;
    
    if (tournaments.rows.length === 0) {
      tournamentsText += `❌ Нет активных турниров этого типа`;
    } else {
      tournaments.rows.forEach((tournament, index) => {
        tournamentsText += `${index + 1}. <b>${tournament.name}</b>\n`;
        tournamentsText += `👥 Участников: ${tournament.current_participants}/${tournament.max_participants || '∞'}\n`;
        tournamentsText += `💰 Призовой фонд: ${tournament.prize_pool} монет\n`;
        if (tournament.entry_fee > 0) {
          tournamentsText += `💸 Взнос: ${tournament.entry_fee} монет\n`;
        }
        tournamentsText += `⏰ До окончания: ${getTimeLeft(tournament.end_date)}\n\n`;
      });
    }
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔙 Назад', callback_data: 'tournaments' }
        ]
      ]
    };
    
    await ctx.editMessageText(tournamentsText, { 
      parse_mode: 'HTML', 
      reply_markup: keyboard 
    });
    
  } catch (error) {
    console.error('Show tournaments by type error:', error);
    await ctx.answerCbQuery('❌ Ошибка при загрузке турниров');
  }
};

// Показ моих турниров
const showMyTournaments = async (ctx) => {
  try {
    const myTournaments = await DatabaseService.query(
      `SELECT t.*, tp.score, tp.rank, tp.prize_amount 
       FROM tournaments t
       JOIN tournament_participants tp ON t.id = tp.tournament_id
       WHERE tp.user_id = $1
       ORDER BY t.end_date DESC`,
      [ctx.user.id]
    );
    
    let tournamentsText = `🏆 <b>Мои турниры</b>\n\n`;
    
    if (myTournaments.rows.length === 0) {
      tournamentsText += `❌ Вы не участвовали в турнирах`;
    } else {
      myTournaments.rows.forEach((tournament, index) => {
        const status = tournament.status === 'active' ? '🟢 Активный' : 
                      tournament.status === 'finished' ? '🔴 Завершен' : '⏸️ Отменен';
        
        tournamentsText += `${index + 1}. <b>${tournament.name}</b>\n`;
        tournamentsText += `${status}\n`;
        tournamentsText += `📊 Очки: ${tournament.score || 0}\n`;
        if (tournament.rank) {
          tournamentsText += `🏆 Место: ${tournament.rank}\n`;
        }
        if (tournament.prize_amount > 0) {
          tournamentsText += `💰 Приз: ${tournament.prize_amount} монет\n`;
        }
        tournamentsText += `\n`;
      });
    }
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔙 Назад', callback_data: 'tournaments' }
        ]
      ]
    };
    
    await ctx.editMessageText(tournamentsText, { 
      parse_mode: 'HTML', 
      reply_markup: keyboard 
    });
    
  } catch (error) {
    console.error('Show my tournaments error:', error);
    await ctx.answerCbQuery('❌ Ошибка при загрузке ваших турниров');
  }
};

// Участие в турнире
const joinTournament = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const tournamentId = callbackData.replace('tournament_join_', '');
  
  try {
    // Получаем информацию о турнире
    const tournament = await DatabaseService.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [tournamentId]
    );
    
    if (tournament.rows.length === 0) {
      await ctx.answerCbQuery('❌ Турнир не найден');
      return;
    }
    
    const tourney = tournament.rows[0];
    
    // Проверяем, можно ли присоединиться
    if (tourney.status !== 'active') {
      await ctx.answerCbQuery('❌ Турнир не активен');
      return;
    }
    
    if (tourney.max_participants && tourney.current_participants >= tourney.max_participants) {
      await ctx.answerCbQuery('❌ Турнир заполнен');
      return;
    }
    
    if (new Date(tourney.end_date) < new Date()) {
      await ctx.answerCbQuery('❌ Турнир уже завершен');
      return;
    }
    
    // Проверяем взнос
    if (tourney.entry_fee > 0 && ctx.user.coins < tourney.entry_fee) {
      await ctx.answerCbQuery('❌ Недостаточно монет для участия');
      return;
    }
    
    // Проверяем, не участвует ли уже
    const existing = await DatabaseService.query(
      'SELECT id FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2',
      [tournamentId, ctx.user.id]
    );
    
    if (existing.rows.length > 0) {
      await ctx.answerCbQuery('❌ Вы уже участвуете в этом турнире');
      return;
    }
    
    // Присоединяемся к турниру
    await DatabaseService.joinTournament(tournamentId, ctx.user.id);
    
    // Списываем взнос
    if (tourney.entry_fee > 0) {
      await DatabaseService.updateUser(ctx.user.id, {
        coins: ctx.user.coins - tourney.entry_fee
      });
      
      await DatabaseService.addTransaction(
        ctx.user.id,
        'spend',
        tourney.entry_fee,
        'coins',
        `Взнос за турнир: ${tourney.name}`
      );
    }
    
    // Обновляем количество участников
    await DatabaseService.query(
      'UPDATE tournaments SET current_participants = current_participants + 1 WHERE id = $1',
      [tournamentId]
    );
    
    await ctx.answerCbQuery('✅ Вы присоединились к турниру!');
    await showTournaments(ctx);
    
  } catch (error) {
    console.error('Join tournament error:', error);
    await ctx.answerCbQuery('❌ Ошибка при присоединении к турниру');
  }
};

// Получение времени до окончания
function getTimeLeft(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  
  if (diff <= 0) {
    return 'Завершен';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}д ${hours}ч`;
  } else if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  } else {
    return `${minutes}м`;
  }
}

module.exports = {
  showTournaments,
  handleCallback
};
