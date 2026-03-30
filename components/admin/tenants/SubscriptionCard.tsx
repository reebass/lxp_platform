import React from 'react';
import { Card } from '@/components/ui/Card';
import { CreditCard } from 'lucide-react';

// Atomic Design: Изолируем логику подготовки данных подписки (Subscription data) внутри компонента.
// Страница не должна знать дефолтные значения статуса или плана, это зона ответственности карточки подписки.
export function SubscriptionCard({ tenant }: { tenant: any }) {
  const plan = tenant.plan || 'Free';
  const status = tenant.status || 'Active';
  const maxUsers = tenant.max_users || 'Безліміт';

  return (
    <Card className="h-full border border-border bg-content overflow-hidden relative group hover:border-primary/50 transition-colors">
      <div className="absolute left-0 top-0 h-full w-1 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
        <CreditCard className="mr-3" size={24} />
        Підписка та Ліміти
      </h3>
      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center bg-primary/5 p-2 rounded-md border border-primary/20">
          <span className="text-primary font-medium">Статус:</span>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
            <span className="text-foreground font-semibold">{status}</span>
          </div>
        </div>
        <div className="w-full h-px bg-graphite my-2"></div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Поточний План:</span>
          <span className="text-foreground font-bold">{plan}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Ліміт Користувачів:</span>
          <span className="text-foreground">{maxUsers}</span>
        </div>
      </div>
    </Card>
  );
}
