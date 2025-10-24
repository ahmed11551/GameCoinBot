const Redis = require('redis');

class RedisService {
  constructor() {
    this.client = null;
  }

  static init(client) {
    this.client = client;
  }

  static async get(key) {
    if (!this.client) {
      throw new Error('Redis not initialized');
    }
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  static async set(key, value, ttl = null) {
    if (!this.client) {
      throw new Error('Redis not initialized');
    }
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  static async del(key) {
    if (!this.client) {
      throw new Error('Redis not initialized');
    }
    await this.client.del(key);
  }

  static async exists(key) {
    if (!this.client) {
      throw new Error('Redis not initialized');
    }
    return await this.client.exists(key);
  }

  static async incr(key) {
    if (!this.client) {
      throw new Error('Redis not initialized');
    }
    return await this.client.incr(key);
  }

  static async decr(key) {
    if (!this.client) {
      throw new Error('Redis not initialized');
    }
    return await this.client.decr(key);
  }

  static async expire(key, ttl) {
    if (!this.client) {
      throw new Error('Redis not initialized');
    }
    await this.client.expire(key, ttl);
  }

  // Game-specific methods
  static async setUserSession(userId, sessionData, ttl = 3600) {
    const key = `session:${userId}`;
    await this.set(key, sessionData, ttl);
  }

  static async getUserSession(userId) {
    const key = `session:${userId}`;
    return await this.get(key);
  }

  static async clearUserSession(userId) {
    const key = `session:${userId}`;
    await this.del(key);
  }

  static async setQuizSession(sessionId, sessionData, ttl = 1800) {
    const key = `quiz:${sessionId}`;
    await this.set(key, sessionData, ttl);
  }

  static async getQuizSession(sessionId) {
    const key = `quiz:${sessionId}`;
    return await this.get(key);
  }

  static async setClickerSession(userId, sessionData, ttl = 3600) {
    const key = `clicker:${userId}`;
    await this.set(key, sessionData, ttl);
  }

  static async getClickerSession(userId) {
    const key = `clicker:${userId}`;
    return await this.get(key);
  }

  static async setRateLimit(userId, action, ttl = 60) {
    const key = `rate_limit:${userId}:${action}`;
    const current = await this.incr(key);
    if (current === 1) {
      await this.expire(key, ttl);
    }
    return current;
  }

  static async checkRateLimit(userId, action, limit = 10) {
    const key = `rate_limit:${userId}:${action}`;
    const current = await this.get(key) || 0;
    return current < limit;
  }

  static async setLeaderboard(data, ttl = 300) {
    const key = 'leaderboard';
    await this.set(key, data, ttl);
  }

  static async getLeaderboard() {
    const key = 'leaderboard';
    return await this.get(key);
  }

  static async setTournamentLeaderboard(tournamentId, data, ttl = 60) {
    const key = `tournament_leaderboard:${tournamentId}`;
    await this.set(key, data, ttl);
  }

  static async getTournamentLeaderboard(tournamentId) {
    const key = `tournament_leaderboard:${tournamentId}`;
    return await this.get(key);
  }

  static async setDailyBonus(userId, ttl = 86400) {
    const key = `daily_bonus:${userId}`;
    await this.set(key, true, ttl);
  }

  static async hasDailyBonus(userId) {
    const key = `daily_bonus:${userId}`;
    return await this.exists(key);
  }

  static async setCasinoLimit(userId, amount, ttl = 86400) {
    const key = `casino_limit:${userId}`;
    const current = await this.get(key) || 0;
    await this.set(key, current + amount, ttl);
  }

  static async getCasinoLimit(userId) {
    const key = `casino_limit:${userId}`;
    return await this.get(key) || 0;
  }

  static async resetCasinoLimit(userId) {
    const key = `casino_limit:${userId}`;
    await this.del(key);
  }
}

module.exports = RedisService;
