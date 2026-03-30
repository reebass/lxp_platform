// components/ui/Alert.tsx
import React, { HTMLAttributes, ReactNode } from 'react';

// Atomic Design: Молекула.
// Компонент Alert используется для вывода системных сообщений пользователю,
// таких как ошибки валидации, ошибки сети или визуализация успешных действий.
// Это инкапсулирует в себе логику цветового оформления, обеспечивая
// единообразие системных уведомлений во всем проекте (DRY).

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  // Тип определяет визуальное оформление компонента
  type?: 'error' | 'success'; 
  children: ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  type = 'error', 
  children, 
  className = '', 
  ...props 
}) => {
  // Задаем базовые стили
  const baseStyles = "p-4 rounded-md mb-5 text-sm font-medium transition-colors";
  
  // Условное применение стилей с использованием Tailwind CSS
  const typeStyles = type === 'error' 
    ? "bg-red-50 text-red-700 border border-red-200" 
    : "bg-green-50 text-green-700 border border-green-200";

  return (
    // Добавляем атрибут role="alert" для поддержания доступности (a11y - Accessibility),
    // чтобы скринридеры (программы чтения экрана) могли правильно озвучивать ошибки.
    <div className={`${baseStyles} ${typeStyles} ${className}`} role="alert" {...props}>
      {children}
    </div>
  );
};
