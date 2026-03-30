import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Используем обёртку hsl(var(--token)) — это стандартный подход Shadcn/Tailwind
        // для поддержки raw-HSL переменных (например, --primary: 184 100% 50%).
        // Без обёртки Tailwind генерирует background-color: 184 100% 50% — невалидный CSS.
        // С обёрткой: background-color: hsl(var(--primary)) → hsl(184 100% 50%) ✓
        // Также это позволяет работать модификаторам прозрачности: bg-primary/50 ✓
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--background-content))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        primary: 'hsl(var(--primary))',
        border: 'hsl(var(--border))',
        error: 'hsl(var(--error))',
        success: 'hsl(var(--success))',
        content: 'hsl(var(--background-content))',
        /* Сохраняем старые имена для обратной совместимости, направляя их на новые переменные */
        accent: 'hsl(var(--primary))',
        graphite: 'hsl(var(--border))',
        neutral: 'hsl(var(--background))',
      },
    },
  },
  plugins: [],
} satisfies Config;
