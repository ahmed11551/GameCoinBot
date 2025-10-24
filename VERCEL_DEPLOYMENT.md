# Vercel деплой для CoinMaster Bot

## 🚀 Быстрый деплой через Vercel

### 1. Установка Vercel CLI

```bash
npm install -g vercel
```

### 2. Логин в Vercel

```bash
vercel login
```

### 3. Инициализация проекта

```bash
vercel
```

### 4. Настройка переменных окружения

В панели Vercel добавьте переменные:

```
BOT_TOKEN=8479237154:AAGPnOMzFdHcOi6A5Y-gPxQnq2q7BHJULq8
NODE_ENV=production
DATABASE_URL=your_postgresql_url
REDIS_URL=your_redis_url
JWT_SECRET=coinmaster_jwt_secret_key_2024
ENCRYPTION_KEY=coinmaster_encryption_key_2024
```

### 5. Деплой

```bash
vercel --prod
```

## 📱 Настройка вебхука

После деплоя получите URL вашего приложения и настройте вебхук:

```bash
curl -X POST "https://api.telegram.org/bot8479237154:AAGPnOMzFdHcOi6A5Y-gPxQnq2q7BHJULq8/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.vercel.app/webhook"}'
```

## 🗄️ База данных для Vercel

### Вариант 1: Supabase (рекомендуется)
1. Создайте аккаунт на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Получите DATABASE_URL
4. Добавьте в переменные Vercel

### Вариант 2: PlanetScale
1. Создайте аккаунт на [planetscale.com](https://planetscale.com)
2. Создайте базу данных
3. Получите подключение
4. Добавьте в переменные Vercel

### Вариант 3: Neon
1. Создайте аккаунт на [neon.tech](https://neon.tech)
2. Создайте базу данных
3. Получите DATABASE_URL
4. Добавьте в переменные Vercel

## 🔄 Redis для Vercel

### Upstash Redis (рекомендуется)
1. Создайте аккаунт на [upstash.com](https://upstash.com)
2. Создайте Redis базу данных
3. Получите REDIS_URL
4. Добавьте в переменные Vercel

## 📋 Пошаговая инструкция

### Шаг 1: Подготовка
```bash
# Установка Vercel CLI
npm install -g vercel

# Логин
vercel login
```

### Шаг 2: Деплой
```bash
# Инициализация
vercel

# Деплой в продакшен
vercel --prod
```

### Шаг 3: Настройка переменных
1. Перейдите в панель Vercel
2. Выберите ваш проект
3. Перейдите в Settings → Environment Variables
4. Добавьте все необходимые переменные

### Шаг 4: Настройка вебхука
```bash
# Замените YOUR_VERCEL_URL на ваш URL
curl -X POST "https://api.telegram.org/bot8479237154:AAGPnOMzFdHcOi6A5Y-gPxQnq2q7BHJULq8/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://YOUR_VERCEL_URL.vercel.app/webhook"}'
```

### Шаг 5: Тестирование
1. Найдите бота: @new_coinmaster_game_bot
2. Отправьте /start
3. Проверьте все функции

## 🔧 Настройка для продакшена

### Обновите src/index.js для вебхука:

```javascript
// В src/index.js добавьте обработку вебхука
if (process.env.NODE_ENV === 'production') {
  // Настройка вебхука для продакшена
  app.use('/webhook', (req, res) => {
    bot.handleUpdate(req.body);
    res.status(200).send('OK');
  });
  
  app.listen(process.env.PORT || 3000);
} else {
  // Обычный запуск для разработки
  bot.launch();
}
```

## 📊 Мониторинг

### Vercel Analytics
1. Включите Analytics в панели Vercel
2. Отслеживайте производительность
3. Мониторьте ошибки

### Логи
```bash
# Просмотр логов
vercel logs

# Логи в реальном времени
vercel logs --follow
```

## 🎯 Готово!

После выполнения всех шагов ваш CoinMaster Bot будет доступен 24/7 на Vercel!

**Преимущества Vercel:**
- ✅ Автоматический деплой из GitHub
- ✅ CDN по всему миру
- ✅ Автоматическое масштабирование
- ✅ SSL сертификаты
- ✅ Простой мониторинг

**Ссылки:**
- 🤖 **Бот**: [@new_coinmaster_game_bot](https://t.me/new_coinmaster_game_bot)
- 📁 **Репозиторий**: [GitHub](https://github.com/ahmed11551/GameCoinBot.git)
- 🚀 **Vercel**: [vercel.com](https://vercel.com)

**Удачи с деплоем! 🚀✨**
