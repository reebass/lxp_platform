import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Building } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GeneralInfoForm } from '@/components/admin/tenants/GeneralInfoForm';
import { BrandingForm } from '@/components/admin/tenants/BrandingForm';
import { SubscriptionForm } from '@/components/admin/tenants/SubscriptionForm';
import { hexToHsl } from '@/lib/colors';
import { dict } from '@/lib/i18n/dictionaries';

// В Next.js 15 интерфейс params для динамических роутов (App Router) обязан быть Promise.
interface TenantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TenantDetail({ params }: TenantDetailPageProps) {
  // В Next.js 15 мы строго обязаны "await" параметры URL перед их использованием!
  // Это асинхронное извлечение ID из динамического сегмента [id].
  const { id } = await params;

  const supabase = await createClient();

  // Делаем одиночный SQL запрос для получения всей информации по конкретному клиенту.
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();

  const d = dict.uk.admin.tenantsPage;

  if (error || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center p-16 mt-8 h-64 border-dashed border-2 border-border bg-background/50 rounded-xl">
        <h2 className="text-2xl text-red-500 opacity-80 font-bold mb-6">{d.notFound.title}</h2>
        <Link href="/admin/tenants">
          <Button variant="outline">
            <ArrowLeft className="mr-2" size={16} /> {d.notFound.backToList}
          </Button>
        </Link>
      </div>
    );
  }

  // АРХИТЕКТУРНЫЙ ПРИНЦИП: глобальный globals.css является единственным источником правды (Single Source of Truth)
  // для тем по умолчанию. БД хранит NULL для не-кастомизированных полей.
  // Мы ТОЛЬКО переопределяем переменную, если тенант сохранил явное значение в БД.
  // Если все поля NULL — блок <style> вообще не рендерится,
  // и браузер использует нативные CSS-переменные из globals.css.
  let cssVars = '';
  if (tenant.color_background) cssVars += `  --background: ${hexToHsl(tenant.color_background)} !important;\n`;
  if (tenant.color_foreground) cssVars += `  --foreground: ${hexToHsl(tenant.color_foreground)} !important;\n`;
  if (tenant.color_muted_foreground) cssVars += `  --muted-foreground: ${hexToHsl(tenant.color_muted_foreground)} !important;\n`;
  if (tenant.color_primary) cssVars += `  --primary: ${hexToHsl(tenant.color_primary)} !important;\n`;
  if (tenant.color_border) cssVars += `  --border: ${hexToHsl(tenant.color_border)} !important;\n`;
  if (tenant.color_content) cssVars += `  --background-content: ${hexToHsl(tenant.color_content)} !important;\n`;

  return (
    <div className="w-full space-y-8">
      {/* Рендерим <style> тег ТОЛЬКО если хотя бы одна CSS-переменная была кастомизирована в БД.
          Если cssVars пуста, тег не нужен — globals.css уже задаёт все дефолты. */}
      {cssVars && <style dangerouslySetInnerHTML={{ __html: `:root {\n${cssVars}}` }} />}
      {/* Шапка страницы */}
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <Link href="/admin/tenants" className="text-muted-foreground hover:text-primary transition-colors flex items-center w-max">
          <ArrowLeft className="mr-2" size={18} />
          <span className="text-sm font-medium">{d.notFound.backToList}</span>
        </Link>
        <h1 className="text-4xl font-bold text-foreground drop-shadow-[0_0_2px_hsl(var(--primary))] flex items-center h-12">
          {/* 
            СТРОГАЯ УСЛОВНАЯ ОТРИСОВКА (Mutually Exclusive):
            Либо мы показываем прямоугольный логотип тенанта (без скруглений),
            либо, если логотип отсутствует, выводим текстовое название (tenant.name).
            Это обеспечивает чистый брендированный интерфейс без дублирования информации.
          */}
          {tenant.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              className="h-10 w-auto object-contain animate-fade-in"
            />
          ) : (
            <span>{tenant.name}</span>
          )}
        </h1>
      </div>

      {/* Grid с карточками информации */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Карточка 1: Загальна інформація (Interactive Client Form) */}
        <GeneralInfoForm tenant={tenant} />

        {/* Карточка 2: Брендинг (Interactive Client Form) */}
        <BrandingForm tenant={tenant} />

        {/* Карточка 3: Підписка та Ліміти (Interactive Client Form) */}
        <SubscriptionForm tenant={tenant} />

      </div>
    </div>
  );
}
