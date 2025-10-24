# Деплой игрового Telegram бота

## 🚀 Варианты деплоя

### 1. Heroku (Рекомендуется для начинающих)

#### Подготовка
1. Создайте аккаунт на [Heroku](https://heroku.com)
2. Установите [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

#### Настройка
```bash
# Логин в Heroku
heroku login

# Создание приложения
heroku create your-bot-name

# Добавление PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Добавление Redis
heroku addons:create heroku-redis:hobby-dev

# Настройка переменных окружения
heroku config:set BOT_TOKEN=your_telegram_bot_token
heroku config:set NODE_ENV=production
```

#### Деплой
```bash
# Добавление Heroku remote
git remote add heroku https://git.heroku.com/your-bot-name.git

# Деплой
git push heroku main

# Запуск миграций
heroku run npm run migrate

# Просмотр логов
heroku logs --tail
```

### 2. DigitalOcean App Platform

#### Подготовка
1. Создайте аккаунт на [DigitalOcean](https://digitalocean.com)
2. Подключите GitHub репозиторий

#### Настройка
- **Source**: GitHub репозиторий
- **Branch**: main
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Environment Variables**:
  - `BOT_TOKEN`
  - `DATABASE_URL`
  - `REDIS_URL`
  - `NODE_ENV=production`

### 3. VPS (Ubuntu/Debian)

#### Подготовка сервера
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Установка Redis
sudo apt install redis-server -y

# Установка PM2 для управления процессами
sudo npm install -g pm2
```

#### Настройка базы данных
```bash
# Создание пользователя PostgreSQL
sudo -u postgres createuser --interactive
sudo -u postgres createdb game_bot

# Настройка Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### Деплой приложения
```bash
# Клонирование репозитория
git clone https://github.com/yourusername/telegram-game-bot.git
cd telegram-game-bot

# Установка зависимостей
npm install

# Настройка переменных окружения
cp env.example .env
# Заполните .env файл

# Запуск миграций
npm run migrate

# Запуск с PM2
pm2 start src/index.js --name "telegram-bot"
pm2 startup
pm2 save
```

### 4. Docker

#### Создание Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  bot:
    build: .
    environment:
      - BOT_TOKEN=${BOT_TOKEN}
      - DATABASE_URL=postgresql://postgres:password@db:5432/game_bot
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: game_bot
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Запуск
```bash
# Создание .env файла
cp env.example .env

# Запуск контейнеров
docker-compose up -d

# Выполнение миграций
docker-compose exec bot npm run migrate
```

## 🔧 Настройка после деплоя

### 1. Настройка вебхука (для продакшена)
```bash
# Получение URL вебхука
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/webhook"}'
```

### 2. Мониторинг
```bash
# Просмотр логов
pm2 logs telegram-bot

# Мониторинг ресурсов
pm2 monit

# Перезапуск приложения
pm2 restart telegram-bot
```

### 3. Резервное копирование
```bash
# Создание бэкапа базы данных
pg_dump game_bot > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
psql game_bot < backup_file.sql
```

## 🛡️ Безопасность

### 1. Настройка файрвола
```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

### 2. SSL сертификат
```bash
# Certbot для Let's Encrypt
sudo apt install certbot
sudo certbot --nginx -d your-domain.com
```

### 3. Обновления безопасности
```bash
# Автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Мониторинг и логирование

### 1. Настройка логов
```bash
# Ротация логов
sudo logrotate -f /etc/logrotate.conf
```

### 2. Мониторинг производительности
```bash
# Установка htop
sudo apt install htop

# Мониторинг диска
df -h
du -sh /var/log/*
```

## 🚨 Устранение неполадок

### Частые проблемы

1. **Бот не отвечает**
   - Проверьте логи: `pm2 logs telegram-bot`
   - Проверьте статус: `pm2 status`
   - Проверьте переменные окружения

2. **Ошибки базы данных**
   - Проверьте подключение к PostgreSQL
   - Выполните миграции: `npm run migrate`
   - Проверьте права доступа

3. **Проблемы с Redis**
   - Проверьте статус: `sudo systemctl status redis-server`
   - Перезапустите: `sudo systemctl restart redis-server`

4. **Высокое потребление памяти**
   - Перезапустите приложение: `pm2 restart telegram-bot`
   - Проверьте утечки памяти
   - Увеличьте лимиты памяти

## 📈 Масштабирование

### Горизонтальное масштабирование
- Использование нескольких инстансов бота
- Балансировка нагрузки
- Кластеризация Redis

### Вертикальное масштабирование
- Увеличение ресурсов сервера
- Оптимизация запросов к БД
- Кэширование часто используемых данных

---

**Важно**: Всегда тестируйте деплой на staging окружении перед продакшеном!
