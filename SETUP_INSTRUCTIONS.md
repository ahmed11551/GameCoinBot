# 🔧 Настройка CoinMaster Bot

## ✅ Токен бота получен и проверен!

**Информация о боте:**
- **Название**: CoinMaster Game Bot
- **Username**: @new_coinmaster_game_bot
- **ID**: 8479237154
- **Токен**: 8479237154:AAGPnOMzFdHcOi6A5Y-gPxQnq2q7BHJULq8

## 📝 Настройка переменных окружения

Создайте файл `.env` в корневой директории проекта со следующим содержимым:

```env
# Telegram Bot Configuration
BOT_TOKEN=8479237154:AAGPnOMzFdHcOi6A5Y-gPxQnq2q7BHJULq8
WEBHOOK_URL=https://your-domain.com/webhook

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/coinmaster_bot
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coinmaster_bot
DB_USER=username
DB_PASSWORD=password

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Application Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Security
JWT_SECRET=coinmaster_jwt_secret_key_2024
ENCRYPTION_KEY=coinmaster_encryption_key_2024

# Game Configuration
DAILY_BONUS_COINS=100
NEW_USER_BONUS_COINS=1000
MAX_DAILY_CASINO_LOSS=5000
MAX_BET_AMOUNT=1000

# Telegram Stars Integration
TELEGRAM_STARS_ENABLED=true
STARS_TO_COINS_RATE=1
STARS_TO_GEMS_RATE=0.1

# Admin Configuration
ADMIN_USER_IDS=123456789,987654321
SUPPORT_CHAT_ID=-1001234567890
```

## 🗄️ Настройка базы данных

### PostgreSQL:
1. Установите PostgreSQL
2. Создайте базу данных:
   ```sql
   CREATE DATABASE coinmaster_bot;
   CREATE USER coinmaster_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE coinmaster_bot TO coinmaster_user;
   ```
3. Обновите DATABASE_URL в .env файле

### Redis:
1. Установите Redis
2. Запустите Redis сервер:
   ```bash
   redis-server
   ```

## 🚀 Запуск проекта

### 1. Выполните миграции базы данных:
```bash
npm run migrate
```

### 2. Запустите бота:
```bash
npm start
```

### 3. Для разработки с автоперезагрузкой:
```bash
npm run dev
```

## 🧪 Тестирование бота

1. Найдите бота в Telegram: @new_coinmaster_game_bot
2. Отправьте команду `/start`
3. Проверьте все функции:
   - Профиль пользователя
   - Викторины
   - Казино игры
   - Кликер
   - Турниры
   - Магазин

## 📱 Настройка Mini App (опционально)

1. Создайте веб-приложение
2. Загрузите на хостинг
3. Настройте домен в BotFather:
   ```
   /setdomain
   @new_coinmaster_game_bot
   your-domain.com
   ```

## 🔧 Настройка команд бота

Отправьте BotFather команду `/setcommands`:

```
start - 🎮 Главное меню
profile - 👤 Профиль игрока
balance - 💰 Баланс и магазин
quiz - 🎯 Викторины
casino - 🎰 Казино игры
clicker - 👆 Кликер игра
farm - 🚜 Idle ферма
tournaments - 🏆 Турниры
leaderboard - 📊 Таблица лидеров
buy - 🛒 Магазин
support - ❓ Поддержка
```

## 🎯 Готово!

Ваш CoinMaster Bot готов к использованию! 

**Ссылки:**
- 🤖 **Бот**: [@new_coinmaster_game_bot](https://t.me/new_coinmaster_game_bot)
- 📁 **Репозиторий**: [GitHub](https://github.com/ahmed11551/GameCoinBot.git)
- 📖 **Документация**: README.md

**Удачи с вашим игровым ботом! 🎮✨**
