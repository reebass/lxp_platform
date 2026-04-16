import React from 'react';
import { Card } from '@/components/ui/Card';
import { dict } from '@/lib/i18n/dictionaries';

export default function TenantAdminPage() {
  const d = dict.uk.tenant_admin;

  return (
    <div className="max-w-4xl w-full p-8">
      <Card>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {d.welcome_title}
        </h2>
        <p className="text-muted-foreground">
          {d.welcome_subtitle}
        </p>
      </Card>
    </div>
  );
}
