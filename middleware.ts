import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Middleware в Next.js работает на "крайнем" сервере (Edge) до того, как запрос 
// достигнет реальной страницы. Он перехватывает (intercepts) абсолютно все запросы, 
// соответствующие правилу 'matcher' ниже.
// Главная задача здесь — проверить, есть ли "живая" сессия Supabase у пользователя,
// и либо пропустить его на `/dashboard`, либо отправить на страницу логина (перенаправление).

export async function middleware(request: NextRequest) {
  // 1. Инициализируем объект ответа (Response), который мы сможем модифицировать.
  // Изначально это просто пропуск запроса "дальше" (next).
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Создаем серверного клиента Supabase SSR (Server-Side Rendering).
  // Мы должны передать ему механизмы для чтения и записи кукисов (cookies).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Чтение всех куки из входящего запроса
        getAll() {
          return request.cookies.getAll();
        },
        // Сохранение новых куки (например, если токен сессии нужно обновить / refresh)
        setAll(cookiesToSet) {
          // Обновляем куки в самом объекте входящего запроса, чтобы 
          // последующие вызовы (например, при рендере страницы) получили свежие токены.
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          
          // Пересоздаем ответ с актуальными кукисами входящего запроса
          supabaseResponse = NextResponse.next({
            request,
          });
          
          // И наконец, "приклеиваем" новые куки к самому ответу, 
          // который уйдет обратно в браузер клиента, чтобы браузер их запомнил.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Проверка сессии (Supabase session check).
  // Важно: мы вызываем именно getUser(), а не getSession().
  // Вызов getUser отправляет запрос на сервер Supabase, что гарантированно проверяет
  // валидность токена и автоматически обновляет его, если его срок действия истек.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Логика защиты маршрутов (Route Protection).
  // Проверяем, пытается ли пользователь получить доступ к защищенному разделу.
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin');

  // Если у пользователя нет сессии (нет объекта user) и он идет на защищенную страницу...
  if (!user && isProtectedRoute) {
    // ...то мы прерываем его запрос. Клонируем оригинальный URL и меняем путь на корень ('/').
    const url = request.nextUrl.clone();
    url.pathname = '/';
    // Выполняем принудительное перенаправление (redirect) на страницу авторизации.
    return NextResponse.redirect(url);
  }

  // 5. Multi-Tenant Subdomain Routing (Правило B)
  // Извлекаем текущий hostname из заголовков запроса
  const hostname = request.headers.get("host") || "";
  
  // Очищаем hostname для локальной среды (localhost:3000 -> localhost)
  let currentHost = process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
    ? hostname.replace(`.vercel.app`, `.vercel.app`) // Упрощенно для Vercel
    : hostname;
    
  currentHost = currentHost.replace("localhost:3000", "localhost");

  // Определяем корневой домен (например, 'novus.ua' в проде или 'localhost' локально)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";

  // Если запрос пришел на сабдомен (например, edu.novus.ua или novus.localhost)
  if (currentHost !== rootDomain && currentHost !== "localhost") {
    // ВАЖНО: Формируем новый URL, направляя запрос в динамическую папку /[domain]
    // Добавляем search параметры (query string), чтобы не потерять параметры типа ?id=123
    const newUrl = new URL(`/${currentHost}${request.nextUrl.pathname}${request.nextUrl.search}`, request.url);
    
    // Создаем ответ с перезаписью URL, чтобы Next.js отрендерил правильный контент
    const rewriteResponse = NextResponse.rewrite(newUrl);

    // CRITICAL: Копируем куки, установленные Supabase SSR (например, обновленные токены сессии),
    // из оригинального supabaseResponse в новый rewriteResponse, чтобы не разлогинить пользователя
    // при маршрутизации на сабдоменах.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value);
    });

    return rewriteResponse;
  }

  // 6. Правило A: Если это основной домен, просто возвращаем оригинальный ответ Supabase
  return supabaseResponse;
}

// Конфигурация Middleware: мы указываем Next.js, для каких путей он ДОЛЖЕН запускаться.
export const config = {
  // Улучшенный matcher исключает API, статику, изображения и скрытые папки Next.js (_next),
  // предотвращая бесконечные циклы перезаписи и снижая нагрузку на Middleware.
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"
  ],
};
