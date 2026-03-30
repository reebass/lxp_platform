import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from '@/components/auth/LoginForm';

// Сторінка-ресивер (Server Component) підтримує динамічну маршутизацію tenant subdomains.
// CSS-змінні бренду тенанта вже ін'єктовані layout.tsx, тому тут лише рендеримо UI.
export default async function TenantPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  // У Next.js 15 `params` є промісом, який потрібно await
  const resolvedParams = await params;

  // Очищаємо домен від суфіксу .localhost для локальної розробки
  const rawDomain = decodeURIComponent(resolvedParams.domain);
  const cleanDomain = rawDomain.replace('.localhost', '');

  // --- DOMAIN DEBUG ---
  console.log('--- DOMAIN DEBUG ---');
  console.log('Raw Domain from URL:', rawDomain);
  console.log('Cleaned Domain for DB:', cleanDomain);

  const supabase = await createClient();

  // Завантажуємо тенанта для відображення логотипу та назви
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('name, logo_url')
    .or(`subdomain.eq."${cleanDomain}",corporate_domain.eq."${cleanDomain}"`)
    .single();

  if (error) {
    console.error('Supabase Fetch Error:', error);
  }

  if (error || !tenant) {
    notFound();
  }

  return (
    // Центруємо контент форми входу по вертикалі і горизонталі.
    // Колірна тема вже застосована батьківським layout.tsx через CSS-змінні.
    <div className="flex flex-col items-center justify-center flex-1 p-8 transition-colors duration-500">
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
