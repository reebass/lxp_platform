# Architecture Audit — LXP Platform

## 1. Executive Summary

LXP Platform сейчас выглядит как ранняя SaaS/LXP-платформа на Next.js App Router с Supabase как основной базой данных, Supabase Storage для документов, React Flow для конструктора курсов и отдельным Python/FastAPI сервисом для AI/RAG.

В коде уже есть рабочие основы: авторизация через Supabase, глобальная админка, tenant-роутинг через `middleware.ts`, Data Hub с загрузкой файлов, конструктор курсов на `@xyflow/react`, white-label цвета через CSS-переменные и внешний AI-сервис. При этом часть важных границ безопасности и масштабирования пока держится на соглашениях в коде, а не на устойчивой архитектуре.

Самые важные риски:

- `middleware.ts` защищает только `/dashboard` и `/admin`, но не переписанные tenant-маршруты вида `/[domain]/admin/...`.
- `lib/supabase/admin.ts` использует `SUPABASE_SERVICE_KEY` и полностью обходит RLS (правила доступа на уровне строк); безопасность зависит от ручных проверок в вызывающих функциях.
- Data Hub server actions принимают `tenantId` с клиента/страницы и не проверяют роль пользователя и членство в tenant внутри каждой мутации.
- AI widget на клиенте вызывает `http://localhost:8000/ask` напрямую, минуя server action и переменную окружения.
- Student dashboard и student player пока выглядят как демонстрационные/тестовые страницы, а не как полноценный учебный опыт.

Проверки: `npm install` не запускался, потому что `node_modules` уже присутствует. Результаты `npm run lint` и `npm run build` добавлены в раздел 9 после фактического запуска.

## 2. Project Overview

Тип приложения: SaaS learning experience platform (платформа корпоративного обучения) с multi-tenant логикой (разделение клиентов по домену/поддомену), админкой, Data Hub, AI-помощником и визуальным конструктором курсов.

Основной frontend:

- `Next.js 16.1.7`
- `React 19.2.3`
- App Router (`app/`)
- TypeScript
- Tailwind CSS v4
- Radix UI для базовых диалогов/dropdown
- `lucide-react` для иконок
- `sonner` для toast-уведомлений
- `@xyflow/react` для Course Builder

Основная интеграция с данными:

- `@supabase/ssr` для browser/server Supabase clients
- `@supabase/supabase-js` для service-role клиента
- Supabase Auth
- Supabase Database
- Supabase Storage bucket `tenant_documents`

AI/backend:

- отдельная папка `ai-service/`
- FastAPI
- LangChain
- OpenAI embeddings и chat model
- Supabase Python client
- endpoints: `/health`, `/ask`, `/process-document`, `/api/generate/text`

Главные точки входа:

- `app/layout.tsx` — корневой layout Next.js.
- `app/page.tsx` — главная страница входа.
- `middleware.ts` — Supabase session refresh, защита части маршрутов и tenant rewrite.
- `app/admin/layout.tsx` — server-side проверка superadmin.
- `app/[domain]/layout.tsx` — загрузка tenant по домену и инъекция CSS-переменных.
- `components/course-builder/CourseBuilderCanvas.tsx` — основной React Flow canvas.
- `ai-service/app/main.py` — запуск FastAPI приложения.

## 3. Repository Structure

Текущая структура верхнего уровня:

- `app/` — Next.js App Router: страницы, layouts, server actions.
- `components/` — UI, auth, admin, dashboard, course builder, AI widget.
- `lib/` — Supabase clients, AI HTTP client, цветовые утилиты, словари.
- `ai-service/` — Python/FastAPI backend для AI и обработки документов.
- `docs/` — существующая техническая документация и этот аудит.
- `public/` — публичные статические файлы.
- `.next/` — сгенерированная Next.js сборка, не должна быть источником архитектурных решений.
- `node_modules/` — установленные npm зависимости.
- `.venv/` и `ai-service/venv/` — локальные Python окружения; в репозитории их лучше не хранить.

Структура маршрутов в `app/`:

- `/` → `app/page.tsx`, login page.
- `/register` → `app/register/page.tsx`.
- `/dashboard` → `app/dashboard/layout.tsx`, `app/dashboard/page.tsx`.
- `/admin` → `app/admin/layout.tsx`, `app/admin/page.tsx`.
- `/admin/tenants` → список клиентов.
- `/admin/tenants/[id]` → настройки tenant.
- `/admin/course-builder` → master course builder.
- `/[domain]` → tenant login page.
- `/[domain]/dashboard` → tenant dashboard test page.
- `/[domain]/admin` → tenant admin shell.
- `/[domain]/admin/data-hub` → Data Hub.
- `/[domain]/admin/course-builder` → tenant course builder.

## 4. What Already Works

Authentication pages/components:

- `components/auth/LoginForm.tsx` реализует email/password вход через Supabase Auth.
- `components/auth/RegisterForm.tsx` реализует sign up через Supabase Auth и OAuth providers `google`/`azure`.
- `app/page.tsx` показывает `LoginForm`.
- `app/register/page.tsx` показывает `RegisterForm`.
- `components/admin/LogoutButton.tsx` вызывает `supabase.auth.signOut()`.

Routing:

- App Router используется последовательно через `app/`.
- `middleware.ts` делает session refresh через `createServerClient`.
- `middleware.ts` защищает root-level `/dashboard` и `/admin`.
- `middleware.ts` переписывает tenant host на `/${currentHost}${pathname}`.
- `app/[domain]/layout.tsx` валидирует tenant по `subdomain` или `corporate_domain`.

Layouts:

- `app/layout.tsx` задает корневые стили и `Toaster`.
- `app/admin/layout.tsx` проверяет пользователя и роль `superadmin`.
- `app/dashboard/layout.tsx` содержит `DashboardHeader` и `SpotlightChat`.
- `app/[domain]/layout.tsx` загружает tenant, применяет white-label цвета и подключает `SpotlightChat`.
- `app/[domain]/admin/layout.tsx` задает tenant admin shell с `TenantSidebar` и `TenantHeader`.

Supabase integration:

- `lib/supabase/client.ts` создает browser client.
- `lib/supabase/server.ts` создает SSR client через `cookies()`.
- `lib/supabase/admin.ts` создает service-role client для server-side операций.
- В коде есть обращения к таблицам `profiles`, `tenants`, `documents`, `courses`, `document_chunks`.
- Storage используется через bucket `tenant_documents`.

Tenant/subdomain logic:

- `middleware.ts` определяет `host`, сравнивает с `NEXT_PUBLIC_ROOT_DOMAIN` или `localhost`, затем делает rewrite.
- `app/[domain]/layout.tsx`, `app/[domain]/page.tsx`, `app/[domain]/admin/data-hub/page.tsx` ищут tenant по `subdomain` или `corporate_domain`.
- White-label цвета tenant загружаются из колонок `color_*` и конвертируются через `hexToHsl`.

Data Hub:

- `app/[domain]/admin/data-hub/page.tsx` загружает tenant и передает `tenantId` в Data Hub.
- `DocumentTable` читает документы tenant из Supabase.
- `UploadZone` загружает файлы в Supabase Storage и создает записи в `documents`.
- `document-actions.ts` содержит server actions для создания папки, переименования, удаления и перемещения документов.
- Поддержана иерархия папок через `parent_id`.
- `DocumentList` подписывается на Supabase realtime channel по tenant.

Course Builder / React Flow:

- `components/course-builder/CourseBuilderCanvas.tsx` использует `@xyflow/react`.
- Есть node types: `pdf`, `video`, `audio`, `quiz`.
- Есть стартовая и финальная ноды `start` и `finish`.
- Новые ноды создаются drag-and-drop из `CourseBuilderSidebar`.
- `useCourseSync` сохраняет `nodes` и `edges` через server action `saveCourse`.
- `app/admin/course-builder/page.tsx` и `app/[domain]/admin/course-builder/page.tsx` умеют загрузить `flow_data` по `?id=...`.

AI assistant widget:

- `components/ai/SpotlightChat.tsx` реализует модальное окно чата, горячую клавишу `Ctrl/Cmd + Space`, отправку вопроса и отображение источников.
- Для tenant mode передается `tenantId`.
- В `ai-service` есть `/ask`, который делает embeddings, RPC `match_document_chunks`, собирает контекст и вызывает LangChain chain.

Backend/API integration points:

- `lib/ai/ai-client.ts` вызывает FastAPI endpoint `/api/generate/text`.
- `app/actions/ai.actions.ts` проксирует генерацию текста через server action.
- `components/ai/SpotlightChat.tsx` напрямую вызывает `/ask`.
- `ai-service/app/api/routes/document.py` обрабатывает `/process-document`.
- `ai-service/app/api/routes/generate.py` обрабатывает `/api/generate/text`.

Styling/theme system:

- `app/globals.css` задает базовую темную тему через CSS-переменные в raw HSL формате.
- `tailwind.config.ts` мапит `background`, `foreground`, `primary`, `border`, `content`, `muted` на CSS-переменные.
- `lib/colors.ts` конвертирует HEX в HSL.
- `BrandingForm` редактирует logo URL и цветовые поля tenant.

## 5. What Partially Works

Tenant route protection:

- Root `/admin` защищен в `app/admin/layout.tsx`.
- Root `/dashboard` защищен через `middleware.ts`.
- Tenant admin layout `app/[domain]/admin/layout.tsx` не делает server-side проверку пользователя, роли и membership в tenant. Needs verification, если это полностью закрыто RLS, но в коде layout такой проверки нет.

Role checks:

- `app/admin/layout.tsx` проверяет `profile.role === 'superadmin'`.
- `app/actions/course.ts` проверяет `admin`/`superadmin`.
- Data Hub server actions не проверяют роль и tenant membership внутри каждой мутации.
- Tenant admin страницы полагаются на то, что tenant уже найден и что Supabase/RLS ограничит данные. Needs verification.

Data Hub persistence:

- Файлы реально пишутся в Storage и `documents`.
- Не видно автоматического вызова `/process-document` после загрузки. Документ создается со `status: 'pending'`, но связка с AI processing service в UI не обнаружена.
- Удаление папки рассчитывает на `ON DELETE CASCADE` в БД. Это указано в комментарии, но схема/миграции в репозитории не найдены. Needs verification.

Course Builder persistence:

- `flow_data` сохраняется в `courses`.
- Нет отдельной схемы/валидации формата `flow_data`.
- Node data типизирован через `unknown`/общие `Record<string, unknown>`, поэтому структура нод может разъехаться между UI, AI и будущим player.
- `mode` передается в canvas, но право доступа определяется по профилю в server action, а не по фактическому маршруту.

AI generation:

- Server action для генерации текста есть.
- В `TextNodeSettings` есть AI actions для text slide, но `AudioNodeSettings`, `VideoNodeSettings`, `QuizNodeSettings` содержат `console.log` placeholders для AI/файловых действий.
- Spotlight AI использует прямой client-side fetch на localhost, а не общий server-side AI client.

Student experience:

- `/dashboard` показывает три одинаковых `CourseCard`.
- `CourseCard` содержит статический прогресс `45%`.
- `/[domain]/dashboard/page.tsx` является тестовой страницей проверки цветов.
- Immersive student player в коде не найден. Needs verification.

Theme/dark-light:

- Есть темная тема и tenant colors.
- Полноценное переключение light/dark не найдено.
- Не все цвета берутся из токенов: есть hardcoded hex и `bg-gray-200`, `text-white`, `text-blue-500`, `text-amber-500`, `text-violet-500`.

## 6. Mocked / Placeholder / Hardcoded Parts

Placeholder UI / test pages:

- `app/[domain]/dashboard/page.tsx` — тестовая страница проверки цветов, не реальный student dashboard.
- `components/dashboard/CourseCard.tsx` — статическая карточка курса, прогресс `45%`, нет запроса к `courses`/enrollments.
- `components/dashboard/DashboardHeader.tsx` содержит `tenant-logo-placeholder`.
- `app/admin/page.tsx` — welcome card без реальных метрик.

Mock/hardcoded data:

- `CourseCard` рендерится три раза в `app/dashboard/page.tsx`.
- `CourseCard` использует словарь для одного и того же курса и статический прогресс.
- `CourseBuilderCanvas` создает default nodes с hardcoded id `start` и `finish`.
- `CourseBuilderCanvas` генерирует node id через `crypto.randomUUID().slice(0, 8)`.

Hardcoded URLs/domains:

- `components/ai/SpotlightChat.tsx` вызывает `http://localhost:8000/ask`.
- `lib/ai/ai-client.ts` имеет fallback `http://localhost:8000`.
- `components/auth/LoginForm.tsx` собирает redirect host через `localhost:3000`.
- `middleware.ts` явно заменяет `localhost:3000` на `localhost`.

Hardcoded colors:

- `app/globals.css` задает cyberpunk palette: `#111111`, `#e5e7eb`, `#00f0ff`, `#333333`, `#ff003c`, `#39ff14`, `#151515`.
- `CourseBuilderCanvas` hardcodes start/finish colors: `#d1fae5`, `#10b981`, `#065f46`, `#fee2e2`, `#ef4444`, `#7f1d1d`.
- `CourseBuilderSidebar` hardcodes `text-blue-500`, `text-amber-500`, `text-violet-500`.
- `CourseCard` uses `bg-gray-200`, which may break dark/white-label consistency.

TODO comments:

- `components/ai/SpotlightChat.tsx` has `TODO: handle dynamic locale`.

Console logs used for temporary behavior:

- `AudioNodeSettings.tsx` logs selected file and AI podcast action.
- `VideoNodeSettings.tsx` logs selected file.
- `QuizNodeSettings.tsx` logs AI quiz action.
- `TextNodeSettings.tsx` logs AI image generation placeholder.
- Many server actions use `console.error`; this is acceptable as basic logging, but should become structured logging before production.

Fake/incomplete API calls:

- AI audio/video/quiz generation buttons currently log to console instead of calling backend.
- Document processing endpoint exists, but automatic frontend/server action trigger after upload was not found.

Temporary/generated files in repo:

- `.next/`, `.venv/`, `ai-service/venv/`, `__pycache__`, `*.pyc`, `tsconfig.tsbuildinfo` are present. They should be ignored/removed from version control if tracked. Needs verification whether they are tracked.

## 7. Areas That Should Be Rewritten Before Scaling

1. Tenant admin access control

- Current problem: `app/[domain]/admin/layout.tsx` renders tenant admin shell without fetching current user/profile and checking tenant membership.
- Why risky: an authenticated or unauthenticated request may reach tenant admin UI if middleware rewrite bypasses root `/admin` protection. Even if data is later blocked by RLS, UI and action surfaces remain exposed.
- Recommended direction: add a tenant admin guard that resolves tenant by domain, fetches user profile, validates `profile.tenant_id === tenant.id` and role in `admin/superadmin`, then passes verified tenant context down.

2. Middleware (промежуточный слой маршрутизации и проверки доступа)

- Current problem: `isProtectedRoute` checks only path prefixes before tenant rewrite: `/dashboard` and `/admin`.
- Why risky: host rewrite creates internal routes like `/[domain]/admin/...`, but original request path may be `/admin/...` only on subdomain or may be `/dashboard`. Protection and tenant resolution are mixed in one file.
- Recommended direction: separate concerns: session refresh, host normalization, tenant rewrite, protected path policy. Add explicit protection for tenant admin/student routes before and after rewrite.

3. Supabase service-role usage

- Current problem: `adminClient` bypasses RLS and is used for courses after manual checks.
- Why risky: one missed tenant filter leaks or mutates cross-tenant data.
- Recommended direction: keep service-role only in narrow repository functions that require a verified `AuthContext`/`TenantContext` object. Prefer SSR user client plus RLS where possible.

4. Data Hub server actions

- Current problem: `createFolder`, `renameDocument`, `deleteDocument`, `moveDocument` do not independently verify user role and tenant ownership.
- Why risky: server actions can be called outside normal UI flow; client-passed ids can target another tenant if RLS is relaxed or misconfigured.
- Recommended direction: each action should fetch current user, resolve document tenant, verify admin role and tenant match, then mutate. Do not trust `tenantId` from client.

5. RLS assumptions

- Current problem: docs say documents/chunks are in "Dev Allow All" during finalization, but actual migrations/policies are not in repo.
- Why risky: production behavior cannot be audited from code, and service-role may hide missing RLS.
- Recommended direction: add migrations or `supabase/` policy definitions to repo. Document policies for `tenants`, `profiles`, `documents`, `document_chunks`, `courses`.

6. React Flow node IDs and graph saving

- Current problem: IDs are partly fixed (`start`, `finish`) and partly random short UUID fragments. `flow_data` stores raw React Flow objects.
- Why risky: future AI-generated graph `flow_data` needs stable references, schema versioning, deterministic validation and migration. Short ids are likely fine locally but not a domain model.
- Recommended direction: define `CourseFlowSchema` with `schema_version`, stable node ids, allowed node types, required `data` shape, edge constraints and validation before save/load.

7. Theme system and white-label colors

- Current problem: there is a good CSS-variable foundation, but many components still use hardcoded colors.
- Why risky: white-label tenants and future light theme will have inconsistent contrast and broken UI.
- Recommended direction: introduce design tokens for semantic states (`success`, `danger`, `info`, node type colors, progress track). Replace raw colors in shared components.

8. Environment variables

- Current problem: `.env.example` is missing, frontend and backend variable names differ (`NEXT_PUBLIC_SUPABASE_URL` vs `SUPABASE_URL`), AI URL fallback is hardcoded.
- Why risky: local/prod setup becomes fragile and secrets can be misconfigured.
- Recommended direction: create `.env.example` for root and `ai-service/.env.example`. Fail fast with clear errors for required variables.

9. Error handling

- Current problem: many server actions return raw `error.message` from Supabase; FastAPI returns `str(e)` in HTTP 500; UI sometimes shows generic errors.
- Why risky: leaking internal messages, inconsistent UX, hard debugging.
- Recommended direction: normalize error codes, log full details server-side, return safe localized messages client-side.

10. Type safety

- Current problem: tenant objects and flow data often use `any` or `unknown`; no generated Supabase database types.
- Why risky: schema drift will break runtime behavior without compile-time signal.
- Recommended direction: generate Supabase types, type `Tenant`, `Profile`, `Document`, `Course`, and validate external payloads with a schema library.

11. Folder structure

- Current problem: domain features are split across `app/[domain]/...`, `components/...`, `app/actions/...`, and `lib/...` without clear feature modules.
- Why risky: as Data Hub, Course Builder, Player and AI grow, ownership boundaries will blur.
- Recommended direction: group by feature boundaries, for example `features/data-hub`, `features/course-builder`, `features/tenant`, while keeping Next route files thin.

## 8. Environment Variables

Detected variables:

| Name | Used in | Scope | Required | Example placeholder |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `middleware.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts` | frontend and backend/server | Yes | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `middleware.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts` | frontend and backend/server | Yes | `eyJ...anon...` |
| `SUPABASE_SERVICE_KEY` | `lib/supabase/admin.ts`, `ai-service/app/core/dependencies.py` | backend/server only | Yes for admin/course service-role operations and AI service | `eyJ...service-role...` |
| `AI_SERVICE_URL` | `lib/ai/ai-client.ts` | backend/server only in Next.js server actions | Yes for non-local environments | `http://localhost:8000` |
| `SUPABASE_URL` | `ai-service/app/core/dependencies.py` | AI backend | Yes for AI service | `https://your-project.supabase.co` |
| `OPENAI_API_KEY` | `ai-service/app/core/dependencies.py` | AI backend | Yes for AI service | `sk-proj-...` |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `middleware.ts` | frontend/server routing config | Required for production tenant routing | `example.com` |
| `NODE_ENV` | `middleware.ts` | runtime | Provided by Node/Next | `development` |
| `VERCEL` | `middleware.ts` | runtime/deploy | Provided by Vercel when deployed | `1` |

`.env.local` exists and contains root Supabase variables, but `.env.example` was not found. Recommendation: create `.env.example` without secrets for root Next.js app and `ai-service/.env.example` for FastAPI.

Do not expose `SUPABASE_SERVICE_KEY` to browser code. It must never be prefixed with `NEXT_PUBLIC_`.

## 9. Local Launch Instructions

Package manager: npm is detectable because `package-lock.json` exists.

Node.js version: explicit `engines.node` not found in `package.json`. Needs verification. Based on Next.js 16 and installed `@types/node@20`, use Node.js 20+ unless the team standard says otherwise.

Frontend setup:

```bash
npm install
```

Create `.env.local` in repository root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_ROOT_DOMAIN=localhost
```

Run frontend dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

AI service setup:

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `ai-service/.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
OPENAI_API_KEY=sk-proj-your-key
```

Run AI service:

```bash
uvicorn app.main:app --reload --port 8000
```

Missing/needs verification:

- Supabase database migrations are not present in repo.
- RLS policy setup is not reproducible from repo.
- Required local DNS/hosts setup for `tenant.localhost` and production subdomains needs documentation.
- AI service Python version is not specified.
- `.env.example` is missing.

Check results from this audit run:

- `npm install`: not run; `node_modules` already exists.
- `npm run lint`: failed before ESLint started because npm wrapper could not find `C:\Users\АНДРЕЙ\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js`. Node version reported: `v24.14.0`.
- Direct lint fallback `node .\node_modules\eslint\bin\eslint.js`: ran and failed with `36 problems (17 errors, 19 warnings)`.
- Main lint errors:
  - `app/actions/tenant.ts`: `Unexpected any`.
  - `components/admin/tenants/BrandingForm.tsx`: `Unexpected any`, `react-hooks/set-state-in-effect`.
  - `components/admin/tenants/GeneralInfoCard.tsx`: `Unexpected any`.
  - `components/admin/tenants/GeneralInfoForm.tsx`: `Unexpected any`, `react-hooks/set-state-in-effect`.
  - `components/admin/tenants/SubscriptionCard.tsx`: `Unexpected any`.
  - `components/admin/tenants/SubscriptionForm.tsx`: `Unexpected any`, `react-hooks/set-state-in-effect`.
  - `components/auth/LoginForm.tsx`: raw `<a>` navigation to `/register`.
  - `components/auth/RegisterForm.tsx`: raw `<a>` navigation to `/`.
  - `components/course-builder/settings/TextNodeSettings.tsx`: `react-hooks/set-state-in-effect`.
  - `lib/colors.ts`: `prefer-const`.
- `npm run build`: failed before Next build started with the same missing npm CLI error: `Cannot find module 'C:\Users\АНДРЕЙ\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js'`.
- Direct build fallback `node .\node_modules\next\dist\bin\next build`: compiled successfully, then failed during build with `Error: spawn EPERM`. It also printed:
  - `The "middleware" file convention is deprecated. Please use "proxy" instead.`
  - `MODULE_TYPELESS_PACKAGE_JSON` warning for `tailwind.config.ts`; suggested adding `"type": "module"` to `package.json`.

## 10. Frontend Architecture

App Router structure:

- Root auth: `/`, `/register`.
- Root student/admin: `/dashboard`, `/admin`.
- Tenant auth/dashboard/admin: `/[domain]`, `/[domain]/dashboard`, `/[domain]/admin/...`.
- Shared server actions under `app/actions`.

Pages/routes:

- Auth pages are mostly server components that import client forms.
- Admin root pages use server components for data fetching.
- Data Hub mixes server components (`DocumentTable`, page) with client components (`DataHubClient`, modals, realtime list, upload zone).
- Course Builder page loads initial data server-side and hands it to a client canvas.

Layouts:

- `app/layout.tsx` is minimal root shell.
- `app/admin/layout.tsx` is both shell and access guard for superadmin.
- `app/[domain]/layout.tsx` is tenant resolver and theme injector.
- `app/[domain]/admin/layout.tsx` is UI shell only; access guard is missing/Needs verification.

Main components:

- Auth: `LoginForm`, `RegisterForm`.
- Admin: `Sidebar`, `AdminHeader`, `MobileNav`, tenant management forms.
- Tenant admin: `TenantSidebar`, `TenantHeader`.
- Data Hub: `DataHubClient`, `DocumentTable`, `DocumentList`, `UploadZone`, `CreateFolderModal`, `FileRow`, `TableToolbar`, `Breadcrumbs`.
- Course Builder: `CourseBuilderCanvas`, `CourseBuilderSidebar`, node components and settings components.
- AI: `SpotlightChat`.
- UI: `Button`, `Card`, `Dialog`, `Input`, `Alert`, `DropdownMenu`.

Providers/context:

- `Toaster` in root layout.
- `ReactFlowProvider` inside `CourseBuilderCanvas`.
- `EditingContext` for selected/editing node state.
- No global auth provider found; auth state is queried via Supabase clients at route/action level.
- No explicit theme provider found; theme is CSS variables.

Styling approach:

- Tailwind utility classes.
- CSS variables in raw HSL format.
- Dynamic inline `style` for tenant CSS variables.
- Some hardcoded colors remain in components.

Client/server component boundaries:

- Server components handle initial Supabase reads in pages/layouts.
- Client components handle forms, React Flow, uploads, realtime subscriptions and AI chat UI.
- Server actions handle tenant updates, Data Hub mutations, course save/load and AI generation proxy.
- Boundary risk: some client components directly call Supabase and external AI URLs, so server-side authorization is inconsistent.

## 11. Supabase Architecture

Supabase client files:

- `lib/supabase/client.ts`: browser client using `NEXT_PUBLIC_SUPABASE_URL` and anon key.
- `lib/supabase/server.ts`: server client using Next cookies.
- `lib/supabase/admin.ts`: service-role client using `SUPABASE_SERVICE_KEY`, bypassing RLS.
- `middleware.ts`: separate Supabase SSR client for session refresh.

Auth usage:

- Login: `signInWithPassword`.
- Register: `signUp`.
- OAuth: `signInWithOAuth` for `google` and `azure`.
- Route/session check: `supabase.auth.getUser()`.
- Admin layout checks `profiles.role`.
- Course actions check `profiles.role` and `tenant_id`.

Database calls:

- `tenants`: tenant lookup, creation, branding, subscription settings.
- `profiles`: role and tenant lookup.
- `documents`: file/folder metadata and status.
- `courses`: React Flow `flow_data`.
- `document_chunks`: used by AI service for RAG.
- RPC `match_document_chunks`: used by AI service.

Storage usage:

- Bucket `tenant_documents`.
- Upload path format: `${tenantId}/${Date.now()}_${safeName}`.
- Delete removes paths from Storage before/around DB deletion.

SSR usage:

- Server components use `createClient()` from `lib/supabase/server.ts`.
- Server actions also use SSR client for authenticated user context.
- Middleware refreshes cookies through `@supabase/ssr`.

Detected RLS expectations/risks:

- Existing docs mention documents/chunks may still be "Dev Allow All". Needs verification.
- `adminClient` bypasses RLS in course actions.
- AI service uses `SUPABASE_SERVICE_KEY`, so it bypasses RLS as well.
- Data Hub uses normal SSR/browser clients, so its safety depends heavily on RLS and per-action checks.
- Repository does not include Supabase migrations/policies; actual RLS cannot be verified from code.

## 12. Course Builder / React Flow Architecture

Canvas location:

- `components/course-builder/CourseBuilderCanvas.tsx`.

Route entry points:

- `app/admin/course-builder/page.tsx` for master course builder.
- `app/[domain]/admin/course-builder/page.tsx` for tenant course builder.

Current node types:

- Built-in/default: `input` start node, `output` finish node.
- Custom: `pdf`, `video`, `audio`, `quiz`.
- Settings components: `TextNodeSettings`, `VideoNodeSettings`, `AudioNodeSettings`, `QuizNodeSettings`.

How nodes and edges are stored:

- Client state uses `useNodesState` and `useEdgesState`.
- Save sends `{ nodes, edges }` to `saveCourse`.
- `saveCourse` stores payload in `courses.flow_data`.
- Load reads `courses.flow_data` through `getCourse`.

Saving/loading:

- Saving exists through `useCourseSync`.
- First save inserts a new `courses` row and updates URL query string with `?id=...`.
- Later saves update existing course by id and tenant scope.
- Loading by id exists and distinguishes `not_found` from `access_denied`.

Node ID stability:

- `start` and `finish` are stable default ids.
- New ids are generated as `${type}_${crypto.randomUUID().slice(0, 8)}`.
- This is acceptable for UI drafts, but not enough as a long-term domain contract for generated graphs, imports, analytics or player state.

Risks for future AI-generated `flow_data`:

- No schema version.
- No validator for allowed node/edge shape.
- No canonical ordering or layout rules.
- No domain-level distinction between educational content id and React Flow visual node id.
- No migration strategy if node data changes.
- Raw React Flow shape may be hard to consume in an immersive player.

Recommended direction:

- Add `flow_data.schema_version`.
- Define typed domain nodes independent from React Flow rendering.
- Validate graph before save and after AI generation.
- Store generated graph and rendered graph separately if needed: educational structure vs canvas layout.

## 13. AI / Backend Integration

FastAPI/backend URLs:

- `lib/ai/ai-client.ts`: `AI_SERVICE_URL || 'http://localhost:8000'`.
- `components/ai/SpotlightChat.tsx`: hardcoded `http://localhost:8000/ask`.

AI assistant calls:

- `SpotlightChat` calls `/ask` with `{ tenant_id, question }`.
- AI service embeds question, calls Supabase RPC `match_document_chunks`, fetches source document names, then calls `ask_chain`.

Document processing calls:

- AI service exposes `/process-document`.
- It downloads file from Supabase Storage, extracts text from PDF/DOCX/TXT, chunks, embeds and inserts into `document_chunks`.
- It updates document status to `ready` or `error`.
- Frontend automatic trigger after upload was not found. Needs verification.

RAG-related calls:

- `document_service.py` writes chunks into `document_chunks`.
- `ai_service.py` calls RPC `match_document_chunks` with `p_tenant_id`.
- `dependencies.py` initializes `OpenAIEmbeddings(model='text-embedding-3-small')`.

Text generation:

- `app/actions/ai.actions.ts` verifies admin/superadmin through `checkCoursePermissions`.
- `lib/ai/ai-client.ts` posts to `/api/generate/text`.
- `ai-service/app/api/routes/generate.py` supports `summarize`, `format_steps`, `suggest_title`, `generate`.

Backend location:

- Backend is inside this repo under `ai-service/`, but it is separate from Next.js runtime and must be launched as an external service.

Risks:

- CORS allows `*`.
- AI service uses service key and has no request authentication in the FastAPI routes.
- Client-side direct `/ask` call exposes backend URL and makes access control weak.
- OpenAI model names are hardcoded in Python.

## 14. Security and Access Control Risks

Missing route protection:

- `middleware.ts` protects only root `/dashboard` and `/admin`.
- `app/[domain]/admin/layout.tsx` does not check auth/role.
- `app/[domain]/dashboard/page.tsx` does not check auth.

Missing role checks:

- Data Hub actions lack explicit user role checks.
- Tenant admin pages rely on upstream layout/RLS, but tenant admin layout has no guard.
- `UploadZone` inserts documents from client-side Supabase without visible role check in component.

Possible tenant data leakage:

- Data Hub actions mutate by document id without verifying document belongs to current tenant in action.
- AI service receives `tenant_id` in request body and uses service key. If endpoint is public, caller can choose tenant id.
- `ask_question` fetches source names by document ids without an explicit tenant filter in that second query.

Unsafe client-side assumptions:

- Login redirect infers tenant from email domain on client and hardcodes root host.
- `SpotlightChat` sends tenant id from React prop directly to backend.
- Upload path uses client-provided `tenantId`.

Exposed service keys:

- No service key exposure in browser code detected.
- `.env.local` exists; actual values were not copied into this document.
- `SUPABASE_SERVICE_KEY` is used in Next server code and AI service. This is acceptable only if never imported into client bundles and backend endpoints are protected.

Places where server-side checks are needed:

- `app/[domain]/admin/layout.tsx`
- `app/[domain]/dashboard/page.tsx` or a tenant dashboard layout
- all Data Hub server actions
- upload flow, preferably via server action or signed upload policy
- AI `/ask` and `/process-document` endpoints
- course publish/player routes when added

## 15. Technical Debt by Priority

Critical:

- Problem: tenant admin routes are not explicitly protected.
- Affected files: `middleware.ts`, `app/[domain]/admin/layout.tsx`.
- Suggested fix: add tenant-aware auth guard and role checks before rendering tenant admin shell.
- Priority reason: access control must be correct before real tenant data is used.

- Problem: AI service endpoints use service key and have no visible authentication.
- Affected files: `ai-service/app/main.py`, `ai-service/app/api/routes/*.py`, `components/ai/SpotlightChat.tsx`.
- Suggested fix: proxy client AI calls through Next server actions or require signed server-to-server auth.
- Priority reason: public access to RAG/search with service-role backend can leak cross-tenant data.

- Problem: Data Hub mutations trust ids/tenantId without per-action authorization.
- Affected files: `app/[domain]/admin/data-hub/_lib/document-actions.ts`, `UploadZone.tsx`.
- Suggested fix: resolve current user and tenant server-side in every mutation.
- Priority reason: document data is tenant-sensitive.

High:

- Problem: RLS policies/migrations are missing from repo.
- Affected files: repository structure, `docs/01_DATABASE.md`.
- Suggested fix: add Supabase migrations and policy definitions.
- Priority reason: production access rules cannot be reproduced or audited.

- Problem: service-role client is available as a broad singleton.
- Affected files: `lib/supabase/admin.ts`, `app/actions/course.ts`.
- Suggested fix: hide service-role usage behind narrow functions requiring verified context.
- Priority reason: one missed filter can bypass tenant isolation.

- Problem: direct hardcoded AI URL in client.
- Affected files: `components/ai/SpotlightChat.tsx`.
- Suggested fix: replace with server action/API route using `AI_SERVICE_URL`.
- Priority reason: environment-specific config and auth cannot be controlled from browser code.

- Problem: course `flow_data` has no schema/version validation.
- Affected files: `CourseBuilderCanvas.tsx`, `app/actions/course.ts`.
- Suggested fix: define graph schema and validate on save/load/generation.
- Priority reason: AI-generated graphs and player runtime need stable contracts.

Medium:

- Problem: hardcoded colors break white-label and future light theme.
- Affected files: `app/globals.css`, `CourseBuilderCanvas.tsx`, `CourseBuilderSidebar.tsx`, `CourseCard.tsx`.
- Suggested fix: move semantic colors to tokens and CSS variables.
- Priority reason: visual consistency will degrade as tenants/themes grow.

- Problem: student dashboard is placeholder.
- Affected files: `app/dashboard/page.tsx`, `app/[domain]/dashboard/page.tsx`, `CourseCard.tsx`.
- Suggested fix: connect to real courses/enrollments/progress.
- Priority reason: core learner experience is not production-ready.

- Problem: inconsistent error handling.
- Affected files: server actions, AI service routes.
- Suggested fix: typed error codes, safe user messages, structured server logs.
- Priority reason: debugging and UX will be poor under production failures.

- Problem: missing env examples.
- Affected files: repo root, `ai-service/`.
- Suggested fix: add `.env.example` files.
- Priority reason: onboarding and deployment are fragile.

Low:

- Problem: comments and text encoding appear corrupted in several files.
- Affected files: multiple `.ts`, `.tsx`, `.py`, `.md`.
- Suggested fix: normalize files to UTF-8 and keep comments concise.
- Priority reason: readability and maintenance issue, not immediate runtime risk.

- Problem: generated artifacts/venvs exist in working tree.
- Affected files: `.next/`, `.venv/`, `ai-service/venv/`, `__pycache__`.
- Suggested fix: ensure `.gitignore` covers them and remove from version control if tracked.
- Priority reason: repository hygiene and faster tooling.

## 16. Recommended Next Engineering Tasks

1. Implement tenant-aware route guard for `app/[domain]/admin/layout.tsx` and tenant dashboard/player routes.
2. Move `SpotlightChat` calls behind a Next server action/API route and remove hardcoded `localhost:8000` from client code.
3. Add authentication between Next.js and FastAPI AI service; reject unauthenticated direct calls.
4. Add Supabase migrations and RLS policies to repo for `tenants`, `profiles`, `documents`, `document_chunks`, `courses`.
5. Rewrite Data Hub mutations so every action verifies current user, role and tenant ownership server-side.
6. Define a typed `CourseFlow` schema with `schema_version`, allowed node data, stable ids and edge validation.
7. Add graph validation to `saveCourse`, `getCourse` and future AI graph generation.
8. Replace hardcoded colors with semantic tokens for tenant white-label and future light/dark theme.
9. Build real student course list/progress from database and replace placeholder dashboard cards.
10. Design immersive student player around the validated course graph, not raw React Flow objects.

## 17. Open Questions / Needs Verification

- Actual Supabase RLS policies are not present in the repo. Needs verification.
- Database migrations/schema files are not present. Needs verification.
- Whether generated folders are tracked in Git or only present locally. Needs verification.
- Exact Node.js version required by deployment target. Needs verification.
- Exact Python version required by `ai-service`. Needs verification.
- Whether `/process-document` is triggered by webhook, cron, external worker or manual call. Needs verification.
- Whether tenant admin route protection is implemented outside this repo or through hosting rules. Needs verification.
- Whether email-domain redirect is intended production behavior or only local prototype. Needs verification.
- Whether `document_chunks.match_document_chunks` enforces tenant isolation inside SQL function. Needs verification.
- Whether `courses.flow_data` has database constraints or validation outside this codebase. Needs verification.
