// Реферальная система
const referralSystem = {
  // Награды за рефералов
  rewards: {
    referrer: {
      gems: 5, // Драгоценные камни за каждого реферала
      coins: 100 // Монеты за каждого реферала
    },
    referee: {
      gems: 3, // Драгоценные камни за регистрацию по реферальной ссылке
      coins: 50 // Монеты за регистрацию по реферальной ссылке
    }
  },

  // Бонусы за количество рефералов
  milestones: [
    {
      referrals: 5,
      reward: { gems: 25, coins: 500 },
      title: 'Начинающий рекрутер'
    },
    {
      referrals: 10,
      reward: { gems: 50, coins: 1000 },
      title: 'Опытный рекрутер'
    },
    {
      referrals: 25,
      reward: { gems: 100, coins: 2500 },
      title: 'Мастер рекрутинга'
    },
    {
      referrals: 50,
      reward: { gems: 200, coins: 5000 },
      title: 'Легенда рекрутинга'
    }
  ]
};

// Реферальные данные пользователей
const referralData = new Map();

// Получение реферального кода пользователя
function getReferralCode(userId) {
  if (!referralData.has(userId)) {
    referralData.set(userId, {
      userId: userId,
      referralCode: generateReferralCode(userId),
      referrals: [],
      totalEarnings: { gems: 0, coins: 0 },
      milestones: []
    });
  }
  return referralData.get(userId);
}

// Генерация реферального кода
function generateReferralCode(userId) {
  // Создаем код на основе ID пользователя
  const code = `REF${userId.toString().slice(-6)}`;
  return code;
}

// Регистрация по реферальной ссылке
function registerReferral(newUserId, referralCode) {
  // Находим пользователя по реферальному коду
  let referrerUserId = null;
  
  for (const [userId, data] of referralData) {
    if (data.referralCode === referralCode) {
      referrerUserId = userId;
      break;
    }
  }
  
  if (!referrerUserId) {
    return { success: false, error: 'Неверный реферальный код' };
  }
  
  // Проверяем, что пользователь еще не был зарегистрирован
  const newUserData = getReferralData(newUserId);
  if (newUserData.referredBy) {
    return { success: false, error: 'Пользователь уже зарегистрирован по реферальной ссылке' };
  }
  
  // Регистрируем реферала
  const referrerData = getReferralData(referrerUserId);
  referrerData.referrals.push({
    userId: newUserId,
    registeredAt: Date.now()
  });
  
  // Обновляем данные нового пользователя
  newUserData.referredBy = referrerUserId;
  newUserData.registeredAt = Date.now();
  
  // Выдаем награды
  const referrerReward = referralSystem.rewards.referrer;
  const refereeReward = referralSystem.rewards.referee;
  
  // Обновляем заработок реферера
  referrerData.totalEarnings.gems += referrerReward.gems;
  referrerData.totalEarnings.coins += referrerReward.coins;
  
  // Проверяем достижения
  checkMilestones(referrerUserId);
  
  return {
    success: true,
    referrer: {
      userId: referrerUserId,
      reward: referrerReward
    },
    referee: {
      userId: newUserId,
      reward: refereeReward
    }
  };
}

// Получение реферальных данных
function getReferralData(userId) {
  if (!referralData.has(userId)) {
    referralData.set(userId, {
      userId: userId,
      referralCode: generateReferralCode(userId),
      referrals: [],
      referredBy: null,
      registeredAt: null,
      totalEarnings: { gems: 0, coins: 0 },
      milestones: []
    });
  }
  return referralData.get(userId);
}

// Проверка достижений
function checkMilestones(userId) {
  const data = getReferralData(userId);
  const referralCount = data.referrals.length;
  
  for (const milestone of referralSystem.milestones) {
    if (referralCount >= milestone.referrals && !data.milestones.includes(milestone.referrals)) {
      data.milestones.push(milestone.referrals);
      
      // Выдаем награду за достижение
      data.totalEarnings.gems += milestone.reward.gems;
      data.totalEarnings.coins += milestone.reward.coins;
      
      return {
        achieved: true,
        milestone: milestone,
        reward: milestone.reward
      };
    }
  }
  
  return { achieved: false };
}

// Получение статистики рефералов
function getReferralStats(userId) {
  const data = getReferralData(userId);
  
  return {
    referralCode: data.referralCode,
    referralCount: data.referrals.length,
    totalEarnings: data.totalEarnings,
    milestones: data.milestones,
    referredBy: data.referredBy,
    recentReferrals: data.referrals.slice(-5) // Последние 5 рефералов
  };
}

// Получение топ рекрутеров
function getTopRecruiters(limit = 10) {
  const recruiters = Array.from(referralData.values())
    .filter(data => data.referrals.length > 0)
    .sort((a, b) => b.referrals.length - a.referrals.length)
    .slice(0, limit);
  
  return recruiters.map(data => ({
    userId: data.userId,
    referralCount: data.referrals.length,
    totalEarnings: data.totalEarnings
  }));
}

// Получение реферальной ссылки
function getReferralLink(userId) {
  const data = getReferralData(userId);
  return `https://t.me/new_coinmaster_game_bot?start=ref_${data.referralCode}`;
}

// Проверка реферального кода из команды /start
function parseStartCommand(startParam) {
  if (startParam && startParam.startsWith('ref_')) {
    const referralCode = startParam.replace('ref_', '');
    return { isReferral: true, referralCode: referralCode };
  }
  
  return { isReferral: false };
}

// Получение общей статистики реферальной системы
function getSystemStats() {
  const totalUsers = referralData.size;
  const totalReferrals = Array.from(referralData.values())
    .reduce((sum, data) => sum + data.referrals.length, 0);
  
  const totalEarnings = Array.from(referralData.values())
    .reduce((sum, data) => ({
      gems: sum.gems + data.totalEarnings.gems,
      coins: sum.coins + data.totalEarnings.coins
    }), { gems: 0, coins: 0 });
  
  return {
    totalUsers,
    totalReferrals,
    totalEarnings,
    averageReferralsPerUser: totalUsers > 0 ? totalReferrals / totalUsers : 0
  };
}

module.exports = {
  referralSystem,
  getReferralCode,
  registerReferral,
  getReferralData,
  getReferralStats,
  getTopRecruiters,
  getReferralLink,
  parseStartCommand,
  getSystemStats
};
