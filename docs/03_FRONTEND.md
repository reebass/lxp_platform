# ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ: FRONTEND (v1.0)

## 1. СТЕК ТЕХНОЛОГИЙ И ИНФРАСТРУКТУРА
- **Core:** Next.js 16.1.7 (App Router), React 19.
- **Styling:** Tailwind CSS v4, Radix UI (headless components), Lucide React (иконки).
- **Дизайн-система:** Cyberpunk / Dark Mode default. Кастомизация UI тенантов реализуется через подмену CSS-переменных в формате HSL (через утилиту `hexToHsl`).
- **Интеграция БД:** `@supabase/ssr` (разделение на `client.ts` и `server.ts`).

## 2. АРХИТЕКТУРА РОУТИНГА (Multi-tenancy)
Структура папок построена вокруг динамического сегмента `app/[domain]/`.
- **`middleware.ts`:** Сердце приложения.
  1. Перехватывает запрос.
  2. Извлекает сабдомен (например, `edu.novus.localhost`).
  3. Делает `NextResponse.rewrite` на `/[domain]/path`.
  4. **Критически важно:** Пробрасывает куки из Supabase SSR в новый ответ, чтобы сохранить сессию при кросс-доменных переходах.

## 3. КЛЮЧЕВЫЕ КОМПОНЕНТЫ
### 3.1. SpotlightChat (AI Ассистент)
- **Функционал:** Плавающий виджет чата с AI.
- **Smart Rendering:** Динамически скрывается на маршрутах логина/регистрации и корневых админских страницах (`isHiddenRoute`), но доступен в `data-hub` и `course-builder`.
- **Интеграция:** Общается с Python-бэкендом (`/ask`), передавая контекст пользователя.

### 3.2. CourseBuilderCanvas (Конструктор курсов)
- **Библиотека:** `@xyflow/react` (React Flow v12).
- **Логика:** Визуальный drag-and-drop редактор структуры курса.
- **Состояние:** Поддерживает базовые ноды (`start` - зеленая, `finish` - красная) с кастомной стилизацией. Использует паттерн поднятия состояния (`onSave` пробрасывает узлы и связи наверх в родительский компонент).

### 3.3. Data Hub (Файловый менеджер)
- Страница `/admin/data-hub` содержит сложный UI для управления документами (RAG). Включает `DocumentTable`, модалки загрузки (`UploadModal`) и создание папок (`CreateFolderModal`).

### 3.4. AI Bridge (Мост до AI сервісу)
- **`lib/ai/ai-client.ts`**: HTTP утиліта для запитів на FastAPI (server-only, ніколи не імпортується на клієнті).
- **`app/actions/ai.actions.ts`**: Server Action `generateNodeContentAction(промпт, дія, контекст?)`. Перевіряє права через `checkCoursePermissions`, проксує запит через ai-client.
- **Інтеграція**: Кнопки "Summarize", "Format Steps", "Suggest Title" в `TextNodeSettings.tsx` використовують `useTransition` + sonner тоасти.