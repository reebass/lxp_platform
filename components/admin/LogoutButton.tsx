"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface LogoutButtonProps {
  label: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ label }) => {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    // Выход из системы с использованием Supabase Client.
    // Метод signOut() удаляет текущую сессию пользователя (очищает куки/локальное хранилище).
    await supabase.auth.signOut();

    // Перенаправляем пользователя на главную страницу (страницу логина)
    router.push('/');

    // Вызываем router.refresh(), чтобы Next.js принудительно обновил состояние серверных компонентов,
    // тем самым применяя состояние "без сессии" ко всему приложению.
    router.refresh();
  };

  return (
    <div className="w-32">
      <Button variant="outline" onClick={handleLogout} className="w-full">
        {label}
      </Button>
    </div>
  );
};
