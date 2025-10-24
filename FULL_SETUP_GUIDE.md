# 🚀 Полная инструкция по настройке CoinMaster Bot

## 📋 Пошаговый план

### 1. 🎯 Выбор названия проекта
**Рекомендуемое название**: `coinmaster-bot`

**Альтернативы**:
- `gameverse-bot`
- `playcoins-bot` 
- `arcadebot`
- `gametopia-bot`

### 2. 📁 Загрузка на GitHub

#### Windows:
```cmd
setup-git.bat YOUR_GITHUB_USERNAME
```

#### Linux/Mac:
```bash
chmod +x setup-git.sh
./setup-git.sh YOUR_GITHUB_USERNAME
```

### 3. 🤖 Создание Telegram бота

1. **Найдите [@BotFather](https://t.me/BotFather) в Telegram**
2. **Отправьте команду**: `/newbot`
3. **Введите название**: `CoinMaster Game Bot`
4. **Введите username**: `coinmaster_game_bot` (или ваш вариант)
5. **Сохраните токен** (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 4. ⚙️ Настройка бота через BotFather

#### Команды бота:
```
/setcommands
@coinmaster_game_bot

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

#### Описание бота:
```
/setdescription
@coinmaster_game_bot

🎮 CoinMaster - игровой бот с внутренней валютой!

🎯 Викторины с призами
🎰 Мини-казино игры
👆 Кликер игра с улучшениями
🏆 Турнирная система
💎 Премиум подписка
🛒 Магазин с Telegram Stars

Зарабатывайте монеты, участвуйте в турнирах и становитесь чемпионом!
```

#### Текст "О боте":
```
/setabouttext
@coinmaster_game_bot

🎮 CoinMaster Game Bot

Полнофункциональный игровой бот с внутренней виртуальной валютой.

🎯 Викторины - проверьте свои знания
🎰 Казино - азартные игры на монеты
👆 Кликер - зарабатывайте кликами
🏆 Турниры - соревнуйтесь с другими
💎 Премиум - эксклюзивные функции

Начните играть прямо сейчас! 🚀
```

### 5. 🔧 Настройка окружения

Создайте файл `.env`:
```env
# Telegram Bot Configuration
BOT_TOKEN=ваш_токен_от_BotFather
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
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here

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

### 6. 🗄️ Настройка базы данных

#### PostgreSQL:
```bash
# Создание базы данных
createdb coinmaster_bot

# Выполнение миграций
npm run migrate
```

#### Redis:
```bash
# Запуск Redis
redis-server

# Проверка подключения
redis-cli ping
```

### 7. 🚀 Запуск бота

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Или обычный запуск
npm start
```

### 8. 📱 Настройка Mini App (опционально)

#### Создание веб-приложения:
1. Создайте HTML файл с интерфейсом игры
2. Загрузите на хостинг (Vercel, Netlify, GitHub Pages)
3. Настройте домен в BotFather:

```
/setdomain
@coinmaster_game_bot
your-domain.com
```

#### Настройка кнопки меню:
```
/setmenubutton
@coinmaster_game_bot
🎮 Открыть игру
https://your-domain.com/mini-app
```

### 9. 💳 Настройка платежей

1. **Обратитесь к [@BotFather](https://t.me/BotFather)**
2. **Отправьте команду**: `/newinvoice`
3. **Следуйте инструкциям** для настройки платежей
4. **Получите провайдера платежей**

### 10. 🌐 Деплой на продакшен

#### Heroku (рекомендуется):
```bash
# Установка Heroku CLI
# Создание приложения
heroku create coinmaster-bot

# Добавление PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Добавление Redis
heroku addons:create heroku-redis:hobby-dev

# Настройка переменных
heroku config:set BOT_TOKEN=ваш_токен
heroku config:set NODE_ENV=production

# Деплой
git push heroku main

# Запуск миграций
heroku run npm run migrate
```

#### VPS:
```bash
# Установка зависимостей
sudo apt update
sudo apt install nodejs npm postgresql redis-server

# Клонирование проекта
git clone https://github.com/YOUR_USERNAME/coinmaster-bot.git
cd coinmaster-bot

# Установка зависимостей
npm install

# Настройка .env
cp env.example .env
# Заполните переменные

# Запуск миграций
npm run migrate

# Запуск с PM2
npm install -g pm2
pm2 start src/index.js --name "coinmaster-bot"
pm2 startup
pm2 save
```

### 11. 🔍 Тестирование

1. **Найдите бота** по username в Telegram
2. **Отправьте** `/start`
3. **Проверьте все функции**:
   - Профиль пользователя
   - Викторины
   - Казино игры
   - Кликер
   - Турниры
   - Магазин
4. **Протестируйте платежи** (если настроены)

### 12. 📊 Мониторинг

#### Логи:
```bash
# Heroku
heroku logs --tail

# PM2
pm2 logs coinmaster-bot

# Docker
docker logs coinmaster-bot
```

#### Статистика:
- Количество пользователей
- Активность игр
- Доходы от платежей
- Ошибки и баги

## 🎉 Готово!

Ваш CoinMaster Bot готов к использованию! 

### 📞 Поддержка:
- 📖 **Документация**: README.md
- 🤖 **Настройка бота**: TELEGRAM_SETUP.md
- 📱 **Mini App**: MINI_APP_SETUP.md
- 🚀 **Деплой**: DEPLOYMENT.md

### 🔗 Полезные ссылки:
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)
- [BotFather](https://t.me/BotFather)
- [Telegram Stars](https://telegram.org/blog/premium-stars)

**Удачи с вашим игровым ботом! 🎮✨**
