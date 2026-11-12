// Размеры картинки БЕЗ пометки «оригинал используется в коде».
//
// Astro оборачивает ImageMetadata (то, что отдаёт `import photo from './photo.png'`) в Proxy. Любое чтение свойства
// (`meta.width`, `meta.height`) помечает файл как «упомянутый вне обработки изображений» — и тогда на сборке Astro НЕ удаляет
// исходный оригинал из dist/_astro, хотя на страницах используется только оптимизированный WebP. Так на сайт уезжали
// 3–9-мегабайтные PNG, которые никто не запрашивает.
//
// Свойство `clone` Proxy обрабатывает отдельно (структурная копия без пометки) — через него и читаем размеры.
// Если Proxy нет (dev-режим/SSR), `clone` не определён, и мы берём сами метаданные.
import type { ImageMetadata } from 'astro';

export function imageSize(src: ImageMetadata): { width: number; height: number } {
  const meta = (src as ImageMetadata & { clone?: ImageMetadata }).clone ?? src;
  return { width: meta.width, height: meta.height };
}

// Соотношение сторон строкой для CSS-переменной --r (aspect-ratio).
export function aspectRatio(src: ImageMetadata): string {
  const { width, height } = imageSize(src);
  return (width / height).toFixed(4);
}
