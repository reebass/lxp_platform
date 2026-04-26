# PROJECT SNAPSHOT — NOVUS LXP Platform (2026-04-21)

## 1. TECH STACK

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.1.7 |
| UI | React + React DOM | 19.2.3 |
| Styling | Tailwind CSS v4, Radix UI (Dialog, Dropdown) | ^4 |
| Icons | lucide-react | 0.577.0 |
| Canvas | @xyflow/react (React Flow) | 12.10.2 |
| Toasts | sonner | 2.0.7 |
| DB + Auth | @supabase/supabase-js + @supabase/ssr | 2.99.2 / 0.9.0 |
| AI Backend | FastAPI + LangChain + OpenAI (gpt-4o-mini, text-embedding-3-small) | Python |
| Dev | TypeScript ^5, ESLint 9, PostCSS | — |

---

## 2. ARCHITECTURE

### 2.1 Multi-Tenant Routing
```
middleware.ts → subdomain extraction → NextResponse.rewrite("/[domain]/...")
                                       + Supabase SSR cookie forwarding
```
- `app/page.tsx` — root login page (LoginForm)
- `app/[domain]/layout.tsx` — loads tenant from DB, injects CSS vars (hexToHsl → `--primary`, `--background`, etc.)
- `app/[domain]/admin/` — tenant admin panel (TenantSidebar + TenantHeader)
- `app/[domain]/dashboard/` — student-facing dashboard
- `app/admin/` — super-admin panel (Sidebar + AdminHeader)
- Protected routes: `/dashboard/*`, `/admin/*` → redirect to `/` if no session

### 2.2 Design System
- **Theme**: Cyberpunk dark mode default (`globals.css` `:root` vars)
- **Tailwind config**: HSL-wrapped CSS vars (`hsl(var(--primary))`) for opacity support
- **Tenant override**: DB hex colors → `hexToHsl()` → inline `style` on `[domain]/layout.tsx`
- **Atomic UI** (`components/ui/`): Button (primary/outline/minimal), Input, Card, Alert, Dialog, DropdownMenu, SocialButton, GamifiedError

### 2.3 Supabase Integration
- `lib/supabase/server.ts` — SSR client (uses `cookies()` from `next/headers`)
- `lib/supabase/client.ts` — Browser client (`createBrowserClient`)
- Both use `cookieOptions: { path: '/' }` (fixed for multi-subdomain)

### 2.4 i18n
- `lib/i18n/dictionaries.ts` — static dict object with `uk` and `en` locales
- Currently hardcoded to `dict.uk` usage throughout
- ~80+ keys per locale covering: auth, admin, dashboard, course_builder (tabs, nodes, settings, AI actions, quiz)

---

## 3. DATABASE SCHEMA (Supabase / public)

| Table | Key Columns | Notes |
|---|---|---|
| **tenants** | id, name, subdomain, corporate_domain, color_*, features(jsonb), subscription_plan | Multi-tenant anchor |
| **profiles** | id(=auth.users.id), tenant_id, full_name, role('user'/'admin'/'superadmin') | FK to tenants |
| **documents** | id, tenant_id, name, file_path, status, is_folder, parent_id | File system for RAG |
| **document_chunks** | id, document_id, tenant_id, content, embedding(vector/1536), metadata | RAG vectors |
| **courses** | id, tenant_id, author_id, title, description, **flow_data(jsonb)**, status, timestamps | **Sprint 19 target** |

RLS: Dev Allow All (in progress).

---

## 4. COURSE BUILDER (Sprint 14–18 complete)

### 4.1 Component Tree
```
CourseBuilderCanvas.tsx          ← ReactFlowProvider wrapper
├── CourseBuilderInner           ← nodes/edges state, drag-and-drop, EditingContext
│   ├── ReactFlow               ← canvas with Background, Controls, MiniMap
│   │   ├── PdfNode.tsx          ← text/pdf node (primary color, FileText icon)
│   │   ├── VideoNode.tsx        ← video node (blue, PlaySquare icon)
│   │   ├── AudioNode.tsx        ← audio node (amber, Headphones icon)
│   │   └── QuizNode.tsx         ← quiz node (violet, ListChecks icon)
│   └── CourseBuilderSidebar.tsx ← toolbox (drag) / settings (edit) view
│       ├── SidebarToolbox       ← draggable node palette
│       └── SidebarSettings      ← name input + type-specific settings
│           ├── TextNodeSettings.tsx  ← slides[], tabs(manual/upload/ai), AI toolbar
│           ├── VideoNodeSettings.tsx ← tabs(link-upload/cloud/ai-avatar)
│           ├── AudioNodeSettings.tsx ← tabs(link-upload/cloud/ai-podcast)
│           └── QuizNodeSettings.tsx  ← questions[], tabs(manual/ai-gen)
└── CourseBuilderContext.tsx     ← EditingContext (editingNodeId/setEditingNodeId)
```

### 4.2 Node Data Models
```typescript
// PdfNode (text):
node.data = { label: string, slides: Slide[] }
// Slide = { id, text, imageUrl: string | null }

// VideoNode / AudioNode:
node.data = { label: string, mediaUrl: string, mediaSource: 'link'|'upload'|'cloud'|'ai' }

// QuizNode:
node.data = { label: string, questions: QuizQuestion[] }
// QuizQuestion = { id, text, type:'single'|'multiple', options:[{id,text}], correctAnswers:string[], points:number }
```

### 4.3 Key Patterns
- **Decoupled editing**: `EditingContext` separates "node selection for dragging" from "node selection for editing settings". Only gear icon triggers sidebar.
- **Dynamic sidebar width**: `w-64` (toolbox) → `w-96` (settings), animated transition.
- **Auto-naming on drop**: counts existing nodes of same type, creates `"Текст 1"`, `"Відео 2"` etc.
- **Two-way binding**: sidebar inputs → `updateNodeData()` → `setNodes()` → canvas re-renders.
- **Save handler**: `onSave({ nodes, edges })` callback — currently **console.log only** (Sprint 19 wires this to Supabase).

### 4.4 Canvas Hosting
- `app/admin/course-builder/page.tsx` — `mode="master"` (SuperAdmin)
- `app/[domain]/admin/course-builder/page.tsx` — `mode="tenant"` (TenantAdmin)

---

## 5. AI SERVICE (`ai-service/`)

- FastAPI on port 8000
- **POST /process-document**: fetch from Supabase Storage → extract text (PDF/DOCX/TXT) → chunk → embed → store in `document_chunks`
- **POST /ask**: embed question → `match_document_chunks` RPC → LLM with 3-tier prompt (RAG → Platform Knowledge → Humorous Refusal)
- SpotlightChat.tsx: floating widget, Ctrl+Space toggle, hidden on login/register routes

---

## 6. CURRENT STATE & NEXT STEPS

### ✅ Completed Sprints
| Sprint | Feature |
|---|---|
| 14 | Compact custom nodes, drag-and-drop sidebar, initial edges removed |
| 15 | Smart Sidebar (EditingContext), auto-naming, two-way data binding |
| 16 | TextNodeSettings (slides, tabs, AI toolbar, image gen placeholder) |
| 17 | VideoNodeSettings (link/upload, Drive, AI Avatar) + AudioNodeSettings (link/upload, Drive, AI Podcast) |
| 18 | QuizNodeSettings (manual question builder, AI quiz generation placeholder) |

### 🎯 Sprint 19 (NEXT)
**Goal: Persist React Flow canvas data into Supabase `courses` table.**
- Wire `onSave` to upsert `{ nodes, edges }` into `courses.flow_data` (jsonb)
- Load existing `flow_data` on mount (hydrate canvas from DB)
- Server Action or API route for the write path
- Handle `tenant_id` and `author_id` from session
