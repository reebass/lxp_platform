// components/ui/Button.tsx
import React, { ButtonHTMLAttributes } from 'react';

// Atomic Design: Атом.
// Этот компонент инкапсулирует базовую HTML кнопку (<button>). 
// Вместо того, чтобы каждый раз заново писать длинные классы Tailwind (отступы, цвета, ховер-эффекты),
// мы создаем один переиспользуемый "атом". Если в будущем мы решим изменить оттенок синего 
// или радиус скругления кнопок во всем приложении, мы изменим это только в одном месте — здесь.
// Это делает код чище (DRY - Don't Repeat Yourself) и более масштабируемым.

// Ограниченная 2-вариантная дизайн-система.
// Используем строго 'primary' (заливка) и 'outline' (обводка), чтобы избежать
// разрастания кода и поддерживать строгий Atomic Design по макету Cyberpunk.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 focus:outline-none disabled:pointer-events-none disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-800 px-4 py-2 cursor-pointer";

  // Мы используем shadow-primary вместе с hover:shadow-[0_0_15px],
  // чтобы свечение всегда принимало неоновый акцентный цвет (primary),
  // иначе currentColor унаследует черный цвет текста кнопки и эффекта не будет.
  const primaryStyles = "bg-primary text-background border border-transparent hover:shadow-[0_0_15px] hover:shadow-primary active:shadow-[0_0_15px] active:shadow-primary";

  const outlineStyles = "bg-transparent border border-primary text-primary hover:bg-primary hover:text-background active:bg-primary active:text-background";

  const variantStyles = variant === 'primary' ? primaryStyles : outlineStyles;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {/* Отрисовываем содержимое, переданное внутрь тега кнопки (например, текст "Sign In") */}
      {children}
    </button>
  );
};
