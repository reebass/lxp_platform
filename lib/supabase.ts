import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: Заменен обычный createClient на createBrowserClient.
// Обычный клиент сохранял токены в LocalStorage (память браузера), поэтому
// серверный middleware.ts (который читает только Cookies) не видел авторизацию
// и постоянно возвращал пользователя на главную страницу (/).
// createBrowserClient автоматически пишет сессию в Cookies, решая проблему в корне.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
