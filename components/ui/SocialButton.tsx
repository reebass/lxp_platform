// components/ui/SocialButton.tsx
import React, { ButtonHTMLAttributes, ReactNode } from 'react';

// Atomic Design: Атом / Молекула.
// Это специализирования кнопка для социальных сетей (OAuth). 
// В отличие от обычного Button, здесь жестко зафиксирован внешний вид (белый фон, серая рамка, иконка + текст),
// что соответствует требованиям дизайна для входа через сторонние сервисы.
// Вынесение этого кода позволяет легко добавить новые соцсети (например, GitHub или Apple) 
// просто передав новую иконку и текст, без дублирования HTML/Tailwind кода.

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Иконка (SVG) социальной сети
  icon: ReactNode;
  // Текст кнопки (например, "Google" или "Microsoft")
  text: string;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ icon, text, ...props }) => {
  return (
    <button 
      type="button" 
      className="flex justify-center items-center px-4 py-2.5 border border-graphite shadow-[0_0_8px_rgba(0,0,0,0.5)] text-sm font-medium rounded-md text-foreground bg-background hover:bg-opacity-80 transition-all hover:shadow-[0_0_10px_var(--border)] w-full"
      {...props}
    >
      {/* Контейнер для SVG иконки с отступом справа */}
      <span className="mr-3 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </span>
      {/* Текст внутри кнопки */}
      {text}
    </button>
  );
};
