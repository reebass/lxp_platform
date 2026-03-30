"use client";

import React, { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';
import { createTenant } from '@/app/actions/tenant';

// Компонент-атом для кнопки подтверждения, использующий useFormStatus().
// Он автоматически подписывается на жизненный цикл родительской <form> 
// и извлекает стейт `pending` (загрузка) при вызове серверного Action.
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Створення...</> : 'Створити'}
      </Button>
    </div>
  );
}

export const AddTenantModal = () => {
  // Локальный стейт управления модальным окном (Client State).
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UX Improvement: Закрытие модального окна по клавише Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setErrorMsg(null); // Очищаем ошибку при закрытии
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Обработчик Action. Мы перехватываем стандартный Submit, чтобы 
  // прочитать ответ от Server Action и на основе него либо закрыть окно, либо выдать ошибку.
  async function clientAction(formData: FormData) {
    // CLIENT VALIDATION: Запобігаємо зайвим запитам до сервера
    const name = formData.get('name') as string;
    if (!name || name.trim() === '') {
      setErrorMsg('Будь ласка, введіть назву компанії.');
      return; // Важливо: перериваємо виконання до серверного клічу!
    }

    setErrorMsg(null);
    const result = await createTenant(formData);

    if (result?.error) {
      setErrorMsg(result.error);
    } else if (result?.success) {
      setIsOpen(false);
    }
  }

  return (
    <>
      <Button variant="primary" className="flex items-center text-sm px-6 w-full md:w-auto" onClick={() => setIsOpen(true)}>
        <Plus className="mr-2" size={20} />
        Додати клієнта
      </Button>

      {/* Оверлей-модалка. UX: onClick={onClose} для закрытия по клику на фон */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => {
            setIsOpen(false);
            setErrorMsg(null); // Очищаем ошибку при клике на фон
          }}
        >
          {/* UX: e.stopPropagation() предотвращает закрытие при клике внутри модалки */}
          <div 
            className="bg-content border border-border rounded-xl p-6 w-full max-w-md shadow-[0_0_30px_rgba(0,0,0,0.8)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Новий клієнт</h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md text-red-500 text-sm">
                {errorMsg}
              </div>
            )}

            <form action={clientAction} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                  Назва компанії *
                </label>
                {/* Инпуты с Cyberpunk-стилем: темный фон, светлый текст, неоновая обводка при фокусе */}
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-background border border-graphite rounded-md text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="Введіть назву"
                  onChange={() => setErrorMsg(null)}
                />
              </div>

              {/* Поля "Сабдомен" и "Корпоративный домен" должны строго совпадать по атрибуту name 
                  со схемой БД (subdomain, corporate_domain), чтобы Server Action мог корректно их извлечь. */}
              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-muted-foreground mb-1">
                  Сабдомен платформи (необов'язково)
                </label>
                <input
                  type="text"
                  id="subdomain"
                  name="subdomain"
                  className="w-full px-4 py-3 bg-background border border-graphite rounded-md text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="наприклад: novus"
                  onChange={() => setErrorMsg(null)}
                />
              </div>

              <div>
                <label htmlFor="corporate_domain" className="block text-sm font-medium text-muted-foreground mb-1">
                  Корпоративний домен пошти (необов'язково)
                </label>
                <input
                  type="text"
                  id="corporate_domain"
                  name="corporate_domain"
                  className="w-full px-4 py-3 bg-background border border-graphite rounded-md text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="наприклад: novus.ua"
                  onChange={() => setErrorMsg(null)}
                />
              </div>

              <div className="flex gap-9 justify-center mt-8">
                <div>
                  <Button type="button" variant="outline" onClick={() => { setIsOpen(false); setErrorMsg(null); }}>
                    Скасувати
                  </Button>
                </div>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
