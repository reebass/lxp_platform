## 3. BACKEND ARCHITECTURE (FastAPI / Python)

### 3.1. Структура проекта
- `app/main.py`: Инициализация FastAPI, настройка CORS.
- `app/api/routes`: Эндпоинты (`chat.py`, `document.py`).
- `app/services`: Бизнес-логика RAG (`ai_service.py`, `document_service.py`).
- `app/models/schemas.py`: Pydantic модели (`AskRequest`, `ProcessDocumentRequest`).
- `app/core/dependencies.py`: Инициализация Supabase, OpenAI, LangChain Prompts.

### 3.2. AI Стек и Промпты
- **LLM:** `gpt-4o-mini` (temperature: 0).
- **Embeddings:** `text-embedding-3-small`.
- **Mega-Prompt (3-Tier Knowledge):**
    - *Tier 1:* Ответ строго по контексту (RAG).
    - *Tier 2:* Platform Knowledge (динамически меняется: если есть `tenant_id` — отправляем к HR компании, если нет — помогаем по глобальной платформе).
    - *Tier 3:* Strict Boundary (вежливый отказ с юмором отвечать на общие вопросы вроде погоды).
    - *CRITICAL RULE:* Отвечать строго на языке запроса пользователя.

### 3.3. RAG Pipeline (`/process-document`)
1. Запрос метаданных файла из БД (`file_path`, `name`).
2. Скачивание байтов из Supabase Storage.
3. Экстракция текста (`pdfplumber` для PDF, `python-docx` для DOCX, декодирование TXT).
4. Сплиттинг (`RecursiveCharacterTextSplitter`).
5. Batch-векторизация (`embed_documents`).
6. Запись чанков и метаданных (`chunk_index`) в таблицу `document_chunks`.
7. Обновление статуса документа (`ready` или `error`).

### 3.4. Semantic Search Pipeline (`/ask`)
1. Векторизация вопроса пользователя.
2. Поиск в БД через RPC `match_document_chunks` (match_threshold: 0.4, match_count: 5, фильтрация по `p_tenant_id`).
3. Сбор контекста и уникальных имен исходных файлов (`source_names`).
4. Генерация ответа через `ask_chain.ainvoke`.

### 3.5. Text Generation Pipeline (`/api/generate/text`)
1. Принимает `GenerateTextRequest` (prompt, action, context?).
2. Action-based system prompts: `summarize`, `format_steps`, `suggest_title`, `generate`.
3. Использует `gpt-4o-mini` (temperature: 0) через LangChain `ChatPromptTemplate`.
4. Отвечает на языке входного текста (CRITICAL rule в каждом prompt).
5. Возвращает `{ result: string }`.