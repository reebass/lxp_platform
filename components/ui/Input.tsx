// components/ui/Input.tsx
import React, { InputHTMLAttributes, ReactNode } from 'react';

// Atomic Design: Атом / Молекула.
// Поле ввода — это базовый строительный блок (атом).
// Однако, так как мы комбинируем HTML <input> с иконкой (lucide-react) в одной обертке,
// это можно считать простейшей молекулой. 
// Смысл в том, чтобы вынести сложную логику позиционирования иконки (через absolute/relative) 
// и стилизацию фокуса/границ в отдельный компонент. Теперь любая форма в проекте
// будет выглядеть одинаково и не потребует дублирования 20-30 строк кода.

// Расширяем стандартные свойства HTML-инпута, чтобы принимать value, onChange, placeholder, type и т.д.
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Опциональная иконка слева
  icon?: ReactNode;
  // Опциональный элемент справа (например, кнопка показа пароля)
  rightElement?: ReactNode;
  // Состояния валидации для Cyberpunk свечения
  isInvalid?: boolean;
  isValid?: boolean;
}

export const Input: React.FC<InputProps> = ({
  icon,
  rightElement,
  isInvalid,
  isValid,
  className = '',
  ...props
}) => {
  // Определяем цвет границы и свечения(ring) в зависимости от валидации
  let validationClasses = "border-graphite focus:ring-accent focus:border-accent text-foreground";
  if (isInvalid) {
    validationClasses = "border-error focus:ring-error focus:border-error text-error shadow-[0_0_8px_var(--error)]";
  } else if (isValid) {
    validationClasses = "border-success focus:ring-success focus:border-success text-success shadow-[0_0_8px_var(--success)]";
  }

  return (
    <div className="relative">
      {/* Левая иконка */}
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {/* Цвет иконки зависит от состояния валидации:
              - ошибка: красный (--error)
              - успех: зелёный (--success)
              - нейтраль: text-muted-foreground (--muted-foreground) — семантическая переменная
                вместо хардкода text-gray-400, чтобы поддерживалась Theme overrides на уровне тенанта */}
          <span className={`${isInvalid ? 'text-error' : isValid ? 'text-success' : 'text-muted-foreground'} [&>svg]:w-5 [&>svg]:h-5 transition-colors`}>
            {icon}
          </span>
        </div>
      )}

      {/* Сам инпут */}
      <input
        className={`
          block w-full py-3 rounded-md bg-[hsl(var(--background-content))]
          border focus:outline-none focus:ring-1 transition-all duration-300
          ${icon ? 'pl-10' : 'pl-3'}
          ${rightElement ? 'pr-12' : 'pr-3'}
          ${validationClasses}
          ${className}
        `}
        {...props}
      />

      {/* Правый элемент (например, кнопка видимости пароля) */}
      {rightElement && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  );
};
