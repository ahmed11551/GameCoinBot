#!/bin/bash

# Скрипт для быстрой настройки Git репозитория и загрузки на GitHub
# Использование: ./setup-git.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
    echo "❌ Ошибка: Укажите ваш GitHub username"
    echo "Использование: ./setup-git.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="telegram-game-bot"

echo "🚀 Настройка Git репозитория для $REPO_NAME"
echo "👤 GitHub username: $GITHUB_USERNAME"
echo ""

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Запустите скрипт из корневой директории проекта"
    exit 1
fi

# Инициализация Git
echo "📁 Инициализация Git репозитория..."
git init

# Добавление файлов
echo "📝 Добавление файлов в Git..."
git add .

# Первый коммит
echo "💾 Создание первого коммита..."
git commit -m "feat: initial commit - игровой Telegram бот с внутренней валютой

- 🎯 Система викторин с 4 категориями
- 🎰 Мини-казино игры (слоты, кости, рулетка, блэкджек)
- 👆 Кликер игра с улучшениями
- 🏆 Турнирная система
- 💎 Премиум подписка
- 🛒 Магазин с Telegram Stars
- 🏅 Система достижений
- 📊 Подробная статистика
- 🔐 Безопасность и валидация
- 🐳 Docker поддержка
- 🚀 CI/CD pipeline"

# Переименование ветки в main
echo "🌿 Переименование ветки в main..."
git branch -M main

# Добавление remote origin
echo "🔗 Добавление remote origin..."
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo ""
echo "✅ Git репозиторий настроен!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Создайте репозиторий на GitHub:"
echo "   https://github.com/new"
echo "   Название: $REPO_NAME"
echo "   Описание: Игровой Telegram бот с внутренней валютой"
echo "   НЕ инициализируйте с README (у нас уже есть файлы)"
echo ""
echo "2. Загрузите код на GitHub:"
echo "   git push -u origin main"
echo ""
echo "3. Создайте релиз:"
echo "   git tag -a v1.0.0 -m 'Release version 1.0.0'"
echo "   git push origin v1.0.0"
echo ""
echo "🎉 Готово! Ваш проект будет доступен по адресу:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

# Создание тега
echo "🏷️  Создание тега v1.0.0..."
git tag -a v1.0.0 -m "Release version 1.0.0"

echo ""
echo "🚀 Для загрузки на GitHub выполните:"
echo "   git push -u origin main"
echo "   git push origin v1.0.0"
echo ""
echo "📚 Подробные инструкции см. в файле GITHUB_SETUP.md"
