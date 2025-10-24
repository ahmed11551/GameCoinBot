# 📱 Настройка Telegram Mini App

## 1. Что такое Mini App?

Mini App - это веб-приложение, которое запускается внутри Telegram и предоставляет расширенный интерфейс для вашего бота.

### Преимущества Mini App:
- 🎨 Красивый веб-интерфейс
- 📱 Нативная интеграция с Telegram
- 💳 Платежи через Telegram Stars
- 🔐 Авторизация через Telegram
- 📊 Расширенная аналитика

## 2. Создание Mini App

### Шаг 1: Создайте веб-приложение
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CoinMaster Game</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--tg-theme-bg-color, #ffffff);
            color: var(--tg-theme-text-color, #000000);
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .game-card {
            background: var(--tg-theme-secondary-bg-color, #f0f0f0);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .game-card:hover {
            transform: translateY(-2px);
        }
        .game-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }
        .balance {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
        }
        .balance-amount {
            font-size: 2em;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 CoinMaster</h1>
            <p>Игровой центр</p>
        </div>
        
        <div class="balance">
            <div class="balance-amount" id="coins">1000</div>
            <div>🪙 Монеты</div>
        </div>
        
        <div class="game-card" onclick="openGame('quiz')">
            <div class="game-icon">🎯</div>
            <h3>Викторины</h3>
            <p>Проверьте свои знания и заработайте монеты</p>
        </div>
        
        <div class="game-card" onclick="openGame('casino')">
            <div class="game-icon">🎰</div>
            <h3>Казино</h3>
            <p>Азартные игры на монеты</p>
        </div>
        
        <div class="game-card" onclick="openGame('clicker')">
            <div class="game-icon">👆</div>
            <h3>Кликер</h3>
            <p>Зарабатывайте кликами</p>
        </div>
        
        <div class="game-card" onclick="openGame('tournaments')">
            <div class="game-icon">🏆</div>
            <h3>Турниры</h3>
            <p>Соревнуйтесь с другими игроками</p>
        </div>
    </div>

    <script>
        // Инициализация Telegram Web App
        const tg = window.Telegram.WebApp;
        
        // Настройка темы
        tg.ready();
        tg.expand();
        
        // Получение данных пользователя
        const user = tg.initDataUnsafe.user;
        console.log('User:', user);
        
        // Обновление баланса
        function updateBalance(coins) {
            document.getElementById('coins').textContent = coins;
        }
        
        // Открытие игр
        function openGame(gameType) {
            // Отправка данных в бот
            tg.sendData(JSON.stringify({
                action: 'open_game',
                game: gameType
            }));
        }
        
        // Обработка платежей
        function buyCoins(amount) {
            tg.showPopup({
                title: 'Покупка монет',
                message: `Купить ${amount} монет за ${amount} Telegram Stars?`,
                buttons: [
                    {id: 'buy', type: 'default', text: 'Купить'},
                    {id: 'cancel', type: 'cancel', text: 'Отмена'}
                ]
            }, (buttonId) => {
                if (buttonId === 'buy') {
                    // Инициирование платежа
                    tg.showInvoice({
                        title: 'Покупка монет',
                        description: `${amount} монет`,
                        payload: JSON.stringify({
                            type: 'coins',
                            amount: amount
                        }),
                        provider_token: 'YOUR_PROVIDER_TOKEN',
                        currency: 'XTR', // Telegram Stars
                        prices: [{
                            label: 'Монеты',
                            amount: amount
                        }]
                    });
                }
            });
        }
        
        // Обработка успешного платежа
        tg.onEvent('invoiceClosed', (event) => {
            if (event.status === 'paid') {
                const payload = JSON.parse(event.payload);
                if (payload.type === 'coins') {
                    updateBalance(parseInt(document.getElementById('coins').textContent) + payload.amount);
                    tg.showAlert('Монеты успешно добавлены!');
                }
            }
        });
        
        // Кнопка закрытия
        tg.MainButton.setText('Закрыть');
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
            tg.close();
        });
    </script>
</body>
</html>
```

### Шаг 2: Настройка домена

1. Загрузите файлы на ваш сервер
2. Убедитесь, что сайт доступен по HTTPS
3. Настройте домен в BotFather:

```
/setdomain
@your_bot_username
your-domain.com
```

### Шаг 3: Настройка кнопки меню

```
/setmenubutton
@your_bot_username
🎮 Открыть игру
https://your-domain.com/mini-app
```

## 3. Интеграция с ботом

### Обновление обработчика start.js:

```javascript
// Добавьте в src/handlers/start.js
const startHandler = async (ctx) => {
  const user = ctx.user;
  
  // Проверяем, запущен ли бот из Mini App
  if (ctx.webAppData) {
    const data = JSON.parse(ctx.webAppData.data);
    if (data.action === 'open_game') {
      return await openGameFromMiniApp(ctx, data.game);
    }
  }
  
  // Обычное меню бота
  const welcomeText = `🎮 <b>Добро пожаловать в CoinMaster!</b>
  
  👋 Привет, ${user.first_name || 'Игрок'}!
  
  💰 <b>Ваш баланс:</b>
  🪙 Монеты: ${user.coins}
  💎 Драгоценные камни: ${user.gems}
  ⭐ Уровень: ${user.level}`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🎮 Открыть игру', web_app: { url: 'https://your-domain.com/mini-app' } }
      ],
      [
        { text: '👤 Профиль', callback_data: 'profile' },
        { text: '💰 Баланс', callback_data: 'balance' }
      ],
      [
        { text: '🎯 Викторины', callback_data: 'quiz_menu' },
        { text: '🎰 Казино', callback_data: 'casino_menu' }
      ]
    ]
  };

  await ctx.reply(welcomeText, { 
    parse_mode: 'HTML', 
    reply_markup: keyboard 
  });
};
```

## 4. Настройка платежей

### Получение провайдера платежей:

1. Обратитесь в [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newinvoice`
3. Следуйте инструкциям для настройки платежей

### Обработка платежей в боте:

```javascript
// Добавьте в src/handlers/payments.js
const handlePayment = async (ctx) => {
  const payment = ctx.preCheckoutQuery;
  
  try {
    // Проверка платежа
    const payload = JSON.parse(payment.invoice_payload);
    
    if (payload.type === 'coins') {
      // Обновление баланса пользователя
      await DatabaseService.updateUser(ctx.user.id, {
        coins: ctx.user.coins + payload.amount
      });
      
      // Подтверждение платежа
      await ctx.answerPreCheckoutQuery(true);
      
      // Уведомление пользователя
      await ctx.reply(`✅ Успешно куплено ${payload.amount} монет!`);
    }
  } catch (error) {
    console.error('Payment error:', error);
    await ctx.answerPreCheckoutQuery(false, 'Ошибка обработки платежа');
  }
};
```

## 5. Деплой Mini App

### Варианты хостинга:

1. **Vercel** (рекомендуется):
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**:
   - Загрузите файлы через веб-интерфейс
   - Настройте кастомный домен

3. **GitHub Pages**:
   - Загрузите в репозиторий
   - Включите GitHub Pages

4. **Собственный сервер**:
   - Настройте Nginx/Apache
   - Получите SSL сертификат

## 6. Тестирование Mini App

1. Откройте бота в Telegram
2. Нажмите кнопку "🎮 Открыть игру"
3. Проверьте все функции
4. Протестируйте платежи
5. Убедитесь в корректной работе

## 7. Мониторинг и аналитика

### Добавьте аналитику:

```javascript
// В Mini App
function trackEvent(eventName, data) {
  tg.sendData(JSON.stringify({
    action: 'track',
    event: eventName,
    data: data
  }));
}

// Отслеживание событий
trackEvent('mini_app_opened');
trackEvent('game_started', { game: 'quiz' });
trackEvent('payment_initiated', { amount: 100 });
```

## 8. Оптимизация

- Сжатие изображений
- Минификация CSS/JS
- Кэширование статических файлов
- CDN для быстрой загрузки
- PWA функциональность

---

**Готово!** Теперь у вас есть полнофункциональный бот с Mini App! 🚀
