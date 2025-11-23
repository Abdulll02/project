# Product Analytics

Приложение для парсинга товаров с Wildberries, анализа цен, рейтингов и отзывов. Состоит из Django бэкенда и React фронтенда с интерактивной таблицей и графиками.

##  Как это работает

1. **Введите товар** — используя форму на фронтенде
2. **Парсер запускается** — Selenium загружает страницу Wildberries
3. **Данные сохраняются** — результаты парсинга попадают в базу данных
4. **Таблица обновляется** — данные отображаются в интерфейсе с фильтрацией и сортировкой
5. **Графики анализируют** — визуализируется распределение цен и другие метрики

##  Требования

- **Python 3.8+**
- **Node.js 14+** (для фронтенда)
- **Chrome/Chromium** (для Selenium)
- **pip** и **npm**

##  Установка и запуск

### Backend (Django)

1. Перейдите в папку проекта:
```bash
cd product_analytics1
```

2. Создайте виртуальное окружение:
```bash
python -m venv venv
```

3. Активируйте виртуальное окружение:

**Windows (cmd):**
```cmd
venv\Scripts\activate
```

**Windows (PowerShell):**
```powershell
venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

4. Установите зависимости:
```bash
pip install -r requirements.txt
```

5. Примените миграции базы данных:
```bash
python manage.py migrate
```

6. Запустите сервер Django:
```bash
python manage.py runserver
```

Сервер будет доступен по адресу: `http://127.0.0.1:8000`

### Frontend (React)

1. Перейдите в папку React приложения:
```bash
cd product_frontend/my-react
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите dev-сервер:
```bash
npm start
```

Приложение откроется в браузере по адресу: `http://localhost:3000`

## 📁 Структура проекта

```
project/
├── product_analytics1/          # Django backend
│   ├── products/                # Django app для парсинга
│   │   ├── models.py            # Модель Product
│   │   ├── parser.py            # Логика парсинга Selenium + BeautifulSoup
│   │   ├── views.py             # API endpoints
│   │   ├── urls.py              # URL маршруты
│   │   └── management/commands/
│   │       └── parse_products.py # Management command для парсинга
│   ├── product_analytics/       # Основные настройки Django
│   ├── manage.py                # Django CLI
│   ├── db.sqlite3               # База данных (по умолчанию)
│   └── requirements.txt         # Зависимости Python
│
├── product_frontend/
│   └── my-react/                # React приложение
│       ├── src/
│       │   ├── App.js           # Главный компонент
│       │   ├── App.css          # Стили
│       │   ├── ProductTable.js  # Компонент таблицы товаров
│       │   ├── Chart.js         # Компонент графиков
│       │   └── index.js         # Entry point
│       ├── package.json         # Зависимости npm
│       └── public/              # Статические файлы
│
└── README.md                    # Этот файл
```

##  Использование

### Запуск парсинга через UI

1. Откройте приложение в браузере (`http://localhost:3000`)
2. Введите название товара в поле "Введите товар для парсинга"
3. Нажмите кнопку "Запустить"
4. Дождитесь завершения парсинга
5. Результаты появятся в таблице ниже

### Запуск парсинга через команду Django

```bash
cd product_analytics1
python manage.py parse_products "кроссовки"
```

### Фильтрация и сортировка

- **Фильтры**: цена (от/до), минимальный рейтинг, минимальное количество отзывов
- **Сортировка**: кликните на заголовок колонки для сортировки
- **Вид**: переключайтесь между таблицей и карточками


## 🛠 API Endpoints

### GET `/api/products/`
Получить список товаров с фильтрацией.

**Параметры:**
- `min_price` (int) — минимальная цена
- `max_price` (int) — максимальная цена
- `min_rating` (float) — минимальный рейтинг
- `min_reviews` (int) — минимальное количество отзывов

**Пример:**
```
GET http://127.0.0.1:8000/api/products/?min_price=100&max_price=10000&min_rating=4.0
```

### POST `/api/parse/`
Запустить парсинг товаров.

**Body (JSON):**
```json
{
  "query": "кроссовки"
}
```

### POST `/api/clear_products/`
Очистить таблицу товаров.

##  Известные проблемы и TODOs

- [ ] Парсер может требовать дополнительной настройки селекторов при изменении структуры Wildberries
- [ ] Добавить кэширование результатов
- [ ] Добавить экспорт данных в CSV/Excel
- [ ] Улучшить обработку ошибок парсинга
- [ ] Добавить аутентификацию для админ-панели

## 📦 Зависимости

### Backend
- Django 4.x
- djangorestframework
- Selenium
- BeautifulSoup4
- requests

### Frontend
- React 18.x
- Axios
- Recharts (для графиков)

Полный список см. в `requirements.txt` и `package.json`.

## 🔐 Безопасность

- Приложение использует SQLite (для разработки)
- Для production рекомендуется использовать PostgreSQL
- Установите переменные окружения для чувствительных данных

##  Лицензия

Проект является учебным материалом и распространяется свободно.

##  Автор

Abdulll02

---

**Последнее обновление:** ноябрь 2025
