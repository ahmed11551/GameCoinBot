const DatabaseService = require('../services/DatabaseService');
const RedisService = require('../services/RedisService');
const { v4: uuidv4 } = require('uuid');

// Показ меню викторин
const showQuizMenu = async (ctx) => {
  const quizText = `🎯 <b>Викторины</b>

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
📝 <b>Количество вопросов:</b> 10`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🎬 Кино', callback_data: 'quiz_category_movies' },
        { text: '🎵 Музыка', callback_data: 'quiz_category_music' }
      ],
      [
        { text: '🔬 Наука', callback_data: 'quiz_category_science' },
        { text: '🎮 Игры', callback_data: 'quiz_category_games' }
      ],
      [
        { text: '🔙 Главное меню', callback_data: 'main_menu' }
      ]
    ]
  };

  await ctx.editMessageText(quizText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Обработка callback-ов викторин
const handleCallback = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  
  if (callbackData.startsWith('quiz_category_')) {
    const category = callbackData.replace('quiz_category_', '');
    await showDifficultyMenu(ctx, category);
  } else if (callbackData.startsWith('quiz_difficulty_')) {
    const parts = callbackData.replace('quiz_difficulty_', '').split('_');
    const category = parts[0];
    const difficulty = parts[1];
    await startQuiz(ctx, category, difficulty);
  } else if (callbackData.startsWith('quiz_answer_')) {
    await handleQuizAnswer(ctx);
  } else if (callbackData === 'quiz_next_question') {
    await showNextQuestion(ctx);
  } else if (callbackData === 'quiz_finish') {
    await finishQuiz(ctx);
  }
};

// Показ меню выбора сложности
const showDifficultyMenu = async (ctx, category) => {
  const categoryNames = {
    movies: '🎬 Кино',
    music: '🎵 Музыка', 
    science: '🔬 Наука',
    games: '🎮 Игры'
  };
  
  const difficultyText = `🎯 <b>${categoryNames[category]}</b>

Выберите сложность:

🟢 <b>Легкая</b>
• 50 монет за победу
• Простые вопросы

🟡 <b>Средняя</b>  
• 100 монет + 10 драгоценных камней
• Вопросы средней сложности

🔴 <b>Сложная</b>
• 200 монет + 25 драгоценных камней  
• Сложные вопросы`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🟢 Легкая', callback_data: `quiz_difficulty_${category}_easy` },
        { text: '🟡 Средняя', callback_data: `quiz_difficulty_${category}_medium` }
      ],
      [
        { text: '🔴 Сложная', callback_data: `quiz_difficulty_${category}_hard` }
      ],
      [
        { text: '🔙 Назад', callback_data: 'quiz_menu' }
      ]
    ]
  };

  await ctx.editMessageText(difficultyText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};

// Начало викторины
const startQuiz = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const parts = callbackData.replace('quiz_difficulty_', '').split('_');
  const category = parts[0];
  const difficulty = parts[1];
  
  try {
    // Получаем вопросы
    const questions = await DatabaseService.getQuizQuestions(category, difficulty, 10);
    
    if (questions.length < 10) {
      await ctx.answerCbQuery('❌ Недостаточно вопросов для этой категории');
      return;
    }
    
    // Создаем сессию викторины
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      userId: ctx.user.id,
      category,
      difficulty,
      questions: questions.map(q => q.id),
      currentQuestion: 0,
      answers: [],
      score: 0,
      startTime: Date.now()
    };
    
    await RedisService.setQuizSession(sessionId, session, 1800); // 30 минут
    await DatabaseService.createQuizSession(ctx.user.id, category, difficulty, questions.map(q => q.id));
    
    await ctx.answerCbQuery('🎯 Викторина началась!');
    
    // Показываем первый вопрос
    await showQuestion(ctx, sessionId, questions[0], 0);
    
  } catch (error) {
    console.error('Start quiz error:', error);
    await ctx.answerCbQuery('❌ Ошибка при запуске викторины');
  }
};

// Показ вопроса
const showQuestion = async (ctx, sessionId, question, questionIndex) => {
  const options = JSON.parse(question.options);
  const timeLeft = 15;
  
  const questionText = `🎯 <b>Вопрос ${questionIndex + 1}/10</b>

${question.question}

⏱️ <b>Время:</b> ${timeLeft} секунд`;

  const keyboard = {
    inline_keyboard: [
      options.map((option, index) => ({
        text: `${String.fromCharCode(65 + index)}. ${option}`,
        callback_data: `quiz_answer_${sessionId}_${index}`
      })),
      [
        { text: '⏭️ Пропустить', callback_data: `quiz_answer_${sessionId}_skip` }
      ]
    ]
  };

  await ctx.editMessageText(questionText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
  
  // Устанавливаем таймер
  setTimeout(async () => {
    await handleQuizTimeout(ctx, sessionId);
  }, 15000);
};

// Обработка ответа
const handleQuizAnswer = async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const parts = callbackData.replace('quiz_answer_', '').split('_');
  const sessionId = parts[0];
  const answerIndex = parts[1];
  
  try {
    const session = await RedisService.getQuizSession(sessionId);
    if (!session) {
      await ctx.answerCbQuery('❌ Сессия викторины истекла');
      return;
    }
    
    // Получаем текущий вопрос
    const questions = await DatabaseService.query(
      'SELECT * FROM quiz_questions WHERE id = ANY($1) ORDER BY array_position($1, id)',
      [session.questions]
    );
    
    const currentQuestion = questions.rows[session.currentQuestion];
    const isCorrect = answerIndex !== 'skip' && parseInt(answerIndex) === currentQuestion.correct_answer;
    
    // Сохраняем ответ
    session.answers.push({
      questionId: currentQuestion.id,
      answer: answerIndex === 'skip' ? -1 : parseInt(answerIndex),
      isCorrect,
      timeSpent: Date.now() - session.startTime
    });
    
    if (isCorrect) {
      session.score++;
    }
    
    session.currentQuestion++;
    
    // Обновляем сессию
    await RedisService.setQuizSession(sessionId, session, 1800);
    
    // Показываем результат ответа
    const resultText = isCorrect ? 
      `✅ <b>Правильно!</b>\n\n${currentQuestion.explanation || ''}` :
      `❌ <b>Неправильно!</b>\n\nПравильный ответ: ${JSON.parse(currentQuestion.options)[currentQuestion.correct_answer]}\n\n${currentQuestion.explanation || ''}`;
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '➡️ Следующий вопрос', callback_data: 'quiz_next_question' }
        ]
      ]
    };
    
    await ctx.editMessageText(resultText, { 
      parse_mode: 'HTML', 
      reply_markup: keyboard 
    });
    
    await ctx.answerCbQuery(isCorrect ? '✅ Правильно!' : '❌ Неправильно!');
    
  } catch (error) {
    console.error('Handle quiz answer error:', error);
    await ctx.answerCbQuery('❌ Ошибка при обработке ответа');
  }
};

// Показ следующего вопроса
const showNextQuestion = async (ctx) => {
  try {
    // Получаем sessionId из callback данных
    const callbackData = ctx.callbackQuery?.data || '';
    const sessionId = callbackData.replace('quiz_next_question', '');
    
    const session = await RedisService.getQuizSession(sessionId);
    if (!session) {
      await ctx.answerCbQuery('❌ Сессия викторины истекла');
      return;
    }
    
    if (session.currentQuestion >= session.questions.length) {
      await finishQuiz(ctx);
      return;
    }
    
    // Получаем следующий вопрос
    const questions = await DatabaseService.query(
      'SELECT * FROM quiz_questions WHERE id = ANY($1) ORDER BY array_position($1, id)',
      [session.questions]
    );
    
    const nextQuestion = questions.rows[session.currentQuestion];
    await showQuestion(ctx, sessionId, nextQuestion, session.currentQuestion);
    
  } catch (error) {
    console.error('Show next question error:', error);
    await ctx.answerCbQuery('❌ Ошибка при показе следующего вопроса');
  }
};

// Завершение викторины
const finishQuiz = async (ctx) => {
  try {
    // Получаем sessionId из callback данных
    const callbackData = ctx.callbackQuery?.data || '';
    const sessionId = callbackData.replace('quiz_finish', '');
    
    const session = await RedisService.getQuizSession(sessionId);
    if (!session) {
      await ctx.answerCbQuery('❌ Сессия викторины истекла');
      return;
    }
    
    // Сохраняем результаты в базу данных
    await DatabaseService.updateQuizSession(session.id, session.answers, session.score);
    
    // Вычисляем награды
    const rewards = calculateQuizRewards(session.difficulty, session.score);
    
    // Обновляем баланс пользователя
    await DatabaseService.updateUser(ctx.user.id, {
      coins: ctx.user.coins + rewards.coins,
      gems: ctx.user.gems + rewards.gems,
      experience: ctx.user.experience + rewards.experience
    });
    
    // Добавляем транзакции
    if (rewards.coins > 0) {
      await DatabaseService.addTransaction(
        ctx.user.id,
        'earn',
        rewards.coins,
        'coins',
        `Викторина ${session.category} (${session.difficulty})`
      );
    }
    
    if (rewards.gems > 0) {
      await DatabaseService.addTransaction(
        ctx.user.id,
        'earn',
        rewards.gems,
        'gems',
        `Викторина ${session.category} (${session.difficulty})`
      );
    }
    
    // Обновляем статистику
    await DatabaseService.updateUserStats(ctx.user.id, {
      games_played: 1,
      games_won: session.score >= 7 ? 1 : 0,
      quiz_correct_answers: session.score
    });
    
    // Проверяем достижения
    const newAchievements = await DatabaseService.checkAndAwardAchievement(
      ctx.user.id, 
      'quiz_play', 
      1
    );
    
    // Показываем результаты
    const resultText = `🎯 <b>Викторина завершена!</b>

📊 <b>Результаты:</b>
✅ Правильных ответов: ${session.score}/10
⭐ Оценка: ${getQuizGrade(session.score)}

💰 <b>Награды:</b>
🪙 Монеты: +${rewards.coins}
💎 Драгоценные камни: +${rewards.gems}
📈 Опыт: +${rewards.experience}

${newAchievements.length > 0 ? `🏆 <b>Новые достижения:</b>\n${newAchievements.map(a => `${a.icon} ${a.name}`).join('\n')}` : ''}`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🎯 Еще викторину', callback_data: 'quiz_menu' },
          { text: '🔙 Главное меню', callback_data: 'main_menu' }
        ]
      ]
    };

    await ctx.editMessageText(resultText, { 
      parse_mode: 'HTML', 
      reply_markup: keyboard 
    });
    
    // Очищаем сессию
    await RedisService.del(`quiz:${sessionId}`);
    
  } catch (error) {
    console.error('Finish quiz error:', error);
    await ctx.answerCbQuery('❌ Ошибка при завершении викторины');
  }
};

// Обработка таймаута
const handleQuizTimeout = async (ctx, sessionId) => {
  try {
    const session = await RedisService.getQuizSession(sessionId);
    if (!session) {
      return;
    }
    
    // Помечаем как пропущенный
    session.answers.push({
      questionId: session.questions[session.currentQuestion],
      answer: -1,
      isCorrect: false,
      timeSpent: 15000
    });
    
    session.currentQuestion++;
    
    if (session.currentQuestion >= session.questions.length) {
      await finishQuiz(ctx);
    } else {
      await showNextQuestion(ctx);
    }
    
  } catch (error) {
    console.error('Handle quiz timeout error:', error);
  }
};

// Вычисление наград
function calculateQuizRewards(difficulty, score) {
  const baseRewards = {
    easy: { coins: 50, gems: 0, experience: 10 },
    medium: { coins: 100, gems: 10, experience: 20 },
    hard: { coins: 200, gems: 25, experience: 30 }
  };
  
  const base = baseRewards[difficulty];
  const multiplier = score / 10; // Процент правильных ответов
  
  return {
    coins: Math.floor(base.coins * multiplier),
    gems: Math.floor(base.gems * multiplier),
    experience: Math.floor(base.experience * multiplier)
  };
}

// Получение оценки
function getQuizGrade(score) {
  if (score >= 9) return 'Отлично! 🌟';
  if (score >= 7) return 'Хорошо! 👍';
  if (score >= 5) return 'Удовлетворительно 👌';
  return 'Попробуйте еще раз! 💪';
}

module.exports = {
  showQuizMenu,
  handleCallback
};
