"use client";

import React, { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { CreditCard, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { updateTenantSubscription } from '@/app/actions/tenant';
import { dict } from '@/lib/i18n/dictionaries';

// ─── SubmitButton ─────────────────────────────────────────────────────────────
function SubmitButton() {
  const { pending } = useFormStatus();
  const t = dict.uk.admin.tenantsPage.subscription;
  return (
    <Button type="submit" variant="primary" className="w-full" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> {t.saving}</> : t.save}
    </Button>
  );
}

// Единая константа для подавления Chrome-автозаполнения (тот же хак из BrandingForm / globals.css).
const AUTOFILL_CLASSES =
  '[&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]';

// color-mix() — динамически затемняем --background на 30% для эффекта «углублённого» инпута.
// Работает с любой темой тенанта (light, dark, custom).
const INPUT_BASE = `w-full bg-[color-mix(in_srgb,var(--background),black_30%)] border border-border rounded-md text-foreground px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all ${AUTOFILL_CLASSES}`;

// Стили для <select>: те же что и для текстовых инпутов — единообразие темы.
const SELECT_CLASS = `${INPUT_BASE} cursor-pointer`;

// ─── SubscriptionForm ────────────────────────────────────────────────────────

// Хелпер: конвертирует ISO-строку из Supabase (напр. "2025-04-01T00:00:00+00:00")
// в формат YYYY-MM-DD, который ожидает нативный HTML-инпут type="date".
// Без этого преобразования браузер не распознает значение и поле остаётся пустым.
const formatDateForInput = (isoString?: string | null): string =>
  isoString ? new Date(isoString).toISOString().split('T')[0] : '';

export function SubscriptionForm({ tenant }: { tenant: any }) {
  const t = dict.uk.admin.tenantsPage.subscription;

  // Нормализация: null из БД → дефолтные строки для контролируемых инпутов.
  // max_users нормализуем в строку (инпут type="number" работает со строками).
  // ФИКС: правильные имена колонок в БД — subscription_status и subscription_plan (не status/plan).
  const [formData, setFormData] = useState({
    subscription_status: tenant.subscription_status || 'Active',
    subscription_plan: tenant.subscription_plan || 'Free',
    max_users: tenant.max_users != null ? String(tenant.max_users) : '',
    trial_ends_at: formatDateForInput(tenant.trial_ends_at),
    storage_limit_mb: String(tenant.storage_limit_mb ?? 1024),
  });

  // СИНХРОНІЗАЦІЯ ПРОПА → СТЕЙТА (useEffect):
  // Після Server Action + revalidatePath Next.js передає оновлений `tenant` проп.
  // useState ігнорує це оновлення — useEffect виправляє: синхронізує стейт
  // з новими даними з БД і автоматично ховає кнопку «Зберегти».
  useEffect(() => {
    setFormData({
      subscription_status: tenant.subscription_status || 'Active',
      subscription_plan: tenant.subscription_plan || 'Free',
      max_users: tenant.max_users != null ? String(tenant.max_users) : '',
      trial_ends_at: formatDateForInput(tenant.trial_ends_at),
      storage_limit_mb: String(tenant.storage_limit_mb ?? 1024),
    });
  }, [tenant]);

  // isDirty: порівнюємо кожне поле напряму з поточним tenant пропом.
  // Після revalidatePath проп оновлюється → hasChanges стає false → кнопка ховається.
  const hasChanges =
    formData.subscription_status !== (tenant.subscription_status || 'Active') ||
    formData.subscription_plan !== (tenant.subscription_plan || 'Free') ||
    formData.max_users !== (tenant.max_users != null ? String(tenant.max_users) : '') ||
    formData.trial_ends_at !== formatDateForInput(tenant.trial_ends_at) ||
    formData.storage_limit_mb !== String(tenant.storage_limit_mb ?? 1024);

  const updateAction = updateTenantSubscription.bind(null, tenant.id);

  // Визуальный индикатор статуса: зелёный для Active, красный для остальных.
  const statusDotClass =
    formData.subscription_status === 'Active'
      ? 'w-2 h-2 rounded-full bg-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]'
      : 'w-2 h-2 rounded-full bg-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]';

  return (
    <Card className="h-full border border-border bg-content overflow-hidden relative group hover:border-primary/50 transition-colors">
      <div className="absolute left-0 top-0 h-full w-1 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
        <CreditCard className="mr-3" size={24} />
        {t.title}
      </h3>

      <form action={updateAction as any} className="space-y-4">

        {/* Статус: визуальный индикатор + select */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium text-sm flex items-center gap-2">
            <span className={statusDotClass} />
            {t.status}
          </label>
          {/* ФИКС BACKSPACE: явная запись по ключу `status` вместо [e.target.name]. */}
          <select
            name="subscription_status"
            value={formData.subscription_status}
            onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value })}
            className={SELECT_CLASS}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        {/* Тарифний план */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium text-sm">{t.currentPlan}</label>
          <select
            name="subscription_plan"
            value={formData.subscription_plan}
            onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
            className={SELECT_CLASS}
          >
            <option value="Free">Free</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        {/* Ліміт користувачів: порожнє = безліміт */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium text-sm">
            {t.userLimit}
            <span className="ml-1 text-xs text-muted-foreground">{t.emptyIsUnlimited}</span>
          </label>
          <input
            type="number"
            name="max_users"
            value={formData.max_users}
            min={1}
            onChange={(e) => setFormData({ ...formData, max_users: e.target.value })}
            placeholder={t.unlimited}
            className={INPUT_BASE}
          />
        </div>

        {/* Кінець Trial періоду */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium text-sm">
            {t.trialEnd}
          </label>
          <input
            type="date"
            name="trial_ends_at"
            value={formData.trial_ends_at}
            onChange={(e) => setFormData({ ...formData, trial_ends_at: e.target.value })}
            className={`${INPUT_BASE} cursor-text [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* Ліміт сховища: пресети в МБ, відображаємо як зрозумілі ГБ/МБ */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium text-sm flex items-center gap-2">
            {t.storageLimit}
          </label>
          <select
            name="storage_limit_mb"
            value={formData.storage_limit_mb}
            onChange={(e) => setFormData({ ...formData, storage_limit_mb: e.target.value })}
            className={SELECT_CLASS}
          >
            <option value="512">512 MB</option>
            <option value="1024">1 GB</option>
            <option value="5120">5 GB</option>
            <option value="10240">10 GB</option>
            <option value="51200">50 GB</option>
          </select>
        </div>

        {/* Кнопка ЗАВЖДИ в DOM (invisible, не conditional) — нет layout shift.
            `invisible` = визуально скрыта, но сохраняет высоту места в потоке. */}
        <div className={`pt-2 transition-opacity duration-200 ${!hasChanges ? 'invisible pointer-events-none' : ''}`}>
          <SubmitButton />
        </div>

      </form>
    </Card>
  );
}
