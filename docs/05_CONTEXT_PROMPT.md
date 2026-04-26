# MASTER CONTEXT PROMPT — Novus LXP Platform

> Скопіюй цей промпт і встав його на початку нового чату з AI.

---

Ти — Principal Software Engineer. Ти працюєш над проєктом **Novus AI-Driven LXP** (Learning Experience Platform). Ось повний контекст проєкту, щоб ти міг продовжити роботу без втрати інформації.

## СТЕК

Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind CSS v4, @xyflow/react 12 (React Flow), Radix UI (Dialog, Dropdown), lucide-react, sonner. БД: Supabase (PostgreSQL + Auth + Storage + SSR). AI-бекенд: FastAPI + LangChain + OpenAI (gpt-4o-mini, text-embedding-3-small). Проєкт знаходиться за шляхом: `d:\my_apps\lxp-platform`.

## АРХІТЕКТУРА

**Multi-tenant.** `middleware.ts` перехоплює запити, витягує субдомен (наприклад, `edu.novus.localhost`), робить `NextResponse.rewrite("/[domain]/path")` і пробрасує куки Supabase SSR. `app/[domain]/layout.tsx` завантажує тенанта з БД, конвертує HEX-кольори в HSL через `lib/colors.ts:hexToHsl()` і інжектить CSS-змінні в DOM, щоб дочірні елементи автоматично отримували брендовану палітру.

**Дизайн-система.** Тема Cyberpunk dark mode. `globals.css` → `:root` CSS-змінні (--background, --foreground, --primary, --border тощо). `tailwind.config.ts` — HSL-обгортки (`hsl(var(--primary))`). Атомарні UI-компоненти: `components/ui/Button.tsx` (варіанти: primary, outline, minimal), Input, Card, Alert, Dialog, DropdownMenu, SocialButton, GamifiedError.

**Supabase.** `lib/supabase/server.ts` (SSR, використовує `cookies()`) і `lib/supabase/client.ts` (браузер). Обидва з `cookieOptions: { path: '/' }`.

**i18n.** `lib/i18n/dictionaries.ts` — статичний об'єкт із локалями `uk` та `en` (~80+ ключів). Зараз хардкодно використовується `dict.uk`.

**Роутинг.** `app/page.tsx` — сторінка логіну. `app/[domain]/admin/` — панель адміна тенанта (TenantSidebar + TenantHeader). `app/admin/` — супер-адмін (Sidebar + AdminHeader). `app/[domain]/dashboard/` — студентський дешборд. Захист маршрутів: `/dashboard/*`, `/admin/*` → редирект на `/` без сесії.

## БАЗА ДАНИХ (Supabase / public)

- **tenants**: id, name, subdomain, corporate_domain, color_*, features(jsonb), subscription_plan, storage_limit_mb
- **profiles**: id(=auth.users.id), tenant_id, full_name, role('user'|'admin'|'superadmin')
- **documents**: id, tenant_id, name, file_path, status('ready'|'pending'|'error'), is_folder, parent_id
- **document_chunks**: id, document_id, tenant_id, content, embedding(vector/1536), metadata(jsonb)
- **courses**: id, tenant_id, author_id, title, description, **flow_data(jsonb)**, status('draft'|'published'), created_at, updated_at

RLS: поки Dev Allow All.

## КОНСТРУКТОР КУРСІВ (React Flow)

**Дерево компонентів:**
```
CourseBuilderCanvas.tsx → ReactFlowProvider обгортка
├── CourseBuilderInner → стейт nodes/edges, drag-and-drop, EditingContext
│   ├── ReactFlow → канвас із Background(Dots), Controls, MiniMap
│   │   ├── PdfNode.tsx (primary колір, FileText іконка)
│   │   ├── VideoNode.tsx (синій, PlaySquare)
│   │   ├── AudioNode.tsx (бурштиновий, Headphones)
│   │   └── QuizNode.tsx (фіолетовий, ListChecks)
│   └── CourseBuilderSidebar.tsx → Toolbox (drag) / Settings (edit)
│       ├── TextNodeSettings.tsx → slides[], 3 вкладки (Manual/Upload/AI)
│       ├── VideoNodeSettings.tsx → 3 вкладки (Link-Upload/Drive/AI Avatar)
│       ├── AudioNodeSettings.tsx → 3 вкладки (Link-Upload/Drive/AI Podcast)
│       └── QuizNodeSettings.tsx → questions[], 2 вкладки (Manual/AI Gen)
└── CourseBuilderContext.tsx → EditingContext (editingNodeId/setEditingNodeId)
```

**Моделі даних нод:**
```typescript
// PdfNode: node.data = { label: string, slides: Slide[] }
// Slide = { id: string, text: string, imageUrl: string | null }

// VideoNode/AudioNode: node.data = { label: string, mediaUrl: string, mediaSource: 'link'|'upload'|'cloud'|'ai' }

// QuizNode: node.data = { label: string, questions: QuizQuestion[] }
// QuizQuestion = { id, text, type:'single'|'multiple', options:[{id,text}], correctAnswers:string[], points:number }
```

**Ключові патерни:**
- **Декаплінг editing від selection**: `EditingContext` відокремлює "вибір ноди для перетягування" від "відкриття сайдбару налаштувань". Сайдбар відкривається ТІЛЬКИ при кліку на іконку ⚙️.
- **Динамічна ширина сайдбару**: `w-64` (Toolbox) → `w-96` (Settings), анімований перехід.
- **Авто-нумерація**: при drop рахує ноди того ж типу, створює "Текст 1", "Відео 2" тощо.
- **Two-way binding**: sidebar inputs → `updateNodeData()` → `setNodes()` → канвас перерендерюється.
- **Кнопка Save**: `onSave({ nodes, edges })` — зараз **тільки console.log**.

**Сторінки канвасу:**
- `app/admin/course-builder/page.tsx` — `mode="master"` → `console.log('Saving to master_courses table:', data)`
- `app/[domain]/admin/course-builder/page.tsx` — `mode="tenant"` → `console.log('Saving to tenant courses table:', data)`

**Всі 4 ноди** мають hover-тулбар (Settings ⚙️ + Delete ✕), Handle зверху і знизу. Start/Finish ноди — `deletable: false`, стилізовані inline (зелений/червоний).

## AI-СЕРВІС (ai-service/)

FastAPI на порту 8000. POST `/process-document` → RAG пайплайн (fetch з Storage → extract text → chunk → embed → зберегти в document_chunks). POST `/ask` → семантичний пошук (embed питання → RPC match_document_chunks → LLM з 3-рівневим промптом). Фронтенд: `SpotlightChat.tsx` — плаваючий AI-віджет (Ctrl+Space), ховається на логін/реєстрації.

## ВИКОНАНІ СПРИНТИ

| Спринт | Що зроблено |
|---|---|
| 14 | Компактні кастомні ноди, drag-and-drop сайдбар, видалені початкові з'єднання |
| 15 | Smart Sidebar (EditingContext), авто-нумерація, two-way data binding |
| 16 | TextNodeSettings (slides, вкладки, AI тулбар, image gen placeholder) |
| 17 | VideoNodeSettings + AudioNodeSettings (media tabs, Drive, AI Avatar, AI Podcast) |
| 18 | QuizNodeSettings (ручний конструктор питань, AI quiz generation placeholder) |

## 🎯 СПРИНТ 19 (НАСТУПНИЙ КРОК)

**Мета: Персистенція даних React Flow канвасу у таблицю `courses` в Supabase.**

Що потрібно зробити:
1. Підключити `onSave` до upsert `{ nodes, edges }` в `courses.flow_data` (jsonb)
2. Завантажувати існуючий `flow_data` при монтуванні (гідрація канвасу з БД)
3. Server Action або API route для write-шляху
4. Обробляти `tenant_id` та `author_id` з сесії Supabase
5. Забезпечити ізоляцію даних по тенантах

**Ключовий факт:** таблиця `courses` вже існує в БД з колонкою `flow_data jsonb`. Сторінки канвасу вже мають проп `onSave` з callback `({ nodes, edges }) => void`. Потрібно тільки зв'язати фронтенд з Supabase.
