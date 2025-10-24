# 🚀 Деплой CoinMaster Bot через Vercel

## ✅ Проект готов к деплою!

Ваш CoinMaster Bot готов для деплоя на Vercel. Вот несколько способов:

## 📋 Способ 1: Через веб-интерфейс Vercel (Рекомендуется)

### Шаг 1: Подготовка GitHub
1. Убедитесь, что проект загружен на GitHub: [https://github.com/ahmed11551/GameCoinBot.git](https://github.com/ahmed11551/GameCoinBot.git)

### Шаг 2: Создание аккаунта Vercel
1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите **"Sign Up"**
3. Войдите через GitHub аккаунт

### Шаг 3: Импорт проекта
1. Нажмите **"New Project"**
2. Выберите **"Import Git Repository"**
3. Найдите и выберите **"GameCoinBot"**
4. Нажмите **"Import"**

### Шаг 4: Настройка проекта
- **Framework Preset**: Other
- **Root Directory**: ./
- **Build Command**: (оставьте пустым)
- **Output Directory**: (оставьте пустым)

### Шаг 5: Переменные окружения
Добавьте следующие переменные:

```
BOT_TOKEN=8479237154:AAGPnOMzFdHcOi6A5Y-gPxQnq2q7BHJULq8
NODE_ENV=production
```

### Шаг 6: Деплой
1. Нажмите **"Deploy"**
2. Дождитесь завершения деплоя
3. Получите URL вашего приложения

## 📋 Способ 2: Через командную строку

### Шаг 1: Логин
```bash
npx vercel login
```

### Шаг 2: Деплой
```bash
npx vercel
```

Ответьте на вопросы:
- **Set up and deploy?** → Y
- **Which scope?** → выберите ваш аккаунт
- **Link to existing project?** → N
- **What's your project's name?** → coinmaster-bot
- **In which directory is your code located?** → ./

### Шаг 3: Переменные окружения
```bash
npx vercel env add BOT_TOKEN
# Введите: 8479237154:AAGPnOMzFdHcOi6A5Y-gPxQnq2q7BHJULq8

npx vercel env add NODE_ENV
# Введите: production
```

### Шаг 4: Продакшен деплой
```bash
npx vercel --prod
```

## 🔧 Настройка вебхука

После деплоя получите URL вашего приложения (например: `https://coinmaster-bot.vercel.app`)

### Настройка вебхука:
```bash
curl -X POST "https://api.telegram.org/bot8479237154:AAGPnOMzFdHcOi6A5Y-gPxQnq2q7BHJULq8/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://YOUR_VERCEL_URL.vercel.app/webhook"}'
```

Замените `YOUR_VERCEL_URL` на ваш URL.

## 🧪 Тестирование

1. Найдите бота: [@new_coinmaster_game_bot](https://t.me/new_coinmaster_game_bot)
2. Отправьте команду `/start`
3. Проверьте все функции:
   - Профиль пользователя
   - Баланс и бонусы
   - Кликер игра
   - Меню игр

## 📊 Мониторинг

### Vercel Dashboard:
- Перейдите в панель Vercel
- Выберите ваш проект
- Отслеживайте логи и производительность

### Логи:
```bash
npx vercel logs
```

## 🎯 Особенности деплоя

### ✅ Что работает:
- 🤖 Telegram бот полностью функционален
- 💰 Система валюты (монеты, драгоценные камни)
- 👆 Кликер игра с подсчетом кликов
- 🎁 Ежедневные бонусы
- 📊 Статистика пользователей
- 🔄 Автоматическое масштабирование

### 🚧 Ограничения (для полной версии нужна БД):
- Данные хранятся в памяти (сбрасываются при перезапуске)
- Нет постоянного хранения статистики
- Нет системы достижений

## 🔄 Обновления

Для обновления бота:
1. Внесите изменения в код
2. Загрузите на GitHub
3. Vercel автоматически передеплоит проект

## 🎉 Готово!

После выполнения всех шагов ваш CoinMaster Bot будет доступен 24/7 на Vercel!

**Ссылки:**
- 🤖 **Бот**: [@new_coinmaster_game_bot](https://t.me/new_coinmaster_game_bot)
- 📁 **Репозиторий**: [GitHub](https://github.com/ahmed11551/GameCoinBot.git)
- 🚀 **Vercel**: [vercel.com](https://vercel.com)

**Удачи с деплоем! 🚀✨**
