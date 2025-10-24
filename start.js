#!/usr/bin/env node

/**
 * Скрипт для быстрого запуска игрового Telegram бота
 * 
 * Использование:
 * node start.js
 * 
 * Или с переменными окружения:
 * BOT_TOKEN=your_token node start.js
 */

require('dotenv').config();

// Проверяем наличие необходимых переменных окружения
const requiredEnvVars = ['BOT_TOKEN', 'DATABASE_URL', 'REDIS_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Ошибка: Переменная окружения ${envVar} не установлена`);
    console.error('📝 Создайте файл .env на основе env.example и заполните необходимые значения');
    process.exit(1);
  }
}

console.log('🚀 Запуск игрового Telegram бота...');
console.log('📋 Проверка конфигурации...');

// Проверяем подключение к базе данных
const { Pool } = require('pg');
const Redis = require('redis');

async function checkConnections() {
  try {
    // Проверяем PostgreSQL
    const dbPool = new Pool({ connectionString: process.env.DATABASE_URL });
    await dbPool.query('SELECT 1');
    console.log('✅ PostgreSQL подключен');
    await dbPool.end();
    
    // Проверяем Redis
    const redisClient = Redis.createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    await redisClient.ping();
    console.log('✅ Redis подключен');
    await redisClient.quit();
    
    console.log('🎉 Все подключения успешны!');
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    return false;
  }
}

async function startBot() {
  const connectionsOk = await checkConnections();
  
  if (!connectionsOk) {
    console.error('❌ Не удалось подключиться к базе данных или Redis');
    console.error('💡 Убедитесь, что PostgreSQL и Redis запущены и доступны');
    process.exit(1);
  }
  
  console.log('🤖 Запуск бота...');
  
  try {
    // Запускаем основной файл бота
    require('./src/index.js');
  } catch (error) {
    console.error('❌ Ошибка при запуске бота:', error);
    process.exit(1);
  }
}

// Обработка сигналов завершения
process.on('SIGINT', () => {
  console.log('\n👋 Получен сигнал SIGINT, завершение работы...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Получен сигнал SIGTERM, завершение работы...');
  process.exit(0);
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение промиса:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Необработанное исключение:', error);
  process.exit(1);
});

// Запускаем бота
startBot();
