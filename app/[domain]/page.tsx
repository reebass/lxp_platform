import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from '@/components/auth/LoginForm';
import { hexToHsl } from '@/lib/colors';


// Сторінка-ресивер (Server Component) підтримує динамічну маршутизацію tenant
// subdomains.
export default async function TenantPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  // У Next.js 15 `params` є промісом, який потрібно await
  const resolvedParams = await params;

  // Зчитуємо домен як рядок та очищаємо його від .localhost для локальної розробки (наприклад, novus.localhost -> novus).
  // Цим ми готуємо значення до прямого порівняння з полем `subdomain` або `corporate_domain` у БД Supabase.
  const rawDomain = decodeURIComponent(resolvedParams.domain);
  const cleanDomain = rawDomain.replace('.localhost', '');

  // --- DOMAIN DEBUG ---
  // Логування для відладки в терміналі сервера, щоб бачити, який саме домен прийшов і що ми шукаємо в БД.
  console.log('--- DOMAIN DEBUG ---');
  console.log('Raw Domain from URL:', rawDomain);
  console.log('Cleaned Domain for DB:', cleanDomain);

  // Тільки безпечні операції читання.
  const supabase = await createClient();

  // Використовуємо .or() щоб підтримати як стандартні сабдомени порталу (напр. edu.novus.ua), 
  // так і корпоративні домени (напр. корпоративні e-mail домени, якщо це бізнес-логіка).
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .or(`subdomain.eq."${cleanDomain}",corporate_domain.eq."${cleanDomain}"`)
    .single();

  // Якщо виникла помилка при запиті до Supabase (наприклад, проблеми з RLS або невірний запит), логуємо її.
  if (error) {
    console.error('Supabase Fetch Error:', error);
  }

  // 404 Behavior: Якщо тенант не знайдений або виникла помилка, Next.js
  // підхопить це і відрендерить нашу GamifiedError екрану "Упс...".
  if (error || !tenant) {
    notFound();
  }

  // Динамічна ін'єкція CSS-змінних
  // Ми використовуємо Strict Mapping, як визначено в globals.css і вимогах.
  const dynamicStyles: Record<string, string> = {};

  // Функція для полегшеного призначення: якщо колір з БД існує, перетворити і призначити у словник.
  const assignColor = (cssVar: string, dbHexValue: string | null) => {
    if (dbHexValue) {
      dynamicStyles[cssVar] = hexToHsl(dbHexValue);
    }
  };

  // Жорсткий маппінг полів бази даних на CSS-змінні.
  // Page BG (color_content)        -> --background
  // Card BG (color_background)     -> --background-content
  // Foreground (color_foreground)   -> --foreground
  // Muted Text (color_muted)       -> --muted-foreground 
  // Primary (color_primary)        -> --primary
  // Border (color_border)          -> --border
  assignColor('--background', tenant.color_content);
  assignColor('--background-content', tenant.color_background);
  assignColor('--foreground', tenant.color_foreground);
  assignColor('--muted-foreground', tenant.color_muted_foreground);
  assignColor('--primary', tenant.color_primary);
  assignColor('--border', tenant.color_border);

  return (
    // Інжектований style-об'єкт застосує HSL-кольори бренду тенанта на весь DOM-дерево.
    // Завдяки CSS-каскаду, токени (var(--primary) тощо) з globals.css будуть перекриті,
    // і всі Tailwind класи (bg-primary, text-muted-foreground) автоматично підлаштуються.
    <div
      className="min-h-screen bg-background-content text-foreground flex flex-col items-center justify-center p-8 transition-colors duration-500"
      style={dynamicStyles as React.CSSProperties}
    >
      {/* Логотип тенанта */}
      {tenant.logo_url && (
        <img
          src={tenant.logo_url}
          alt={`Логотип ${tenant.name}`}
          className="h-12 w-auto object-contain mb-2"
        />
      )}

      {/* Тег-лайн платформи */}
      <p className="text-lg text-muted-foreground mb-8">
        здобувай нові скіли з власним AI коучем
      </p>

      {/* Форма входу в режимі тенанта: без соціальних кнопок і реєстрації */}
      <LoginForm isTenantMode={true} />
    </div>
  );
}
