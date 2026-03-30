"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Library, CreditCard, Pin, PinOff } from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';

// Смарт-Сайдбар: Client Component ("use client"), т.к. мы используем React State.
// В зависимости от состояния isPinned и isHovered сайдбар меняет ширину (w-16 или w-64).
export const Sidebar = () => {
  const d = dict.uk.admin.sidebar;
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Вычисляем, должен ли сайдбар быть в развернутом состоянии
  const isExpanded = isPinned || isHovered;

  return (
    // Используем sticky и shrink-0 вместо fixed, чтобы сайдбар находился в стандартном потоке flex-контейнера 
    // и естественно отталкивал основной контент без наложений и багов.
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden md:flex sticky top-0 h-screen shrink-0 bg-background/70 backdrop-blur-md border-r border-border transition-all duration-300 z-50 flex-col overflow-hidden ${isExpanded ? 'w-64' : 'w-16'}`}
    >
      <div className={`p-4 border-b border-border flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} h-20`}>
        {/* Анимация исчезновения текста при сворачивании */}
        <h2 className={`font-bold text-primary whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-full text-2xl' : 'opacity-0 max-w-0 text-[0px]'}`}>
          LXP Admin
        </h2>
        {isExpanded && (
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className="text-muted-foreground hover:text-primary transition-colors focus:outline-none ml-2"
          >
            {isPinned ? <Pin size={20} /> : <PinOff size={20} />}
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-2 flex flex-col items-center w-full">
        <Link href="/admin/tenants" className={`flex items-center w-full rounded-md hover:bg-border/30 transition-colors ${isExpanded ? 'px-4 py-3 justify-start' : 'p-3 justify-center'}`}>
          <Users size={20} className="text-primary shrink-0" />
          <span className={`ml-3 text-foreground whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
            {d.tenants}
          </span>
        </Link>
        <Link href="/admin/library" className={`flex items-center w-full rounded-md hover:bg-border/30 transition-colors ${isExpanded ? 'px-4 py-3 justify-start' : 'p-3 justify-center'}`}>
          <Library size={20} className="text-primary shrink-0" />
          <span className={`ml-3 text-foreground whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
            {d.library}
          </span>
        </Link>
        <Link href="/admin/billing" className={`flex items-center w-full rounded-md hover:bg-border/30 transition-colors ${isExpanded ? 'px-4 py-3 justify-start' : 'p-3 justify-center'}`}>
          <CreditCard size={20} className="text-primary shrink-0" />
          <span className={`ml-3 text-foreground whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
            {d.billing}
          </span>
        </Link>
      </nav>
    </aside>
  );
};
