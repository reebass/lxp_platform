import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatInterface } from './_components/ChatInterface';
import { dict } from '@/lib/i18n/dictionaries';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;

  // Очищаємо домен від суфіксу .localhost для локальної розробки
  const rawDomain = decodeURIComponent(resolvedParams.domain);
  const cleanDomain = rawDomain.replace('.localhost', '');

  const supabase = await createClient();

  // Завантажуємо id тенанта за доменом
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id')
    .or(`subdomain.eq."${cleanDomain}",corporate_domain.eq."${cleanDomain}"`)
    .maybeSingle();

  if (error || !tenant) {
    notFound();
  }

  const d = dict.uk.chat;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{d.pageTitle}</h1>
        <p className="text-muted-foreground mt-1">
          {d.pageSubtitle}
        </p>
      </div>

      <ChatInterface tenantId={tenant.id} />
    </div>
  );
}
