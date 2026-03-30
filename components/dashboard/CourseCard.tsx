// components/dashboard/CourseCard.tsx
import React from 'react';

// Импортируем абстрактные UI компоненты
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Импортируем словарь i18n
import { dict } from '@/lib/i18n/dictionaries';

// Atomic Design: Организм.
// Заменяем все жестко прописанные тексты курса (название, описание, прогресс, кнопка) 
// на значения из объекта словаря (dict.uk).

export const CourseCard: React.FC = () => {
  // Выбираем переводы для карточки курса на украинском языке
  const t = dict.uk.dashboard.course;

  return (
    <Card className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div>
        {/* Используем text-foreground или text-primary для темной темы */}
        <h3 className="text-xl font-semibold text-foreground mb-2">{t.title}</h3>
        <p className="text-muted-foreground text-sm mb-6">
          {t.description}
        </p>
        
        <div className="mb-6">
          <div className="flex justify-between text-xs text-foreground mb-2">
            <span className="font-medium">{t.progressInfo}</span>
            <span className="text-primary font-semibold">45%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-accent h-full rounded-full w-[45%]"></div>
          </div>
        </div>
      </div>
      
      <Button variant="outline" type="button">
        {t.continueBtn}
      </Button>
    </Card>
  );
};
