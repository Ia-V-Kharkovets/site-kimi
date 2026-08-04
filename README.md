# Cгенерированна моделью kimi 2.6 Agent адаптивный одностраничный сайт-визитка

## Стек технологий

- **Frontend**: HTML5, CSS3 (Glassmorphism + Neon), Vanilla JS (ES6+)
- **Backend**: Node.js, Express
- **Data**: JSON-файл (`public/assets/data.json`)
- **Storage**: LocalStorage (сохранение аватара)

## Возможности

- 🔮 Интерактивный прелоадер с анимацией загрузки
- 📸 Динамическая смена аватара (загрузка фото) с сохранением в LocalStorage
- 💡 Неоновая подсветка и эффекты свечения
- 📊 Счетчики технологий с анимацией
- ✨ Плавная анимация при скролле (Intersection Observer)
- 🎭 Glassmorphism-карточки
- 📱 Полностью адаптивный дизайн
- 🔧 Имитация REST API на Express

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск сервера
npm start
# или
node server.js
```

Сервер будет доступен по адресу: `http://localhost:7100`

## API Endpoints

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/profile` | Полные данные профиля |
| GET | `/api/technologies` | Список технологий |
| GET | `/api/projects` | Список проектов |
| POST | `/api/contact` | Отправка сообщения |
| GET | `/api/health` | Health check |

## Структура проекта

```
test_project/
├── server.js              # Express сервер
├── package.json
├── README.md
└── public/
    ├── index.html         # Главная страница
    ├── css/
    │   └── styles.css     # Стили (Glassmorphism + Neon)
    ├── js/
    │   └── app.js         # Логика приложения
    └── assets/
        └── data.json      # Данные профиля
```

## Технологии, отраженные в дизайне

- **PostgreSQL** — реляционные базы данных
- **MongoDB** — документо-ориентированные БД
- **Node.js / Express** — бэкенд и REST API
- **Redis** — кэширование
- **Docker** — контейнеризация
- **GraphQL** — альтернативный API
