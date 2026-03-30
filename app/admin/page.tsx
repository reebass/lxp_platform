import React from 'react';
import { Card } from '@/components/ui/Card';
import { dict } from '@/lib/i18n/dictionaries';

// Server Component (по умолчанию в Next.js App Router).
// Рендерится один раз на сервере и отправляет клиенту готовый HTML.
export default function AdminPage() {
  const d = dict.uk.admin;

  return (
    <div className="max-w-4xl max-w-full">
      <Card>
        <h2 className="text-2xl font-semibold text-foreground mb-2">{d.welcome}</h2>
        {/* Адаптивный текст-подсказка. 
            hidden md:block показывает текст только на планшетах и десктопах. 
            block md:hidden показывает текст только на мобильных экранах (до breakpoint md). */}
        <p className="text-muted-foreground hidden md:block">
          {d.desktop_hint}
        </p>
        <p className="text-muted-foreground block md:hidden">
          {d.mobile_hint}
        </p>
      </Card>
    </div>
  );
}
