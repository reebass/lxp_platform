"use client";

import React, { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Palette, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { updateTenantBranding } from '@/app/actions/tenant';
import { dict } from '@/lib/i18n/dictionaries';

// ─── Типы ────────────────────────────────────────────────────────────────────

interface BrandingState {
  logo_url: string;
  color_background: string;
  color_content: string;
  color_foreground: string;
  color_muted_foreground: string;
  color_primary: string;
  color_border: string;
}

// ─── SubmitButton ─────────────────────────────────────────────────────────────

// Нативное API useFormStatus работает ТОЛЬКО внутри дочернего элемента родительской <form>.
function SubmitButton() {
  const { pending } = useFormStatus();
  const t = dict.uk.admin.tenantsPage.branding;
  return (
    <Button type="submit" variant="primary" className="w-full" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> {t.saving}</> : t.save}
    </Button>
  );
}

// ─── ColorInput ───────────────────────────────────────────────────────────────

// Вынесен наружу из BrandingForm во избежание ошибок React (unstable nested components).
// Полностью контролируемый — принимает value и onChange снаружи.
interface ColorInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
}

// ФИКС АВТОЗАПОЛНЕНИЯ: произвольные Tailwind-варианты [&:-webkit-autofill] подавляют
// стандартный жёлтый/белый фон Chrome при автозаполнении. Хак работает через:
// 1. box-shadow inset с задержкой 5000s визуально "вытесняет" браузерный цвет.
// 2. -webkit-text-fill-color жёстко фиксирует цвет текста на нашу CSS-переменную.
const AUTOFILL_CLASSES =
  '[&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]';

const ColorInput = ({ name, label, value, onChange }: ColorInputProps) => (
  <div className="space-y-1">
    <label className="text-muted-foreground font-medium text-sm">{label}</label>
    {/* color-mix() динамически затемняет --background на 30%, создавая эффект «углублённого»
        инпута относительно фона карточки. Это работает с любой темой тенанта — не нужно
        хардкодить конкретный hex-цвет. Тот же приём используется в globals.css для автозаполнения. */}
    <div className="flex bg-[color-mix(in_srgb,var(--background),black_30%)] border border-border rounded-md focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden transition-all">
      {/* Color picker синхронизирует своё значение с текстовым инпутом через единый onChange */}
      <input
        type="color"
        value={value || '#111111'}
        className="w-10 h-10 border-0 bg-transparent p-1 cursor-pointer"
        onChange={(e) => onChange(e.target.value)}
      />
      {/* Текстовый инпут — источник правды для FormData. Автозаполнение подавлено. */}
      <input
        id={name}
        type="text"
        name={name}
        value={value}
        placeholder="#111111"
        className={`flex-1 bg-transparent text-foreground px-3 py-2 outline-none text-sm ${AUTOFILL_CLASSES}`}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

// ─── BrandingForm ─────────────────────────────────────────────────────────────

export function BrandingForm({ tenant }: { tenant: any }) {
  const t = dict.uk.admin.tenantsPage.branding;

  // Нормализуем все поля: null из Supabase → '' (пустая строка).
  // initialState фиксируется при монтировании и служит эталоном для сравнения (isDirty).
  const initialState: BrandingState = {
    logo_url: tenant.logo_url || '',
    color_background: tenant.color_background || '',
    color_content: tenant.color_content || '',
    color_foreground: tenant.color_foreground || '',
    color_muted_foreground: tenant.color_muted_foreground || '',
    color_primary: tenant.color_primary || '',
    color_border: tenant.color_border || '',
  };

  const [formData, setFormData] = useState<BrandingState>({
    logo_url: tenant.logo_url || '',
    color_background: tenant.color_background || '',
    color_content: tenant.color_content || '',
    color_foreground: tenant.color_foreground || '',
    color_muted_foreground: tenant.color_muted_foreground || '',
    color_primary: tenant.color_primary || '',
    color_border: tenant.color_border || '',
  });

  // СИНХРОНИЗАЦИЯ ПРОПА → СТЕЙТА (useEffect):
  // После Server Action + revalidatePath Next.js передаёт новый объект `tenant` в компонент.
  // useState() инициализируется только при монтировании и игнорирует обновления пропа.
  // useEffect с зависимостью [tenant] обнаруживает изменение пропа и сбрасывает стейт
  // к актуальным значениям из БД — это скрывает кнопку "Сохранить" после успешного сабмита.
  useEffect(() => {
    setFormData({
      logo_url: tenant.logo_url || '',
      color_background: tenant.color_background || '',
      color_content: tenant.color_content || '',
      color_foreground: tenant.color_foreground || '',
      color_muted_foreground: tenant.color_muted_foreground || '',
      color_primary: tenant.color_primary || '',
      color_border: tenant.color_border || '',
    });
  }, [tenant]);

  // Хелпер для цветовых полей: обновляет одно поле по ключу.
  const setField = (key: keyof BrandingState) => (val: string) =>
    setFormData(prev => ({ ...prev, [key]: val }));

  // ─── Logo URL: UX "Lock & Clear" ──────────────────────────────────────────
  // Блокируем инпут если текущее значение совпадает с тем, что в БД (tenant prop).
  const isLogoLocked = !!formData.logo_url && formData.logo_url === (tenant.logo_url || '');

  // Очищает поле лого — разблокирует инпут и убирает превью.
  const handleClearLogo = () => setFormData(prev => ({ ...prev, logo_url: '' }));

  // ─── isDirty / hasChanges ─────────────────────────────────────────────────
  // Сравниваем каждое поле formData напрямую с текущим tenant пропом (не с замороженным
  // initialState). Это гарантирует правильный результат после revalidatePath:
  // tenant проп обновился → новое сравнение → hasChanges = false → кнопка скрыта.
  const hasChanges =
    formData.logo_url !== (tenant.logo_url || '') ||
    formData.color_background !== (tenant.color_background || '') ||
    formData.color_content !== (tenant.color_content || '') ||
    formData.color_foreground !== (tenant.color_foreground || '') ||
    formData.color_muted_foreground !== (tenant.color_muted_foreground || '') ||
    formData.color_primary !== (tenant.color_primary || '') ||
    formData.color_border !== (tenant.color_border || '');

  const updateAction = updateTenantBranding.bind(null, tenant.id);

  return (
    <Card className="h-full border border-border bg-content overflow-hidden relative group hover:border-primary/50 transition-colors">
      <div className="absolute left-0 top-0 h-full w-1 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
        <Palette className="mr-3" size={24} />
        {t.title}
      </h3>

      <form action={updateAction as any} className="space-y-6">

        {/* ── Logo URL: Lock & Clear ── */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium text-sm">{t.logoUrl}</label>

          {/* Flex-контейнер: инпут (с кнопкой ✕ внутри) + превью справа.
              min-h-12 исключает прыжок высоты при появлении/исчезновении превью. */}
          <div className="flex gap-3 items-center min-h-[48px]">

            {/* Относительный контейнер для позиционирования кнопки ✕ внутри инпута */}
            <div className="relative flex-1">
              <input
                type="text"
                name="logo_url"
                value={formData.logo_url}
                // readOnly когда URL совпадает с сохранённым в БД — блокируем случайное удаление.
                // При пустом поле или после нажатия ✕ — поле разблокируется.
                readOnly={isLogoLocked}
                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://example.com/logo.png"
                className={`w-full bg-[color-mix(in_srgb,var(--background),black_30%)] border border-border rounded-md text-foreground px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all pr-8 ${AUTOFILL_CLASSES} ${isLogoLocked ? 'cursor-default opacity-70' : ''}`}
              />
              {/* Кнопка ✕: отображается только если поле не пустое.
                  При клике сбрасывает logo_url → '' и разблокирует инпут. */}
              {formData.logo_url && (
                <button
                  type="button"
                  onClick={handleClearLogo}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  title={t.clearLogo}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Превью логотипа справа: рендерится только если URL задан.
                onError сбрасывает logo_url в '' если изображение сломано. */}
            {formData.logo_url && (
              <img
                src={formData.logo_url}
                alt={t.logoPreview}
                className="w-12 h-12 object-contain bg-background border border-border rounded shrink-0"
                onError={handleClearLogo}
              />
            )}
          </div>
        </div>

        {/* ── 6-Color Grid ── */}
        {/* 1:1 маппинг: name атрибуты ↔ колонки БД ↔ CSS-переменные */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorInput name="color_background" label={t.cardBg} value={formData.color_background} onChange={setField('color_background')} />
          <ColorInput name="color_content" label={t.pageBg} value={formData.color_content} onChange={setField('color_content')} />
          <ColorInput name="color_foreground" label={t.foreground} value={formData.color_foreground} onChange={setField('color_foreground')} />
          <ColorInput name="color_muted_foreground" label={t.mutedForeground} value={formData.color_muted_foreground} onChange={setField('color_muted_foreground')} />
          <ColorInput name="color_primary" label={t.primaryAccess} value={formData.color_primary} onChange={setField('color_primary')} />
          <ColorInput name="color_border" label={t.border} value={formData.color_border} onChange={setField('color_border')} />
        </div>

        {/* Кнопка ВСЕГДА в DOM (invisible, не conditional) — предотвращает layout shift.
            `invisible` скрывает визуально, но сохраняет место в потоке.
            `pointer-events-none` блокирует клики пока кнопка невидима. */}
        <div className={`pt-2 flex justify-end transition-opacity duration-200 ${!hasChanges ? 'invisible pointer-events-none' : ''}`}>
          <SubmitButton />
        </div>

      </form>
    </Card>
  );
}
