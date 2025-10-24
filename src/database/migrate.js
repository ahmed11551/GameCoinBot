const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class DatabaseMigration {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async runMigrations() {
    try {
      console.log('Starting database migrations...');
      
      // Read and execute schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      await this.pool.query(schema);
      console.log('Database schema created successfully');
      
      // Run seed data
      await this.seedData();
      console.log('Seed data inserted successfully');
      
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async seedData() {
    // Insert sample quiz questions
    const quizQuestions = [
      {
        category: 'movies',
        difficulty: 'easy',
        question: 'Какой фильм снял Кристофер Нолан в 2010 году?',
        options: ['["Интерстеллар", "Начало", "Темный рыцарь", "Дюнкерк"]'],
        correct_answer: 1,
        explanation: 'Начало (Inception) был снят Кристофером Ноланом в 2010 году.'
      },
      {
        category: 'movies',
        difficulty: 'medium',
        question: 'В каком году вышел фильм "Криминальное чтиво"?',
        options: ['["1992", "1994", "1996", "1998"]'],
        correct_answer: 1,
        explanation: 'Криминальное чтиво (Pulp Fiction) вышел в 1994 году.'
      },
      {
        category: 'science',
        difficulty: 'easy',
        question: 'Какая планета ближе всего к Солнцу?',
        options: ['["Венера", "Меркурий", "Земля", "Марс"]'],
        correct_answer: 1,
        explanation: 'Меркурий - самая близкая к Солнцу планета.'
      },
      {
        category: 'science',
        difficulty: 'hard',
        question: 'Какой химический элемент имеет атомный номер 79?',
        options: ['["Серебро", "Золото", "Платина", "Медь"]'],
        correct_answer: 1,
        explanation: 'Золото имеет атомный номер 79 в периодической таблице.'
      },
      {
        category: 'music',
        difficulty: 'easy',
        question: 'Кто написал песню "Bohemian Rhapsody"?',
        options: ['["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"]'],
        correct_answer: 1,
        explanation: 'Bohemian Rhapsody была написана группой Queen.'
      }
    ];

    for (const question of quizQuestions) {
      await this.pool.query(
        `INSERT INTO quiz_questions (category, difficulty, question, options, correct_answer, explanation) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [question.category, question.difficulty, question.question, 
         JSON.stringify(question.options), question.correct_answer, question.explanation]
      );
    }

    // Insert achievements
    const achievements = [
      {
        name: 'Первый шаг',
        description: 'Сыграйте первую викторину',
        icon: '🎯',
        condition_type: 'quiz_play',
        condition_value: 1,
        reward_coins: 50
      },
      {
        name: 'Знаток',
        description: 'Правильно ответьте на 10 вопросов',
        icon: '🧠',
        condition_type: 'quiz_correct',
        condition_value: 10,
        reward_coins: 200
      },
      {
        name: 'Кликер',
        description: 'Сделайте 100 кликов',
        icon: '👆',
        condition_type: 'clicker_clicks',
        condition_value: 100,
        reward_coins: 100
      },
      {
        name: 'Азартный игрок',
        description: 'Сыграйте 5 игр в казино',
        icon: '🎰',
        condition_type: 'casino_play',
        condition_value: 5,
        reward_coins: 150
      },
      {
        name: 'Чемпион',
        description: 'Выиграйте турнир',
        icon: '🏆',
        condition_type: 'tournament_win',
        condition_value: 1,
        reward_coins: 500,
        reward_gems: 10
      }
    ];

    for (const achievement of achievements) {
      await this.pool.query(
        `INSERT INTO achievements (name, description, icon, condition_type, condition_value, reward_coins, reward_gems) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [achievement.name, achievement.description, achievement.icon, 
         achievement.condition_type, achievement.condition_value, 
         achievement.reward_coins, achievement.reward_gems]
      );
    }

    // Insert daily quests
    const dailyQuests = [
      {
        name: 'Ежедневная викторина',
        description: 'Сыграйте 3 викторины',
        quest_type: 'quiz_play',
        target_value: 3,
        reward_coins: 100
      },
      {
        name: 'Кликер-марафон',
        description: 'Сделайте 50 кликов',
        quest_type: 'clicker_clicks',
        target_value: 50,
        reward_coins: 75
      },
      {
        name: 'Казино-эксперт',
        description: 'Сыграйте 2 игры в казино',
        quest_type: 'casino_play',
        target_value: 2,
        reward_coins: 80
      }
    ];

    for (const quest of dailyQuests) {
      await this.pool.query(
        `INSERT INTO daily_quests (name, description, quest_type, target_value, reward_coins) 
         VALUES ($1, $2, $3, $4, $5)`,
        [quest.name, quest.description, quest.quest_type, quest.target_value, quest.reward_coins]
      );
    }

    // Insert shop items
    const shopItems = [
      {
        name: '1000 монет',
        description: 'Пакет монет для игр',
        type: 'coins',
        price_stars: 49,
        value: 1000
      },
      {
        name: '5000 монет',
        description: 'Большой пакет монет',
        type: 'coins',
        price_stars: 199,
        value: 5000
      },
      {
        name: '100 драгоценных камней',
        description: 'Премиум валюта',
        type: 'gems',
        price_stars: 99,
        value: 100
      },
      {
        name: 'Премиум подписка',
        description: 'Премиум статус на 30 дней',
        type: 'premium',
        price_stars: 299,
        value: 30
      }
    ];

    for (const item of shopItems) {
      await this.pool.query(
        `INSERT INTO shop_items (name, description, type, price_stars, value) 
         VALUES ($1, $2, $3, $4, $5)`,
        [item.name, item.description, item.type, item.price_stars, item.value]
      );
    }
  }

  async close() {
    await this.pool.end();
  }
}

// Run migrations if called directly
if (require.main === module) {
  const migration = new DatabaseMigration();
  migration.runMigrations()
    .then(() => {
      console.log('Migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migrations failed:', error);
      process.exit(1);
    });
}

module.exports = DatabaseMigration;
