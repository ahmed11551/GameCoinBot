require('dotenv').config();
const { Telegraf } = require('telegraf');
const { Pool } = require('pg');
const Redis = require('redis');

// Import handlers
const startHandler = require('./handlers/start');
const profileHandler = require('./handlers/profile');
const balanceHandler = require('./handlers/balance');
const quizHandler = require('./handlers/quiz');
const casinoHandler = require('./handlers/casino');
const clickerHandler = require('./handlers/clicker');
const tournamentHandler = require('./handlers/tournament');

// Import middleware
const userMiddleware = require('./middleware/user');
const rateLimitMiddleware = require('./middleware/rateLimit');

// Import services
const DatabaseService = require('./services/DatabaseService');
const RedisService = require('./services/RedisService');

class GameBot {
  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL,
    });
    
    this.setupServices();
    this.setupMiddleware();
    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupServices() {
    DatabaseService.init(this.db);
    RedisService.init(this.redis);
  }

  setupMiddleware() {
    this.bot.use(userMiddleware);
    this.bot.use(rateLimitMiddleware);
  }

  setupHandlers() {
    // Main commands
    this.bot.start(startHandler);
    this.bot.command('profile', profileHandler);
    this.bot.command('balance', balanceHandler);
    this.bot.command('leaderboard', require('./handlers/leaderboard'));
    this.bot.command('support', require('./handlers/support'));

    // Game commands
    this.bot.command('quiz', quizHandler);
    this.bot.command('casino', casinoHandler);
    this.bot.command('clicker', clickerHandler);
    this.bot.command('farm', require('./handlers/farm'));
    this.bot.command('tournaments', tournamentHandler);
    this.bot.command('buy', require('./handlers/shop'));

    // Callback queries
    this.bot.on('callback_query', require('./handlers/callback'));
  }

  setupErrorHandling() {
    this.bot.catch((err, ctx) => {
      console.error('Bot error:', err);
      ctx.reply('Произошла ошибка. Попробуйте позже или обратитесь в поддержку.');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  async start() {
    try {
      await this.redis.connect();
      console.log('Redis connected');
      
      await this.db.connect();
      console.log('Database connected');

      if (process.env.NODE_ENV === 'production') {
        await this.bot.launch({
          webhook: {
            domain: process.env.WEBHOOK_URL,
            port: process.env.PORT || 3000,
          },
        });
        console.log('Bot started with webhook');
      } else {
        await this.bot.launch();
        console.log('Bot started in polling mode');
      }

      // Graceful shutdown
      process.once('SIGINT', () => this.stop('SIGINT'));
      process.once('SIGTERM', () => this.stop('SIGTERM'));
    } catch (error) {
      console.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  async stop(signal) {
    console.log(`Stopping bot with signal: ${signal}`);
    this.bot.stop(signal);
    await this.redis.quit();
    await this.db.end();
    process.exit(0);
  }
}

// Start the bot
const gameBot = new GameBot();
gameBot.start();
