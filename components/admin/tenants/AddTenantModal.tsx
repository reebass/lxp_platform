"use client";

import React, { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/Dialog';
import { Plus, Loader2, Building2 } from 'lucide-react';
import { createTenant } from '@/app/actions/tenant';
import { dict } from '@/lib/i18n/dictionaries';

// Компонент-атом для кнопки подтверждения, использующий useFormStatus().
// Он автоматически подписывается на жизненный цикл родительской <form> 
// и извлекает стейт `pending` (загрузка) при вызове серверного Action.
function SubmitButton() {
  const { pending } = useFormStatus();
  const t = dict.uk.admin.tenantsPage.addModal;

  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> {t.creating}</> : t.create}
    </Button>
  );
}

export const AddTenantModal = () => {
  // Контролируемый стейт диалога. Нужен для программного закрытия после успешного сабмита.
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const t = dict.uk.admin.tenantsPage.addModal;
  const d = dict.uk.admin.tenantsPage;

  // Обработчик смены стейта открытия — сбрасываем ошибку при любом закрытии.
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setErrorMsg(null);
  }

  // Перехватываем сабмит формы: проводим клиентскую валидацию,
  // вызываем Server Action и на основе ответа либо показываем ошибку, либо закрываем диалог.
  async function clientAction(formData: FormData) {
    const name = formData.get('name') as string;
    if (!name || name.trim() === '') {
      setErrorMsg(t.errorEmptyName);
      return;
    }

    setErrorMsg(null);
    const result = await createTenant(formData);

    if (result?.error) {
      setErrorMsg(result.error);
    } else if (result?.success) {
      setOpen(false); // Закрываем диалог — Dialog сам анимирует исчезновение
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="primary" className="flex items-center text-sm px-6 w-full md:w-auto">
          <Plus className="mr-2" size={20} />
          {d.addBtn}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {t.newTenant}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-md text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <form action={clientAction} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                {t.companyName}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 bg-background border border-graphite rounded-md text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder={t.enterName}
                onChange={() => setErrorMsg(null)}
              />
            </div>

            {/* Поля subdomain та corporate_domain мають точно відповідати колонкам БД,
                щоб Server Action міг коректно їх витягнути з FormData. */}
            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-muted-foreground mb-1">
                {t.subdomainLabel}
              </label>
              <input
                type="text"
                id="subdomain"
                name="subdomain"
                className="w-full px-4 py-3 bg-background border border-graphite rounded-md text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder={t.subdomainPlaceholder}
                onChange={() => setErrorMsg(null)}
              />
            </div>

            <div>
              <label htmlFor="corporate_domain" className="block text-sm font-medium text-muted-foreground mb-1">
                {t.domainLabel}
              </label>
              <input
                type="text"
                id="corporate_domain"
                name="corporate_domain"
                className="w-full px-4 py-3 bg-background border border-graphite rounded-md text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder={t.domainPlaceholder}
                onChange={() => setErrorMsg(null)}
              />
            </div>

            <div className="flex gap-8Phase 3: Dynamic Storage Limits for Tenants.

1. Super Admin UI (SubscriptionCard):

Update the SubscriptionCard (or tenant settings component) in the Super Admin dashboard.

Add a UI element to display and edit the new storage_limit_mb field from the tenants table. Allow the super admin to update this value (e.g., input field for MB or a dropdown for 1GB, 5GB, 10GB).

Add a global stat somewhere on the Super Admin dashboard showing total DB storage used across ALL tenants.

2. Data Hub UI (DocumentTable footer):

Fetch the tenant.storage_limit_mb in the Server Component and pass it down.

Update the footer of DocumentTable.tsx so the progress bar and text calculate usage against the specific tenant.storage_limit_mb (convert MB to formatted KB/MB/GB dynamically) instead of a hardcoded 1GB. justify-center pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Скасувати
                </Button>
              </DialogClose>
              <SubmitButton />
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
