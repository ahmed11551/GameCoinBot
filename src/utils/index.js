// Утилиты для бота

// Форматирование чисел
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Форматирование времени
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м ${secs}с`;
  } else if (minutes > 0) {
    return `${minutes}м ${secs}с`;
  } else {
    return `${secs}с`;
  }
};

// Форматирование даты
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Генерация случайного числа в диапазоне
const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Проверка является ли пользователь админом
const isAdmin = (userId, adminIds) => {
  return adminIds.includes(userId.toString());
};

// Валидация суммы ставки
const validateBetAmount = (amount, minBet, maxBet, userBalance) => {
  if (amount < minBet) {
    return { valid: false, error: `Минимальная ставка: ${minBet} монет` };
  }
  if (amount > maxBet) {
    return { valid: false, error: `Максимальная ставка: ${maxBet} монет` };
  }
  if (amount > userBalance) {
    return { valid: false, error: 'Недостаточно монет' };
  }
  return { valid: true };
};

// Вычисление уровня по опыту
const calculateLevel = (experience) => {
  return Math.floor(experience / 100) + 1;
};

// Вычисление опыта до следующего уровня
const experienceToNextLevel = (experience) => {
  const currentLevel = calculateLevel(experience);
  const nextLevelExp = currentLevel * 100;
  return nextLevelExp - experience;
};

// Генерация эмодзи для прогресс-бара
const createProgressBar = (current, max, length = 10) => {
  const filled = Math.floor((current / max) * length);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
};

// Экранирование HTML
const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Создание клавиатуры с пагинацией
const createPaginatedKeyboard = (items, currentPage, itemsPerPage, callbackPrefix) => {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = items.slice(startIndex, endIndex);
  
  const keyboard = {
    inline_keyboard: []
  };
  
  // Добавляем элементы страницы
  pageItems.forEach(item => {
    keyboard.inline_keyboard.push([{
      text: item.text,
      callback_data: `${callbackPrefix}_${item.id}`
    }]);
  });
  
  // Добавляем навигацию
  if (totalPages > 1) {
    const navRow = [];
    if (currentPage > 0) {
      navRow.push({
        text: '◀️',
        callback_data: `${callbackPrefix}_page_${currentPage - 1}`
      });
    }
    navRow.push({
      text: `${currentPage + 1}/${totalPages}`,
      callback_data: 'noop'
    });
    if (currentPage < totalPages - 1) {
      navRow.push({
        text: '▶️',
        callback_data: `${callbackPrefix}_page_${currentPage + 1}`
      });
    }
    keyboard.inline_keyboard.push(navRow);
  }
  
  return keyboard;
};

// Проверка валидности Telegram ID
const isValidTelegramId = (id) => {
  return /^\d+$/.test(id.toString()) && parseInt(id) > 0;
};

// Создание уникального ID сессии
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Логирование с временной меткой
const logWithTimestamp = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
};

// Проверка времени истечения
const isExpired = (expiryDate) => {
  return new Date(expiryDate) < new Date();
};

// Форматирование валюты
const formatCurrency = (amount, currency = 'монет') => {
  return `${formatNumber(amount)} ${currency}`;
};

// Создание эмодзи для уровня
const getLevelEmoji = (level) => {
  if (level >= 100) return '🏆';
  if (level >= 50) return '🥇';
  if (level >= 25) return '🥈';
  if (level >= 10) return '🥉';
  if (level >= 5) return '⭐';
  return '🌟';
};

// Проверка премиум статуса
const isPremiumActive = (user) => {
  return user.is_premium && new Date(user.premium_expires_at) > new Date();
};

// Вычисление бонуса премиум
const calculatePremiumBonus = (baseAmount, isPremium) => {
  return isPremium ? Math.floor(baseAmount * 1.2) : baseAmount;
};

// Создание сообщения об ошибке
const createErrorMessage = (error, context = '') => {
  const timestamp = new Date().toISOString();
  return `❌ Ошибка${context ? ` в ${context}` : ''}: ${error.message}\nВремя: ${timestamp}`;
};

// Валидация email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Создание случайного цвета
const getRandomColor = () => {
  const colors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Проверка времени суток
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return '🌅 Утро';
  if (hour >= 12 && hour < 18) return '☀️ День';
  if (hour >= 18 && hour < 22) return '🌆 Вечер';
  return '🌙 Ночь';
};

module.exports = {
  formatNumber,
  formatTime,
  formatDate,
  randomBetween,
  isAdmin,
  validateBetAmount,
  calculateLevel,
  experienceToNextLevel,
  createProgressBar,
  escapeHtml,
  createPaginatedKeyboard,
  isValidTelegramId,
  generateSessionId,
  logWithTimestamp,
  isExpired,
  formatCurrency,
  getLevelEmoji,
  isPremiumActive,
  calculatePremiumBonus,
  createErrorMessage,
  isValidEmail,
  getRandomColor,
  getTimeOfDay
};
