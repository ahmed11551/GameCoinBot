@echo off
REM Скрипт для быстрой настройки Git репозитория и загрузки на GitHub
REM Использование: setup-git.bat YOUR_GITHUB_USERNAME

if "%1"=="" (
    echo ❌ Ошибка: Укажите ваш GitHub username
    echo Использование: setup-git.bat YOUR_GITHUB_USERNAME
    pause
    exit /b 1
)

set GITHUB_USERNAME=%1
set REPO_NAME=coinmaster-bot

echo 🚀 Настройка Git репозитория для %REPO_NAME%
echo 👤 GitHub username: %GITHUB_USERNAME%
echo.

REM Проверяем, что мы в правильной директории
if not exist "package.json" (
    echo ❌ Ошибка: package.json не найден. Запустите скрипт из корневой директории проекта
    pause
    exit /b 1
)

REM Инициализация Git
echo 📁 Инициализация Git репозитория...
git init

REM Добавление файлов
echo 📝 Добавление файлов в Git...
git add .

REM Первый коммит
echo 💾 Создание первого коммита...
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

REM Переименование ветки в main
echo 🌿 Переименование ветки в main...
git branch -M main

REM Добавление remote origin
echo 🔗 Добавление remote origin...
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo.
echo ✅ Git репозиторий настроен!
echo.
echo 📋 Следующие шаги:
echo 1. Создайте репозиторий на GitHub:
echo    https://github.com/new
echo    Название: %REPO_NAME%
echo    Описание: Игровой Telegram бот с внутренней валютой
echo    НЕ инициализируйте с README (у нас уже есть файлы)
echo.
echo 2. Загрузите код на GitHub:
echo    git push -u origin main
echo.
echo 3. Создайте релиз:
echo    git tag -a v1.0.0 -m "Release version 1.0.0"
echo    git push origin v1.0.0
echo.
echo 🎉 Готово! Ваш проект будет доступен по адресу:
echo    https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.

REM Создание тега
echo 🏷️  Создание тега v1.0.0...
git tag -a v1.0.0 -m "Release version 1.0.0"

echo.
echo 🚀 Для загрузки на GitHub выполните:
echo    git push -u origin main
echo    git push origin v1.0.0
echo.
echo 📚 Подробные инструкции см. в файле GITHUB_SETUP.md
pause
