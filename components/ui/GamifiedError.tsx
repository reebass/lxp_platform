"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { dict } from '@/lib/i18n/dictionaries';

// Atomic Design: Організм (Organism).
// Дотримуємося принципу DRY (Don't Repeat Yourself), створюючи єдиний 
// універсальний компонент екрану помилки (Error Screen), 
// який отримує унікальний контент через строго типізовані Props.
export interface GamifiedErrorProps {
  // Меняем тип title c 'string' на 'React.ReactNode'.
  // Это позволяет передавать полноценные JSX-компоненты (включая <br />), 
  // давая нам жесткий контроль над принудительным переносом строк в заголовках.
  title: React.ReactNode;
  subtitle: string;
  imageSrc: string;
  buttonText: string;
  buttonHref?: string; // Опционально, теперь используем router.back() как основной сценарий
}

export const GamifiedError: React.FC<GamifiedErrorProps> = ({
  title,
  subtitle,
  imageSrc,
  buttonText,
}) => {
  const router = useRouter();
  const t = dict.uk.common;

  return (
    // ИЗОЛЯЦИЯ ТЕМЫ: страницы 403/404 ВСЕГДА должны отображаться в базовой Cyberpunk-палитре,
    // невзирая на любые динамические <style> инъекции CSS-переменных тенанта.
    // Поэтому мы используем хардкодированные произвольные значения Tailwind (arbitrary values),
    // а НЕ семантические классы (bg-background, text-primary, text-muted-foreground),
    // которые были бы переопределены через :root тенанта.
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-[#111111] p-6 md:p-12 gap-6 md:gap-[80px]">
      {/* 
        Используем произвольное значение gap-[80px] для фиксации ровно 80 пикселей между 
        двумя колонками на десктопе, обеспечивая жесткий отступ.
        Используем концепцию mobile-first: базовые классы предназначены для мобильных экранов. 
      */}
      {/* Ліва колонка: Ілюстрація помилки */}
      {/* 
        Специальное сужение под мобилки: картинка займет не более 75% экрана (w-3/4) и не превысит 280px.
        На планшетах и десктопах (md:) жесткий предел увеличивается до 500px.
      */}
      <img
        src={imageSrc}
        alt={t.errorIllustration}
        className="w-3/4 max-w-[280px] md:w-full md:max-w-[500px] h-auto object-contain animate-fade-in"
      />

      {/* Права колонка: Інформаційний текст і кнопка повернення */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2 md:space-y-4 max-w-2xl">
        {/* Адаптивная типографика (mobile-first): стартуем с 2xl и увеличиваем до 5xl на мониторах */}
        {/* Хардкодированный цвет #00f0ff вместо text-primary — тема тенанта не должна менять цвет заголовка */}
        <h1 className="font-bold text-xl md:text-3xl lg:text-4xl text-[#00f0ff] drop-shadow-md leading-tight">
          {title}
        </h1>
        {/* Хардкодированный цвет #9ca3af вместо text-muted-foreground — фиксируем цвет подзаголовка */}
        <p className="text-xs md:text-lg text-[#9ca3af] max-w-sm md:max-w-md">
          {subtitle}
        </p>
        <div className="w-full md:w-auto mt-4">
          {/* 
            ФИКС UX: Вместо жесткого Link на дашборд используем router.back().
            Это позволяет пользователю вернуться на ту страницу, на которой он был ранее,
            сохраняя контекст его работы или обучения.
          */}
          <Button
            variant="primary"
            className="w-full md:w-auto text-lg px-8 py-3"
            onClick={() => router.back()}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
