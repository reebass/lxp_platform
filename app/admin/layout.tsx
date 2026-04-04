import React from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { MobileNav } from '@/components/admin/MobileNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GamifiedError } from '@/components/ui/GamifiedError';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { dict } from '@/lib/i18n/dictionaries';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Инициализируем клиента. Внутри используется обязательный для Next.js 15
  // асинхронный вызов await cookies() перед передачей стейта в Supabase.
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Детальное логирование авторизации пользователя (Debug)
  console.log("[ADMIN GUARD] User:", user?.id, "Error:", userError);

  if (userError || !user) {
    console.log("[ADMIN GUARD] No user found, redirecting...");
    redirect('/');
  }

  // Принудительно проверяем роль (Profile Guard). Извлекаем явную роль.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Детальное логирование профиля из базы данных (Debug)
  console.log("[ADMIN GUARD] Profile:", profile, "Error:", profileError);

  if (profile?.role !== 'superadmin') {
    console.log("[ADMIN GUARD] Role is not superadmin, rendering GamifiedError 403...");

    // Используем DRY-компонент GamifiedError для отрисовки состояния 403 Forbidden.
    // Это сохраняет пользователя в системе и мягко возвращает на его законный дашборд.
    const t = dict.uk.admin.error403;
    return (
      <GamifiedError
        imageSrc="/images/403_picture.png"
        title={<>{t.title}<br />{t.titleLine2}</>}
        subtitle={t.subtitle}
        buttonText={t.backBtn}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Смарт-сайдбар (w-16 в свернутом, w-64 в развернутом виде) */}
      <Sidebar />
      <MobileNav />

      {/* Контейнер для правой части экрана. Больше нет жесткого отступа pl-16.
          Sidebar находится в нормальном потоке документа (flex) и сам отталкивает этот контейнер.
          Для мобилок добавляем pb-20 (padding-bottom), чтобы нижняя панель навигации не перекрывала контент. */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 pb-16 md:pb-0">
        {/* Шапка административной панели */}
        <AdminHeader />

        {/* children — это текущая активная страница */}
        <main className="flex-1 p-8 bg-content relative z-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
