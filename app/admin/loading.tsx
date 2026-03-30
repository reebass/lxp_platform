import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="h-full w-full min-h-[50vh] bg-transparent flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
      <p className="text-muted-foreground animate-pulse text-sm">
        {/* UX: Локальный индикатор загрузки для админ-панели */}
        Завантаження даних панелі...
      </p>
    </div>
  );
}
