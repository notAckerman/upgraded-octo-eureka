# 🔮 NeonLLM — API Reselling & LLM Proxy Service

> Fullstack-проект: фронтенд + бэкенд в одном Node.js приложении.
> AI-powered реселлинг API для Anthropic моделей (Claude Opus, Sonnet, Fable).
> Пользователь пополняет баланс → использует LLM через красивый UI.

---

## 🎯 Бизнес-модель

- **Закупка**: токены по ~4₽ за 1M input/output токенов (оптовая цена Anthropic API)
- **Продажа**: пользователь покупает баланс в рублях, тратит токены по установленным ставкам
- **Маржа**: наценка 300–500% (определяется админом в настройках)
- **Модели**: Claude Opus 4.8, Claude Sonnet 4.6, Claude Fable 5 (soon)

### Примерный прайс-лист (наценка ×4)
| Модель | Input / 1M токенов | Output / 1M токенов |
|--------|-------------------|---------------------|
| Fable 5 | 16 ₽ | 48 ₽ |
| Opus 4.8 | 12 ₽ | 36 ₽ |
| Sonnet 4.6 | 4 ₽ | 12 ₽ |

> Тарифы настраиваются через админку. Токены считаются по реальному использованию.

---

## 🏗 Архитектура

```
┌──────────────────────────────────────────────────┐
│                   Frontend (Vite + React)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ User UI  │  │ Auth     │  │ Chat / API   │   │
│  │ Landing  │  │ Pages    │  │ Playground   │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
└──────────────────────┬───────────────────────────┘
                       │ REST API
┌──────────────────────┴───────────────────────────┐
│              Backend (Express.js)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Auth     │  │ Billing  │  │ Proxy        │   │
│  │ (JWT)    │  │ Payments │  │ (Anthropic)  │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Admin    │  │ Support  │  │ Telegram     │   │
│  │ Panel    │  │ Tickets  │  │ Bot / Notif  │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
└──────────────────────┬───────────────────────────┘
                       │
              ┌────────┴────────┐
              │   SQLite (dev)  │
              │   PostgreSQL    │
              └─────────────────┘
```

### Стек технологий
- **Runtime**: Node.js 20+
- **Backend**: Express.js 5
- **Database**: better-sqlite3 (dev) / PostgreSQL (prod)
- **Frontend**: React 19 + Vite + TailwindCSS 4 + Framer Motion
- **UI библиотека**: Shadcn/ui + Lucide icons
- **3D/Анимации**: Three.js / React Three Fiber (для лендинга), Framer Motion (для UI)
- **Charts**: Recharts (админка)
- **Auth**: JWT (access + refresh токены)
- **Payments**: lolz.live API + крипто (BTC/USDT через NOWPayments) + СБП (ТБанк / Сбер)
- **Telegram**: node-telegram-bot-api
- **Anthropic API**: @anthropic-ai/sdk
- **Мониторинг**: Winston (логи), собственная аналитика

---

## 📁 Структура проекта

```
api-provider/
├── CLAUDE.md                    # Этот файл — промт/спецификация
├── package.json
├── vite.config.js               # Vite для React фронтенда
├── tailwind.config.js
├── postcss.config.js
├── server/
│   ├── index.js                 # Express entry point
│   ├── config.js                # ENV конфиг, тарифы, настройки
│   ├── db/
│   │   ├── schema.sql           # SQL схема
│   │   ├── init.js              # Инициализация БД + seed
│   │   └── connection.js        # better-sqlite3 / pg pool
│   ├── middleware/
│   │   ├── auth.js              # JWT验证 middleware
│   │   ├── admin.js             # Admin-only middleware
│   │   ├── rateLimit.js         # Rate limiting
│   │   └── errorHandler.js      # Global error handler
│   ├── routes/
│   │   ├── auth.js              # /api/auth/*
│   │   ├── billing.js           # /api/billing/* (пополнение, баланс)
│   │   ├── proxy.js             # /api/v1/* (LLM прокси, совместимый с Anthropic SDK)
│   │   ├── admin.js             # /api/admin/* (управление, аналитика)
│   │   ├── support.js           # /api/support/* (тикеты)
│   │   └── user.js              # /api/user/* (профиль, ключи)
│   ├── services/
│   │   ├── anthropic.js         # Прокси к Anthropic API + подсчёт токенов
│   │   ├── billing.js           # Логика баланса, списаний
│   │   ├── lolz.js              # lolz.live API интеграция
│   │   ├── crypto.js            # NOWPayments / крипто интеграция
│   │   ├── sbp.js               # СБП (ТБанк/Сбер API)
│   │   └── telegram.js          # Telegram уведомления
│   └── utils/
│       ├── tokens.js            # Подсчёт и оценка стоимости токенов
│       ├── helpers.js           # Общие утилиты
│       └── validators.js        # Валидация входных данных
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx              # Router + layouts
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # JWT auth state
│   │   │   └── ThemeContext.jsx  # Dark/Light переключатель
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useBalance.js
│   │   │   └── useTheme.js
│   │   ├── components/
│   │   │   ├── common/           # Button, Card, Modal, Input, etc.
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── landing/
│   │   │   │   ├── Hero3D.jsx         # Three.js 3D сцена
│   │   │   │   ├── PricingCards.jsx
│   │   │   │   ├── ModelShowcase.jsx
│   │   │   │   ├── Features.jsx
│   │   │   │   └── Testimonials.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatWindow.jsx     # Основной чат-интерфейс
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   ├── ModelSelector.jsx
│   │   │   │   └── TokenCounter.jsx
│   │   │   ├── billing/
│   │   │   │   ├── BalanceCard.jsx
│   │   │   │   ├── PaymentModal.jsx
│   │   │   │   └── TransactionHistory.jsx
│   │   │   ├── admin/
│   │   │   │   ├── StatsOverview.jsx  # KPI карточки
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── TokenUsageChart.jsx
│   │   │   │   ├── ActiveUsersChart.jsx
│   │   │   │   ├── UserTable.jsx
│   │   │   │   └── TicketList.jsx
│   │   │   └── common3d/
│   │   │       ├── FloatingCube.jsx   # Декоративные 3D элементы
│   │   │       └── GlowOrb.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx          # Главная панель пользователя
│   │   │   ├── ChatPlayground.jsx     # Чат с LLM
│   │   │   ├── APIKeys.jsx            # Управление API ключами
│   │   │   ├── Billing.jsx            # Пополнение + история
│   │   │   ├── Profile.jsx
│   │   │   ├── Support.jsx            # Создание тикетов
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminUsers.jsx
│   │   │   │   ├── AdminPayments.jsx
│   │   │   │   ├── AdminSettings.jsx  # Тарифы, настройки
│   │   │   │   └── AdminTickets.jsx
│   │   │   └── NotFound.jsx
│   │   ├── lib/
│   │   │   ├── api.js                 # Axios/fetch instance
│   │   │   └── utils.js
│   │   └── styles/
│   │       └── globals.css            # Tailwind + кастомные стили
│   └── public/
│       ├── favicon.svg
│       └── og-image.png
├── .env.example
├── .gitignore
└── README.md
```

---

## 🗄 Схема базы данных

```sql
-- Пользователи
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    balance REAL DEFAULT 0.0,            -- Баланс в рублях
    is_admin INTEGER DEFAULT 0,
    is_banned INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- API ключи (совместимые с Anthropic форматом)
CREATE TABLE api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,       -- sk-ant-... хранится в хеше
    key_prefix TEXT NOT NULL,            -- Первые 8 символов для отображения
    name TEXT DEFAULT 'Default Key',
    is_active INTEGER DEFAULT 1,
    total_requests INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Финансовые транзакции
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,                  -- 'deposit', 'usage', 'refund', 'bonus'
    amount REAL NOT NULL,                -- Сумма в рублях
    balance_after REAL NOT NULL,         -- Баланс после операции
    description TEXT,
    payment_method TEXT,                 -- 'lolz', 'crypto_btc', 'crypto_usdt', 'sbp'
    payment_id TEXT,                     -- ID в платёжной системе
    status TEXT DEFAULT 'pending',       -- 'pending', 'completed', 'failed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Логи использования токенов
CREATE TABLE token_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    api_key_id INTEGER,
    model TEXT NOT NULL,                 -- 'claude-fable-5', 'claude-opus-4-8', etc.
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cache_creation_tokens INTEGER DEFAULT 0,
    cache_read_tokens INTEGER DEFAULT 0,
    cost REAL NOT NULL,                  -- Стоимость в рублях
    request_duration_ms INTEGER,
    endpoint TEXT,                       -- '/v1/messages', '/v1/complete'
    status TEXT DEFAULT 'success',       -- 'success', 'error', 'rate_limited'
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL
);

-- Тикеты поддержки
CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open',          -- 'open', 'in_progress', 'resolved', 'closed'
    priority TEXT DEFAULT 'medium',      -- 'low', 'medium', 'high', 'urgent'
    category TEXT DEFAULT 'general',     -- 'general', 'billing', 'technical', 'feature_request'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Сообщения тикетов
CREATE TABLE ticket_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,          -- user_id или 0 = system
    is_admin INTEGER DEFAULT 0,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Настройки системы (key-value)
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Сессии (refresh токены)
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    refresh_token_hash TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Seed-данные (settings)
```sql
INSERT INTO settings (key, value) VALUES
-- Тарифы (цена за 1M токенов в рублях)
('price_fable_input', '16'),
('price_fable_output', '48'),
('price_opus_input', '12'),
('price_opus_output', '36'),
('price_sonnet_input', '4'),
('price_sonnet_output', '12'),
-- Лимиты
('min_deposit', '100'),
('max_deposit', '100000'),
('free_tier_tokens', '0'),
-- Системные
('site_name', 'NeonLLM'),
('maintenance_mode', 'false'),
('registration_enabled', 'true'),
-- Telegram
('tg_bot_token', ''),
('tg_admin_chat_id', ''),
-- Платежи
('lolz_shop_id', ''),
('lolz_secret', ''),
('nowpayments_api_key', ''),
('sbp_merchant_id', ''),
('sbp_secret', '');
```

---

## 🎨 Дизайн-система

### Цветовая палитра

**Светлая тема:**
```css
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;
    --bg-card: #ffffff;
    --bg-card-hover: #f8fafc;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    --border: #e2e8f0;
    --border-hover: #cbd5e1;
    --accent: #6366f1;          /* Indigo — основной акцент */
    --accent-hover: #4f46e5;
    --accent-glow: rgba(99, 102, 241, 0.15);
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --gradient-card: linear-gradient(145deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05));
}
```

**Тёмная тема:**
```css
[data-theme="dark"] {
    --bg-primary: #0a0a0f;
    --bg-secondary: #111118;
    --bg-tertiary: #1a1a24;
    --bg-card: #14141e;
    --bg-card-hover: #1c1c2a;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #475569;
    --border: #1e1e2e;
    --border-hover: #2d2d40;
    --accent: #818cf8;
    --accent-hover: #6366f1;
    --accent-glow: rgba(129, 140, 248, 0.2);
    --success: #34d399;
    --warning: #fbbf24;
    --danger: #f87171;
    --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-2: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
    --gradient-card: linear-gradient(145deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));
    --glow-sm: 0 0 20px rgba(99, 102, 241, 0.15);
    --glow-lg: 0 0 40px rgba(99, 102, 241, 0.2), 0 0 80px rgba(139, 92, 246, 0.1);
}
```

### Типографика
- **Шрифт основной**: Inter (Google Fonts) — чистый, современный
- **Шрифт кода**: JetBrains Mono
- **Заголовки**: Inter Bold + letter-spacing: -0.02em
- **Размеры**: text-xs(12), text-sm(14), text-base(16), text-lg(18), text-xl(20), text-2xl(24), text-3xl(30), text-4xl(36), text-5xl(48)

### 3D элементы (лёндинг)
- **Hero**: Three.js сцена — плавающие геометрические формы (icosahedron, torus) с градиентным свечением
- **Декор**: Мелкие 3D-элементы (кубы, сферы) на фоне секций
- **Фон**: Mesh gradient / noise texture
- **Анимации**: плавное вращение, float-эффект, parallax при скролле

### Ключевые UI-паттерны
- **Карточки**: backdrop-blur, subtle border, hover glow эффект
- **Кнопки**: gradient bg + subtle shadow + hover scale(1.02)
- **Инпуты**: ring focus с accent color, иконка слева
- **Навбар**: sticky, glassmorphism (blur + semi-transparent bg)
- **Сайдбар (admin)**: dark bg, иконки + текст, active state glow

---

## 📄 Страницы и Маршруты

### Публичные
| Маршрут | Страница | Описание |
|---------|----------|----------|
| `/` | Landing | Лендинг с Hero 3D, тарифами, фичами |
| `/login` | Login | Вход (email + password) |
| `/register` | Register | Регистрация |

### User (требует auth)
| Маршрут | Страница | Описание |
|---------|----------|----------|
| `/dashboard` | Dashboard | Обзор: баланс, статистика, быстрые действия |
| `/chat` | Chat Playground | Чат-интерфейс с выбором модели |
| `/keys` | API Keys | Управление API ключами |
| `/billing` | Billing | Пополнение + история транзакций |
| `/profile` | Profile | Профиль, настройки аккаунта |
| `/support` | Support | Создание и просмотр тикетов |

### Admin (требует auth + is_admin)
| Маршрут | Страница | Описание |
|---------|----------|----------|
| `/admin` | Dashboard | KPI: доход, пользователи, токены, конверсия |
| `/admin/users` | Users | Таблица пользователей, бан/разбан |
| `/admin/payments` | Payments | Все транзакции, фильтры |
| `/admin/tickets` | Tickets | Тикеты поддержки |
| `/admin/settings` | Settings | Тарифы, настройки системы, Telegram |

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register        — Регистрация
POST   /api/auth/login           — Вход (возвращает JWT)
POST   /api/auth/refresh         — Обновление access токена
POST   /api/auth/logout          — Выход
GET    /api/auth/me              — Текущий пользователь
```

### Billing
```
GET    /api/billing/balance      — Текущий баланс
POST   /api/billing/deposit      — Создать платёж (returns payment URL)
POST   /api/billing/callback/lolz  — Webhook от lolz.live
POST   /api/billing/callback/crypto — Webhook от NOWPayments
POST   /api/billing/callback/sbp — Webhook от СБП
GET    /api/billing/transactions — История транзакций (пагинация)
GET    /api/billing/invoice/:id  — Счёт (PDF/HTML)
```

### API Proxy (совместимый с Anthropic API format)
```
POST   /api/v1/messages          — Основной endpoint (совместим с Anthropic SDK)
POST   /api/v1/complete          — Legacy completion
GET    /api/v1/models            — Доступные модели + цены
GET    /api/v1/usage             — Статистика использования
```

> Прокси прозрачно пропускает запросы в Anthropic API, подсчитывает токены,
> списывает стоимость с баланса пользователя. Формат совместим с официальным SDK.

### User
```
GET    /api/user/profile         — Профиль
PUT    /api/user/profile         — Обновить профиль
GET    /api/user/keys            — Список API ключей
POST   /api/user/keys            — Создать ключ
DELETE /api/user/keys/:id        — Удалить ключ
GET    /api/user/stats           — Личная статистика
```

### Support
```
POST   /api/support/tickets      — Создать тикет
GET    /api/support/tickets      — Мои тикеты
GET    /api/support/tickets/:id  — Детали тикета
POST   /api/support/tickets/:id/messages — Ответ в тикет
```

### Admin
```
GET    /api/admin/stats          — KPI дашборда
GET    /api/admin/stats/revenue  — График доходов (по дням/неделям/месяцам)
GET    /api/admin/stats/tokens   — График расхода токенов
GET    /api/admin/stats/users    — График активных пользователей
GET    /api/admin/users          — Все пользователи (пагинация, поиск)
PUT    /api/admin/users/:id      — Обновить пользователя (ban, balance, etc.)
GET    /api/admin/payments       — Все транзакции (фильтры, пагинация)
GET    /api/admin/tickets        — Все тикеты
PUT    /api/admin/tickets/:id    — Обновить статус/ответить
GET    /api/admin/settings       — Все настройки
PUT    /api/admin/settings       — Обновить настройки (тарифы, лимиты)
GET    /api/admin/export/:type   — Экспорт данных (CSV/JSON)
```

---

## 💳 Интеграция с платёжными системами

### 1. lolz.live
```
Flow:
1. Пользователь нажимает "Пополнить" → выбирает сумму
2. POST /api/billing/deposit { method: "lolz", amount: 500 }
3. Backend создаёт запись в transactions (status: pending)
4. Редирект на lolz.live/shop/... с параметрами заказа
5. Пользователь оплачивает
6. lolz.live шлёт webhook → /api/billing/callback/lolz
7. Backend проверяет подпись, обновляет баланс, статус → completed
8. Telegram уведомление админу
```

### 2. Криптовалюта (NOWPayments)
```
Flow:
1. POST /api/billing/deposit { method: "crypto_usdt", amount: 1000 }
2. Backend создаёт invoice в NOWPayments API
3. Возвращаем ссылку на оплату
4. NOWPayments шлёт callback → /api/billing/callback/crypto
5. Конвертация: 1 USDT ≈ текущий курс → рубли
6. Обновление баланса
```

### 3. СБП (Система Быстрых Платежей)
```
Flow:
1. POST /api/billing/deposit { method: "sbp", amount: 300 }
2. Генерация QR-кода / deeplink для оплаты через СБП
3. Ожидание callback от банка-эквайрера
4. Обновление баланса
```

---

## 🤖 Telegram интеграция

### Уведомления админу
- **Новое пополнение**: `💰 Новое пополнение: @username пополнил баланс на 500₽ (lolz)`
- **Новый тикет**: `🎫 Новый тикет #123 от @username: "Проблема с API ключом"`
- **Дневная сводка**: `📊 Дневная сводка: 15 пополнений, 2340₽ дохода, 12 активных пользователей`
- **Критические события**: Бан пользователя, ошибка оплаты, низкий баланс API

### Bot команды (для админа)
- `/stats` — Быстрая статистика за сегодня
- `/stats week` — За неделю
- `/users` — Количество активных пользователей
- `/revenue` — Доход за сегодня/неделю
- `/tickets` — Открытые тикеты

---

## 📊 Админка — Ключевые метрики

### KPI карточки (верх дашборда)
- **Общий доход** (₽) + % изменение к прошлому периоду
- **Доход за сегодня** (₽)
- **Активные пользователи** (за 24ч / 7д / 30д)
- **Средний чек пополнения** (₽)
- **Расход токенов** (M tokens за день)
- **Чистая прибыль** (доход - стоимость закупки токенов)

### Графики
- **Revenue**: линейный график дохода по дням/неделям/месяцам
- **Token Usage**: столбчатый график input/output по моделям
- **Active Users**: линейный график DAU/WAU/MAU
- **Model Distribution**:_donut chart по моделям
- **Payment Methods**:饼图 по способам оплаты

---

## 🔐 Безопасность

- Пароли: bcrypt (12 rounds)
- JWT: access (15min) + refresh (7d)
- Rate limiting: 100 req/min (API), 10 req/min (auth)
- API ключи: хранятся только в хеше, показывается только при создании
- Webhook верификация: HMAC SHA-256 для lolz, NOWPayments
- CORS: только домен фронтенда
- Helmet.js для HTTP security headers
- Валидация всех входных данных (zod)
- SQL injection: параметризованные запросы (better-sqlite3)

---

## 🚀 Запуск и развитие

### Dev
```bash
npm install
npm run dev          # Vite dev server + Express ( concurrently )
```

### Production
```bash
npm run build        # Vite build → dist/
npm start            # Express раздаёт dist/ + API
```

### Roadmap
1. ✅ MVP: auth, billing (lolz), chat playground, basic admin
2. 🔲 Крипто оплата (NOWPayments)
3. 🔲 СБП оплата
4. 🔲 API ключи + документация для интеграции
5. 🔲 Реферальная система
6. 🔲 Tарифные планы (подписки)
7. 🔲 Мульти-модельный чат (параллельные ответы)
8. 🔲 Streaming (SSE) для чата
9. 🔲 Rate limiting per-user
10. 🔲 Мониторинг и алерты

---

## 📐 Ключевые решения

1. **Всё в одном процессе**: Express раздаёт и API, и собранный React (production)
2. **SQLite для начала**: быстрый старт, миграция на PostgreSQL когда нужно
3. **Anthropic SDK формат**: пользователи могут использовать официальный @anthropic-ai/sdk, просто указывая наш base URL
4. **Токены как валюта**: все списания в рублях, токены конвертируются по тарифам
5. **Webhook-first**: все платёжные системы работают через callbacks, не polling
