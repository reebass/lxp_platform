"use client";

import React, { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Building, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { updateTenantGeneral } from '@/app/actions/tenant';

// ─── SubmitButton ─────────────────────────────────────────────────────────────
// Нативное API useFormStatus работает ТОЛЬКО внутри дочернего элемента <form>.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" className="w-full" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Збереження...</> : 'Зберегти інформацію'}
    </Button>
  );
}

// Единая константа для подавления Chrome-автозаполнения.
// box-shadow inset вытесняет жёлтый/белый фон, -webkit-text-fill-color фиксирует цвет текста.
// Тот же приём используется в globals.css и BrandingForm.tsx для единообразия.
const AUTOFILL_CLASSES =
  '[&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]';

// color-mix() динамически затемняет --background на 30%, создавая эффект «углублённого» инпута.
// Работает с любой темой тенанта без хардкода конкретного цвета.
const INPUT_CLASS = `w-full bg-[color-mix(in_srgb,var(--background),black_30%)] border border-border rounded-md text-foreground px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all ${AUTOFILL_CLASSES}`;

// ─── GeneralInfoForm ──────────────────────────────────────────────────────────

export function GeneralInfoForm({ tenant }: { tenant: any }) {

  // Нормализация: null из БД → '' (пустая строка) для контролируемых инпутов.
  // initialState — эталон для сравнения (isDirty pattern).
  const [formData, setFormData] = useState({
    subdomain:        tenant.subdomain        || '',
    corporate_domain: tenant.corporate_domain || '',
  });

  // СИНХРОНИЗАЦИЯ ПРОПА → СТЕЙТА (useEffect):
  // Після Server Action + revalidatePath Next.js передає оновлений `tenant` проп.
  // useState ігнорує оновлення пропа після монтування — useEffect виправляє це:
  // при зміні пропа стейт скидається до актуальних значень БД і кнопка ховається.
  useEffect(() => {
    setFormData({
      subdomain:        tenant.subdomain        || '',
      corporate_domain: tenant.corporate_domain || '',
    });
  }, [tenant]);

  // isDirty: порівнюємо кожне поле з поточним tenant пропом (не із замороженим initialState).
  // Так hasChanges завжди актуальний після revalidatePath — проп оновився, порівняння теж.
  const hasChanges =
    formData.subdomain        !== (tenant.subdomain        || '') ||
    formData.corporate_domain !== (tenant.corporate_domain || '');

  // Привязка Server Action с жёстко переданным tenantId.
  const updateAction = updateTenantGeneral.bind(null, tenant.id);

  return (
    <Card className="h-full border border-border bg-content overflow-hidden relative group hover:border-primary/50 transition-colors">
      <div className="absolute left-0 top-0 h-full w-1 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
        <Building className="mr-3" size={24} />
        Загальна інформація
      </h3>

      {/* Статичные read-only поля (не редактируются) */}
      <div className="space-y-4 text-sm mb-6">
        <div className="flex flex-col">
          <span className="text-muted-foreground font-medium mb-1">ID Клієнта</span>
          {/* ID — не редактируемое поле. Используем color-mix для темного фона без хардкода. */}
          <span className="text-foreground font-mono text-xs break-all bg-[color-mix(in_srgb,var(--background),black_30%)] p-2 rounded border border-border">
            {tenant.id}
          </span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="font-medium">Створено:</span>
          <span className="text-foreground">{new Date(tenant.created_at).toLocaleDateString('uk-UA')}</span>
        </div>
      </div>

      <div className="w-full h-px bg-border mb-4" />

      {/* Форма с редактируемыми полями */}
      <form action={updateAction as any} className="space-y-4">

        <div className="space-y-1">
          <label className="text-muted-foreground font-medium text-sm">Сабдомен</label>
          {/* ФИКС BACKSPACE: явная запись по ключу `subdomain` — не [e.target.name],
              чтобы исключить проблему с React Synthetic Event Pooling. */}
          <input
            type="text"
            name="subdomain"
            value={formData.subdomain}
            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
            placeholder="наприклад: novus"
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1">
          <label className="text-muted-foreground font-medium text-sm">Корпоративна пошта</label>
          <input
            type="text"
            name="corporate_domain"
            value={formData.corporate_domain}
            onChange={(e) => setFormData({ ...formData, corporate_domain: e.target.value })}
            placeholder="наприклад: novus.ua"
            className={INPUT_CLASS}
          />
        </div>

        {/* Кнопка ЗАВЖДИ в DOM (invisible, не conditional) — нет layout shift.
            `invisible` = визуально скрыта, но занимает место в потоке документа.
            `pointer-events-none` блокирует клики на невидимой кнопке. */}
        <div className={`pt-2 transition-opacity duration-200 ${!hasChanges ? 'invisible pointer-events-none' : ''}`}>
          <SubmitButton />
        </div>

      </form>
    </Card>
  );
}
