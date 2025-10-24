// Модуль викторин с полной логикой
const quizQuestions = {
  movies: {
    easy: [
      {
        question: "Какой фильм снял Кристофер Нолан в 2010 году?",
        options: ["Интерстеллар", "Начало", "Темный рыцарь", "Дюнкерк"],
        correct: 1,
        explanation: "Начало (Inception) был снят Кристофером Ноланом в 2010 году."
      },
      {
        question: "В каком году вышел фильм 'Титаник'?",
        options: ["1995", "1997", "1999", "2001"],
        correct: 1,
        explanation: "Титаник вышел в 1997 году и стал одним из самых кассовых фильмов."
      },
      {
        question: "Кто сыграл главную роль в фильме 'Форрест Гамп'?",
        options: ["Том Круз", "Том Хэнкс", "Брэд Питт", "Леонардо ДиКаприо"],
        correct: 1,
        explanation: "Том Хэнкс сыграл главную роль в фильме 'Форрест Гамп'."
      }
    ],
    medium: [
      {
        question: "Какой фильм получил Оскар за лучший фильм в 2020 году?",
        options: ["Джокер", "Паразиты", "1917", "Однажды в Голливуде"],
        correct: 1,
        explanation: "Паразиты (Parasite) получили Оскар за лучший фильм в 2020 году."
      },
      {
        question: "В каком фильме звучит фраза 'Я буду возвращаться'?",
        options: ["Хищник", "Терминатор", "Робокоп", "Бегущий по лезвию"],
        correct: 1,
        explanation: "Фраза 'I'll be back' звучит в фильме 'Терминатор'."
      }
    ],
    hard: [
      {
        question: "Какой режиссер снял фильм 'Сталкер'?",
        options: ["Андрей Тарковский", "Сергей Эйзенштейн", "Александр Сокуров", "Никита Михалков"],
        correct: 0,
        explanation: "Андрей Тарковский снял фильм 'Сталкер' в 1979 году."
      }
    ]
  },
  music: {
    easy: [
      {
        question: "Кто написал песню 'Bohemian Rhapsody'?",
        options: ["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"],
        correct: 1,
        explanation: "Bohemian Rhapsody была написана группой Queen."
      },
      {
        question: "В каком году группа The Beatles распалась?",
        options: ["1968", "1970", "1972", "1974"],
        correct: 1,
        explanation: "The Beatles официально распались в 1970 году."
      }
    ],
    medium: [
      {
        question: "Какой альбом Майкла Джексона стал самым продаваемым в истории?",
        options: ["Off the Wall", "Thriller", "Bad", "Dangerous"],
        correct: 1,
        explanation: "Альбом 'Thriller' Майкла Джексона стал самым продаваемым в истории."
      }
    ],
    hard: [
      {
        question: "Кто написал оперу 'Кармен'?",
        options: ["Джузеппе Верди", "Жорж Бизе", "Вольфганг Амадей Моцарт", "Рихард Вагнер"],
        correct: 1,
        explanation: "Оперу 'Кармен' написал французский композитор Жорж Бизе."
      }
    ]
  },
  science: {
    easy: [
      {
        question: "Какая планета ближе всего к Солнцу?",
        options: ["Венера", "Меркурий", "Земля", "Марс"],
        correct: 1,
        explanation: "Меркурий - самая близкая к Солнцу планета."
      },
      {
        question: "Сколько костей в теле взрослого человека?",
        options: ["186", "206", "226", "246"],
        correct: 1,
        explanation: "В теле взрослого человека 206 костей."
      }
    ],
    medium: [
      {
        question: "Какой химический элемент имеет атомный номер 79?",
        options: ["Серебро", "Золото", "Платина", "Медь"],
        correct: 1,
        explanation: "Золото имеет атомный номер 79 в периодической таблице."
      }
    ],
    hard: [
      {
        question: "Кто открыл закон всемирного тяготения?",
        options: ["Галилео Галилей", "Исаак Ньютон", "Альберт Эйнштейн", "Николай Коперник"],
        correct: 1,
        explanation: "Исаак Ньютон открыл закон всемирного тяготения."
      }
    ]
  },
  games: {
    easy: [
      {
        question: "В какой игре главный герой собирает кольца?",
        options: ["Mario", "Sonic", "Zelda", "Pokemon"],
        correct: 1,
        explanation: "Соник собирает кольца в играх серии Sonic the Hedgehog."
      },
      {
        question: "Какая компания создала игру Minecraft?",
        options: ["Microsoft", "Mojang", "EA", "Ubisoft"],
        correct: 1,
        explanation: "Minecraft была создана шведской компанией Mojang."
      }
    ],
    medium: [
      {
        question: "В каком году вышла первая игра серии The Legend of Zelda?",
        options: ["1984", "1986", "1988", "1990"],
        correct: 1,
        explanation: "Первая игра The Legend of Zelda вышла в 1986 году."
      }
    ],
    hard: [
      {
        question: "Кто создал первую видеоигру 'Pong'?",
        options: ["Nolan Bushnell", "Shigeru Miyamoto", "Sid Meier", "Will Wright"],
        correct: 0,
        explanation: "Nolan Bushnell создал первую видеоигру 'Pong' в 1972 году."
      }
    ]
  }
};

// Активные сессии викторин
const quizSessions = new Map();

// Начало викторины
function startQuiz(userId, category, difficulty) {
  const questions = quizQuestions[category]?.[difficulty];
  if (!questions || questions.length === 0) {
    return null;
  }

  // Выбираем случайные вопросы
  const selectedQuestions = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(10, questions.length));

  const session = {
    userId,
    category,
    difficulty,
    questions: selectedQuestions,
    currentQuestion: 0,
    answers: [],
    score: 0,
    startTime: Date.now(),
    timePerQuestion: 15000 // 15 секунд
  };

  quizSessions.set(userId, session);
  return session;
}

// Получение текущего вопроса
function getCurrentQuestion(userId) {
  const session = quizSessions.get(userId);
  if (!session || session.currentQuestion >= session.questions.length) {
    return null;
  }
  return session.questions[session.currentQuestion];
}

// Ответ на вопрос
function answerQuestion(userId, answerIndex) {
  const session = quizSessions.get(userId);
  if (!session) return null;

  const currentQuestion = session.questions[session.currentQuestion];
  const isCorrect = answerIndex === currentQuestion.correct;
  
  session.answers.push({
    questionId: session.currentQuestion,
    answer: answerIndex,
    isCorrect,
    timeSpent: Date.now() - session.startTime
  });

  if (isCorrect) {
    session.score++;
  }

  session.currentQuestion++;
  return {
    isCorrect,
    correctAnswer: currentQuestion.correct,
    explanation: currentQuestion.explanation,
    isFinished: session.currentQuestion >= session.questions.length
  };
}

// Завершение викторины
function finishQuiz(userId) {
  const session = quizSessions.get(userId);
  if (!session) return null;

  const result = {
    score: session.score,
    totalQuestions: session.questions.length,
    percentage: Math.round((session.score / session.questions.length) * 100),
    timeSpent: Date.now() - session.startTime,
    category: session.category,
    difficulty: session.difficulty
  };

  // Вычисляем награды
  const rewards = calculateQuizRewards(session.difficulty, result.percentage);
  result.rewards = rewards;

  // Удаляем сессию
  quizSessions.delete(userId);
  
  return result;
}

// Вычисление наград
function calculateQuizRewards(difficulty, percentage) {
  const baseRewards = {
    easy: { coins: 50, gems: 0, experience: 10 },
    medium: { coins: 100, gems: 10, experience: 20 },
    hard: { coins: 200, gems: 25, experience: 30 }
  };

  const base = baseRewards[difficulty];
  const multiplier = percentage / 100;

  return {
    coins: Math.floor(base.coins * multiplier),
    gems: Math.floor(base.gems * multiplier),
    experience: Math.floor(base.experience * multiplier)
  };
}

// Получение оценки
function getQuizGrade(percentage) {
  if (percentage >= 90) return 'Отлично! 🌟';
  if (percentage >= 70) return 'Хорошо! 👍';
  if (percentage >= 50) return 'Удовлетворительно 👌';
  return 'Попробуйте еще раз! 💪';
}

// Проверка активной сессии
function hasActiveSession(userId) {
  return quizSessions.has(userId);
}

// Получение прогресса
function getQuizProgress(userId) {
  const session = quizSessions.get(userId);
  if (!session) return null;

  return {
    currentQuestion: session.currentQuestion + 1,
    totalQuestions: session.questions.length,
    score: session.score,
    category: session.category,
    difficulty: session.difficulty
  };
}

module.exports = {
  quizQuestions,
  startQuiz,
  getCurrentQuestion,
  answerQuestion,
  finishQuiz,
  hasActiveSession,
  getQuizProgress,
  getQuizGrade
};
