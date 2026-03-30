// components/ui/Card.tsx
import React, { HTMLAttributes } from 'react';

// Atomic Design: Атом / Молекула (Контейнер).
// Этот универсальный контейнер (Card) инкапсулирует в себе базовую "коробку":
// белый фон, скругленные углы, графитовую рамку (graphite border) и отступы. 
// За счет вынесения этих стилей в компонент мы избегаем многократного дублирования 
// одинаковых Tailwind-классов (bg-white rounded-xl border-graphite и т.д.) по всему проекту.

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  // Контент, который будет помещен внутрь карточки
  children: React.ReactNode;
  // Позволяем комбинировать стандартные стили карточки с внешними (например flex, h-full)
  className?: string; 
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-neutral rounded-xl border border-graphite p-6 shadow-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] text-foreground ${className}`}
      {...props}
    >
      {/* Отрисовываем любой вложенный React-контент (children) */}
      {children}
    </div>
  );
};
