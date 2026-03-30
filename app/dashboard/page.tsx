// app/dashboard/page.tsx
import React from 'react';

// Импортируем компоненты дашборда (наши Организмы)
import { CourseCard } from '@/components/dashboard/CourseCard';

// Atomic Design: Шаблон (Template) и Страница (Page).
// Мы собираем итоговую страницу из готовых, стилизованных блоков.
// Внимание: Глобальная шапка (DashboardHeader) и внешние контейнеры
// были вынесены в layout.tsx для сохранения стейта при навигации!

export default function DashboardPage() {
  return (
    <div className="w-full mt-4">
      {/* Сетка (Grid) — отображаем карточки в несколько колонок на широких экранах */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Организм: Карточка курса (для примера выводим три одинаковых компонента) */}
        <CourseCard />
        <CourseCard />
        <CourseCard />
      </div>
    </div>
  );
}
