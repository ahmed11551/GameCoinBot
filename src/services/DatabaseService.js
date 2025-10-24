const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    this.pool = null;
  }

  static init(pool) {
    this.pool = pool;
  }

  static async query(text, params) {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }
    return await this.pool.query(text, params);
  }

  static async getUserByTelegramId(telegramId) {
    const result = await this.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );
    return result.rows[0];
  }

  static async createUser(userData) {
    const { telegramId, username, firstName, lastName, languageCode } = userData;
    const result = await this.query(
      `INSERT INTO users (telegram_id, username, first_name, last_name, language_code, coins) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [telegramId, username, firstName, lastName, languageCode, 1000]
    );
    
    // Create user stats
    await this.query(
      'INSERT INTO user_stats (user_id) VALUES ($1)',
      [result.rows[0].id]
    );
    
    return result.rows[0];
  }

  static async updateUser(userId, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const result = await this.query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [userId, ...values]
    );
    return result.rows[0];
  }

  static async addTransaction(userId, type, amount, currency, description, metadata = null) {
    const result = await this.query(
      `INSERT INTO transactions (user_id, type, amount, currency, description, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, type, amount, currency, description, metadata]
    );
    return result.rows[0];
  }

  static async getUserTransactions(userId, limit = 10) {
    const result = await this.query(
      `SELECT * FROM transactions WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async updateUserStats(userId, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = ${field} + $${index + 2}`).join(', ');
    
    await this.query(
      `UPDATE user_stats SET ${setClause}, updated_at = NOW() WHERE user_id = $1`,
      [userId, ...values]
    );
  }

  static async getQuizQuestions(category, difficulty, limit = 10) {
    const result = await this.query(
      `SELECT * FROM quiz_questions 
       WHERE category = $1 AND difficulty = $2 AND is_active = true 
       ORDER BY RANDOM() LIMIT $3`,
      [category, difficulty, limit]
    );
    return result.rows;
  }

  static async createQuizSession(userId, category, difficulty, questions) {
    const result = await this.query(
      `INSERT INTO quiz_sessions (user_id, category, difficulty, questions) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, category, difficulty, JSON.stringify(questions)]
    );
    return result.rows[0];
  }

  static async updateQuizSession(sessionId, answers, score) {
    const result = await this.query(
      `UPDATE quiz_sessions SET answers = $1, score = $2, completed_at = NOW() 
       WHERE id = $3 RETURNING *`,
      [JSON.stringify(answers), score, sessionId]
    );
    return result.rows[0];
  }

  static async createCasinoGame(userId, gameType, betAmount, result, winAmount) {
    const result = await this.query(
      `INSERT INTO casino_games (user_id, game_type, bet_amount, result, win_amount) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, gameType, betAmount, JSON.stringify(result), winAmount]
    );
    return result.rows[0];
  }

  static async getLeaderboard(limit = 10) {
    const result = await this.query(
      `SELECT u.telegram_id, u.username, u.first_name, u.coins, u.level, 
              us.games_won, us.tournaments_won
       FROM users u 
       JOIN user_stats us ON u.id = us.user_id 
       ORDER BY u.coins DESC, u.level DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  static async getActiveTournaments() {
    const result = await this.query(
      `SELECT * FROM tournaments 
       WHERE status = 'active' AND end_date > NOW() 
       ORDER BY start_date ASC`
    );
    return result.rows;
  }

  static async joinTournament(tournamentId, userId) {
    const result = await this.query(
      `INSERT INTO tournament_participants (tournament_id, user_id) 
       VALUES ($1, $2) RETURNING *`,
      [tournamentId, userId]
    );
    return result.rows[0];
  }

  static async getUserAchievements(userId) {
    const result = await this.query(
      `SELECT a.*, ua.earned_at FROM achievements a
       JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = $1
       ORDER BY ua.earned_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async checkAndAwardAchievement(userId, conditionType, conditionValue) {
    // Get user's current stats for this condition
    let currentValue = 0;
    
    switch (conditionType) {
      case 'quiz_play':
        const quizStats = await this.query(
          'SELECT games_played FROM user_stats WHERE user_id = $1',
          [userId]
        );
        currentValue = quizStats.rows[0]?.games_played || 0;
        break;
      case 'quiz_correct':
        const correctStats = await this.query(
          'SELECT quiz_correct_answers FROM user_stats WHERE user_id = $1',
          [userId]
        );
        currentValue = correctStats.rows[0]?.quiz_correct_answers || 0;
        break;
      case 'clicker_clicks':
        const clickStats = await this.query(
          'SELECT clicker_clicks FROM user_stats WHERE user_id = $1',
          [userId]
        );
        currentValue = clickStats.rows[0]?.clicker_clicks || 0;
        break;
    }

    // Check if user qualifies for any achievements
    const achievements = await this.query(
      `SELECT * FROM achievements 
       WHERE condition_type = $1 AND condition_value <= $2 AND is_active = true`,
      [conditionType, currentValue]
    );

    const newAchievements = [];
    
    for (const achievement of achievements.rows) {
      // Check if user already has this achievement
      const existing = await this.query(
        'SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2',
        [userId, achievement.id]
      );

      if (existing.rows.length === 0) {
        // Award achievement
        await this.query(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)',
          [userId, achievement.id]
        );

        // Add rewards
        if (achievement.reward_coins > 0) {
          await this.query(
            'UPDATE users SET coins = coins + $1 WHERE id = $2',
            [achievement.reward_coins, userId]
          );
        }

        if (achievement.reward_gems > 0) {
          await this.query(
            'UPDATE users SET gems = gems + $1 WHERE id = $2',
            [achievement.reward_gems, userId]
          );
        }

        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }
}

module.exports = DatabaseService;
