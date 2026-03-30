/**
 * Конвертує HEX-код кольору у сирі HSL-значення (space-separated).
 * Tailwind CSS (особливо v4 або v3 з підтримкою opacity через змінні) 
 * очікує саме такий формат: "H S% L%".
 */
export function hexToHsl(hex: string): string {
  // Видаляємо решітку, якщо вона є
  hex = hex.replace(/^#/, '');

  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  } else {
    // Якщо це вже не HEX, повертаємо як є
    return hex;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  const hDegree = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  // Повертаємо тільки сирі значення (space-separated), БЕЗ обгортки hsl().
  return `${hDegree} ${sPercent}% ${lPercent}%`;
}
