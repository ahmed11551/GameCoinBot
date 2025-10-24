#!/usr/bin/env node

// Скрипт для запуска миграций базы данных
const DatabaseMigration = require('./migrate');

async function main() {
  console.log('🚀 Запуск миграций базы данных...');
  
  try {
    const migration = new DatabaseMigration();
    await migration.runMigrations();
    console.log('✅ Миграции выполнены успешно!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграций:', error);
    process.exit(1);
  }
}

main();
