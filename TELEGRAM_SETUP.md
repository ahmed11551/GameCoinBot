# 🤖 Настройка Telegram бота

## 1. Создание бота через BotFather

### Шаги:
1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Введите название бота (например: "CoinMaster Game Bot")
4. Введите username бота (например: "coinmaster_game_bot")
5. Получите токен бота (сохраните его!)

### Команды BotFather:
```
/newbot - создать нового бота
/setname - изменить название
/setdescription - установить описание
/setabouttext - установить текст "О боте"
/setuserpic - установить аватар
/setcommands - установить команды
/setmenubutton - установить кнопку меню
/setdomain - установить домен для Mini App
```

## 2. Настройка команд бота

Отправьте BotFather команду `/setcommands` и добавьте:

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

## 3. Настройка описания

### Описание бота:
```
🎮 CoinMaster - игровой бот с внутренней валютой!

🎯 Викторины с призами
🎰 Мини-казино игры
👆 Кликер игра с улучшениями
🏆 Турнирная система
💎 Премиум подписка
🛒 Магазин с Telegram Stars

Зарабатывайте монеты, участвуйте в турнирах и становитесь чемпионом!
```

### Текст "О боте":
```
🎮 CoinMaster Game Bot

Полнофункциональный игровой бот с внутренней виртуальной валютой.

🎯 Викторины - проверьте свои знания
🎰 Казино - азартные игры на монеты
👆 Кликер - зарабатывайте кликами
🏆 Турниры - соревнуйтесь с другими
💎 Премиум - эксклюзивные функции

Начните играть прямо сейчас! 🚀
```

## 4. Настройка аватара

Загрузите изображение для бота (512x512 пикселей) через команду `/setuserpic`.

## 5. Настройка кнопки меню

```
/setmenubutton
@coinmaster_game_bot
🎮 Играть
https://your-domain.com/mini-app
```

## 6. Настройка домена для Mini App

```
/setdomain
@coinmaster_game_bot
your-domain.com
```

## 7. Получение токена

После создания бота вы получите токен вида:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

Сохраните этот токен в файле .env:
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

## 8. Тестирование бота

1. Найдите вашего бота по username
2. Отправьте команду `/start`
3. Проверьте все функции
4. Убедитесь, что все работает корректно

## 9. Настройка вебхука (для продакшена)

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/webhook"}`
```

## 10. Мониторинг

Используйте команду `/getme` для получения информации о боте:
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getme"
```
