"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Серверное действие (Server Action) для безопасного выполнения мутаций базы данных.
// Это выполняется исключительно в скрытом защищенном Node окружении.
export async function createTenant(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const subdomain = formData.get('subdomain') as string;
    const corporate_domain = formData.get('corporate_domain') as string;

    if (!name || name.trim() === '') {
      return { error: 'Назва компанії обов\'язкова' };
    }

    // Используем наш централизованный клиент (lib/supabase/server.ts),
    // чтобы избежать дублирования инициализации кук и SSR зависимостей!
    const supabase = await createClient();

    // ─── SERVER VALIDATION: Перевірка на дублікати ────────────────────────
    // Перевіряємо, чи не існує вже клієнт з такою ж назвою АБО таким же сабдоменом.
    const safeName = name.trim();
    const safeSubdomain = subdomain && subdomain.trim() !== '' ? subdomain.trim() : null;
    const safeCorporateDomain = corporate_domain && corporate_domain.trim() !== '' ? corporate_domain.trim() : null;

    let duplicateQuery = supabase.from('tenants').select('id');
    
    if (safeSubdomain) {
      duplicateQuery = duplicateQuery.or(`name.eq."${safeName}",subdomain.eq."${safeSubdomain}"`);
    } else {
      duplicateQuery = duplicateQuery.eq('name', safeName);
    }

    const { data: existingTenants, error: queryError } = await duplicateQuery;

    if (queryError) {
      console.error("Supabase duplicate check error:", queryError);
      return { error: 'Помилка при перевірці даних. Спробуйте пізніше.' };
    }

    if (existingTenants && existingTenants.length > 0) {
      return { error: 'Клієнт з такою назвою або сабдоменом вже існує.' };
    }

    // Выполняем SQL INSERT через Supabase RPC/REST API
    // Маппим полученные из формы поля на реальные колонки БД: subdomain и corporate_domain.
    // Если пользователь оставил поле пустым (пустая строка), строго передаем null, 
    // чтобы не вызывать конфликтов с SQL unique constraints на уровне БД.
    const { error } = await supabase
      .from('tenants')
      .insert([{
        name: safeName,
        subdomain: safeSubdomain,
        corporate_domain: safeCorporateDomain
      }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return { error: error.message };
    }

    // Инвалидируем серверный кэш страницы /admin/tenants
    revalidatePath('/admin/tenants');

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in createTenant:", err);
    return { error: 'Помилка при створенні клієнта. Перевірте дані.' };
  }
}

// Серверное действие для обновления полей брендинга конкретного клиента.
export async function updateTenantBranding(tenantId: string, formData: FormData) {
  // АРХИТЕКТУРА "NULL = значение по умолчанию из globals.css":
  // Если пользователь полностью очистил поле цвета и отправил пустую строку,
  // мы сохраняем явный NULL в БД. Это сигнализирует CSS-инжектору на странице тенанта,
  // что данную CSS-переменную НЕ нужно переопределять — браузер возьмёт значение из globals.css.
  // Функция-хелпер: пустая строка → null, непустая → сохраняем как есть.
  const orNull = (val: FormDataEntryValue | null): string | null => {
    const trimmed = (val as string)?.trim();
    return trimmed === '' ? null : trimmed ?? null;
  };

  const color_background = orNull(formData.get('color_background'));
  const color_foreground = orNull(formData.get('color_foreground'));
  const color_muted_foreground = orNull(formData.get('color_muted_foreground'));
  const color_primary = orNull(formData.get('color_primary'));
  const color_border = orNull(formData.get('color_border'));
  const color_content = orNull(formData.get('color_content'));
  const logo_url = orNull(formData.get('logo_url'));

  const supabase = await createClient();

  const { error } = await supabase
    .from('tenants')
    .update({
      color_background,
      color_foreground,
      color_muted_foreground,
      color_primary,
      color_border,
      color_content,
      logo_url,
    })
    .eq('id', tenantId);

  if (error) {
    console.error("Supabase update error:", error);
    return { error: error.message };
  }

  // Next.js 15: принудительно сбрасываем кэш динамической страницы, 
  // чтобы Серверные Компоненты отрендерили свежие цвета из базы данных!
  revalidatePath(`/admin/tenants/[id]`, 'page');

  return { success: true };
}

// ─── Загальна інформація ──────────────────────────────────────────────────────

// Серверное действие для обновления полей "Загальна інформація" тенанта.
// Обновляет: subdomain + corporate_domain.
// Пустая строка → null, чтобы не конфликтовать с SQL UNIQUE constraints на эти поля.
export async function updateTenantGeneral(tenantId: string, formData: FormData) {
  const orNull = (val: FormDataEntryValue | null): string | null => {
    const trimmed = (val as string)?.trim();
    return trimmed === '' ? null : trimmed ?? null;
  };

  const subdomain = orNull(formData.get('subdomain'));
  const corporate_domain = orNull(formData.get('corporate_domain'));

  const supabase = await createClient();

  const { error } = await supabase
    .from('tenants')
    .update({ subdomain, corporate_domain })
    .eq('id', tenantId);

  if (error) {
    console.error('updateTenantGeneral error:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/tenants/[id]', 'page');
  return { success: true };
}

// ─── Підписка та Ліміти ───────────────────────────────────────────────────────

// Серверное действие для обновления полей подписки тенанта.
// Обновляет: status, plan, max_users.
// max_users парсим в число (или null если пустое, т.е. безлимит).
export async function updateTenantSubscription(tenantId: string, formData: FormData) {
  const orNull = (val: FormDataEntryValue | null): string | null => {
    const trimmed = (val as string)?.trim();
    return trimmed === '' ? null : trimmed ?? null;
  };

  const subscription_status = orNull(formData.get('subscription_status'));
  const subscription_plan = orNull(formData.get('subscription_plan'));
  const rawUsers = (formData.get('max_users') as string)?.trim();
  // parseInt перед отправкой в Supabase — колонка max_users имеет тип integer в БД.
  const max_users = rawUsers === '' ? null : parseInt(rawUsers, 10) || null;
  // trial_ends_at: пустая строка (пользователь очистил поле) → null (убираем дату из БД).
  // Непустая строка — ISO-дата в формате YYYY-MM-DD, Supabase принимает и хранит как timestamptz.
  const trial_ends_at = orNull(formData.get('trial_ends_at'));

  const supabase = await createClient();

  const { error } = await supabase
    .from('tenants')
    .update({ subscription_status, subscription_plan, max_users, trial_ends_at })
    .eq('id', tenantId);

  if (error) {
    console.error('updateTenantSubscription error:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/tenants/[id]', 'page');
  return { success: true };
}

