"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Blocks, Pin, PinOff } from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';

// Tenant Admin Sidebar — mirrors the Super Admin Sidebar pattern.
// Links use standard paths (e.g. /admin/data-hub) because the middleware
// handles subdomain → [domain] rewriting automatically.
export const TenantSidebar = () => {
  const d = dict.uk.tenant_admin;
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  const links = [
    { href: '/admin/data-hub', label: d.sidebar_data_hub, icon: Database },
    { href: '/admin/course-builder', label: d.sidebar_course_builder, icon: Blocks },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`hidden md:flex sticky top-0 h-screen shrink-0 bg-background/70 backdrop-blur-md border-r border-border transition-all duration-300 z-50 flex-col overflow-hidden ${isExpanded ? 'w-64' : 'w-16'}`}
    >
      <div className={`p-4 border-b border-border flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} h-20`}>
        <h2 className={`font-bold text-primary whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-full text-2xl' : 'opacity-0 max-w-0 text-[0px]'}`}>
          Admin
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
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center w-full rounded-md transition-colors ${isExpanded ? 'px-4 py-3 justify-start' : 'p-3 justify-center'} ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-border/30 text-foreground'}`}
            >
              <Icon size={20} className="shrink-0 text-primary" />
              <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {label}
              </span>
              {/* Active indicator bar (visible when sidebar is collapsed) */}
              {isActive && !isExpanded && (
                <span className="absolute left-1 w-1 h-6 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
