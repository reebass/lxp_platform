"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Library, CreditCard, ChevronUp, ChevronDown, X } from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';

// Мобильная панель навигации (Client Component).
// Разработана специально для мобильных устройств, скрывается на десктопе (md:hidden).
export const MobileNav = () => {
  const d = dict.uk.admin.sidebar;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Фиксированный нижний бар (TabBar) для мобилок. 
          Используем чистый bg-background и shadow-none вместо backdrop-blur, 
          чтобы предотвратить баг (spillover) визуального размытия поверх границы. 
          Родительский контейнер должен быть relative. */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background border-t border-border shadow-none z-50 flex justify-around items-center h-16">
        <Link href="/admin/tenants" className="p-2 text-primary transition-colors active:text-foreground/60 transition-colors duration-200">
          <Users size={28} />
        </Link>
        <Link href="/admin/library" className="p-2 text-primary transition-colors active:text-foreground/60 transition-colors duration-200">
          <Library size={28} />
        </Link>
        <Link href="/admin/billing" className="p-2 text-primary transition-colors active:text-foreground/60 transition-colors duration-200">
          <CreditCard size={28} />
        </Link>

        {/* Центральная кнопка для вызова полноэкранного меню.
            Абсолютное позиционирование (absolute) вынимает её из нормального flex-потока, 
            чтобы она не сдвигала другие иконки, и располагает ровно по центру поверх рамки (-top-5). */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white absolute left-1/2 -translate-x-1/2 -top-6.5 bg-transparent border-none p-0 focus:outline-none"
        >
          {isOpen ? <ChevronDown size={32} strokeWidth={1} /> : <ChevronUp size={32} strokeWidth={1} />}
        </button>
      </nav>

      {/* Полноэкранный Overlay со слайд-анимацией (slide-up). */}
      {/* Анимация достигается за счет transition-transform и смены класса translate-y. 
          Форма всегда находится в DOM-дереве, что позволяет CSS плавно её анимировать (без жесткого условного && рендера). */}
      <div
        className={`md:hidden fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors border-none p-0 bg-transparent focus:outline-none"
        >
          <X size={32} />
        </button>

        {/* Контент: выравнивание строго сверху-слева (items-start, justify-start) для естественного порядка */}
        <div className="flex flex-col items-start justify-start pt-24 pl-8 space-y-8 h-full w-full">
          <Link onClick={() => setIsOpen(false)} href="/admin/tenants" className="group flex items-center text-foreground hover:text-white transition-colors">
            <Users size={32} className="text-primary mr-5 group-active: text-primary transition-all duration-200 group-active:drop-shadow-[0_0_8px_currentColor]" />
            <span className="text-2xl font-medium group-active: text-foreground group-active:text-primary transition-colors duration-200">{d.tenants}</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/admin/library" className="group flex items-center text-foreground hover:text-white transition-colors">
            <Library size={32} className="text-primary mr-5 group-active: text-primary transition-all duration-200 group-active:drop-shadow-[0_0_8px_currentColor]" />
            <span className="text-2xl font-medium group-active: text-foreground group-active:text-primary transition-colors duration-200">{d.library}</span>
          </Link>
          <Link onClick={() => setIsOpen(false)} href="/admin/billing" className="group flex items-center text-foreground hover:text-white transition-colors">
            <CreditCard size={32} className="text-primary mr-5 group-active: text-primary transition-all duration-200 group-active:drop-shadow-[0_0_8px_currentColor]" />
            <span className="text-2xl font-medium group-active: text-foreground group-active:text-primary transition-colors duration-200">{d.billing}</span>
          </Link>
        </div>
      </div>
    </>
  );
};
