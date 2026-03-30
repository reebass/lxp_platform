import React from 'react';
import { GamifiedError } from '@/components/ui/GamifiedError';

// Глобальная страница 404 (Not Found) в инфраструктуре Next.js 15
// Подхватывает любые неверные URL и выводит DRY-компонент
export default function NotFound() {
  return (
    <GamifiedError
      imageSrc="/images/404_picture.png"
      title={<>Упс, ми вас тут не чекали.<br />Тут колись жили принцеси...</>}
      subtitle="Досить вже їх шукати, вони втекли в інше місце. Натисни кнопку, щоб повернутись до навчання."
      buttonText="Повернутись назад"
    />
  );
}
