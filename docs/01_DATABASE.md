# ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ ПРОЕКТА: NOVUS AI-Driven LXP (v1.0)

## 1. СТРУКТУРА БАЗЫ ДАННЫХ (Supabase / public)

### Таблица: tenants (Организации/Клиенты)
- id: uuid (PK, default: gen_random_uuid())
- name: text (Название компании)
- subdomain: text (Уникальный поддомен для Next.js)
- corporate_domain: text (nullable, для SSO/авторизации)
- logo_url: text (Логотип компании)
- subscription_plan: text (default: 'trial')
- features: jsonb (default: {"soft_skills": true, "ai_simulator": true, "hard_skills_rag": false})
- color_background, color_foreground, color_primary, color_border, color_content, color_muted_foreground: varchar (Кастомизация UI)
- storage_limit_mb: int (default: 1024)

### Таблица: profiles (Пользователи)
- id: uuid (PK, FK: auth.users.id)
- tenant_id: uuid (FK: tenants.id)
- full_name: text
- role: text (default: 'user' | варианты: 'student', 'admin', 'superadmin')
- b2c_subscription_plan: text (для независимых студентов)

### Таблица: documents (Файловая система)
- id: uuid (PK)
- tenant_id: uuid (FK: tenants.id)
- name: text
- size_bytes: bigint
- file_path: text (Путь в Supabase Storage)
- status: text (default: 'ready' | 'pending' | 'error')
- is_folder: boolean (Поддержка иерархии)
- parent_id: uuid (FK: documents.id, для вложенности папок)

### Таблица: document_chunks (Векторные знания)
- id: uuid (PK)
- document_id: uuid (FK: documents.id)
- tenant_id: uuid (FK: tenants.id)
- content: text (Сырой текст чанка)
- embedding: vector(1536) (Модель text-embedding-3-small)
- metadata: jsonb

### Таблица: courses (Конструктор курсов)
- `id`: uuid (PK, default: gen_random_uuid())
- `tenant_id`: uuid (FK: tenants.id, **nullable** — NULL означає майстер-курс superadmin'а, NOT NULL — курс тенанта)
- `author_id`: uuid (FK: profiles.id, кто создал курс)
- `title`: text (Название курса)
- `description`: text (nullable)
- `flow_data`: jsonb (Ключевое поле: здесь хранится весь массив nodes и edges из React Flow)
- `status`: text (default: 'draft' | 'published')
- `created_at`: timestamp with time zone
- `updated_at`: timestamp with time zone

## 2. ПОЛИТИКИ БЕЗОПАСНОСТИ (RLS)
- Тенанты: Публичное чтение (для лендингов), полный доступ только у superadmin.
- Профили: Пользователь может видеть и обновлять только свой профиль (auth.uid() = id).
- Документы/Чанки: Строгая изоляция по tenant_id (в процессе финализации, сейчас Dev Allow All).