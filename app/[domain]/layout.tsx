import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hexToHsl } from '@/lib/colors';
import React from 'react';

// Layout-компонент для всіх сторінок під субдоменом тенанта.
// Відповідає за завантаження бренду тенанта та ін'єкцію CSS-змінних у DOM,
// щоб всі дочірні сторінки автоматично успадковували правильну палітру кольорів.
export default async function DomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  // У Next.js 15 `params` є промісом — обов'язково await
  const resolvedParams = await params;

  // Очищаємо домен від суфіксу .localhost для локальної розробки
  const rawDomain = decodeURIComponent(resolvedParams.domain);
  const cleanDomain = rawDomain.replace('.localhost', '');

  const supabase = await createClient();

  // Завантажуємо тенанта за субдоменом або корпоративним доменом
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('color_content, color_background, color_foreground, color_muted_foreground, color_primary, color_border')
    .or(`subdomain.eq."${cleanDomain}",corporate_domain.eq."${cleanDomain}"`)
    .single();

  // Якщо тенант не знайдений — повертаємо 404
  if (error || !tenant) {
    notFound();
  }

  // Динамічна ін'єкція CSS-змінних бренду тенанта.
  // hexToHsl повертає рядок виду "H S% L%" (без hsl() обгортки),
  // що є обов'язковим для коректної роботи Tailwind opacity utilities.
  const dynamicStyles: Record<string, string> = {};

  const assignColor = (cssVar: string, dbHexValue: string | null) => {
    if (dbHexValue) {
      dynamicStyles[cssVar] = hexToHsl(dbHexValue);
    }
  };

  // Жорсткий маппінг: поле БД -> CSS-змінна
  assignColor('--background', tenant.color_content);
  assignColor('--background-content', tenant.color_background);
  assignColor('--foreground', tenant.color_foreground);
  assignColor('--muted-foreground', tenant.color_muted_foreground);
  assignColor('--primary', tenant.color_primary);
  assignColor('--border', tenant.color_border);

  return (
    // Застосовуємо CSS-змінні бренду тенанта до кореневого контейнера.
    // Завдяки CSS-каскаду усі дочірні елементи (var(--primary) тощо) автоматично
    // отримають правильні кольори без будь-яких додаткових налаштувань.
    <div
      style={dynamicStyles as React.CSSProperties}
      className="min-h-screen bg-background-content text-foreground flex flex-col"
    >
      {children}
    </div>
  );
}
