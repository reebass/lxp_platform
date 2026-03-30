import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground animate-pulse text-sm font-medium">
        {/* UX: Индикатор загрузки на весь экран */}
        Завантаження платформи...
      </p>
    </div>
  );
}
