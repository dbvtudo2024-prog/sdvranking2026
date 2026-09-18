import { useEffect, useRef } from 'react';

/**
 * Hook para rolagem horizontal exclusiva através da roda do mouse (PC).
 * Enquanto o cursor do mouse estiver sobre o menu horizontal, intercepta
 * o evento nativo 'wheel' de forma ativa ({ passive: false }), garantindo
 * que NUNCA role a página ou o conteúdo vertical ao fundo.
 */
export function useHorizontalScroll<T extends HTMLElement = HTMLElement>() {
  const elRef = useRef<T | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Enquanto o mouse estiver dentro do container horizontal, bloqueia
      // qualquer propagação ou rolagem vertical da página pai:
      e.preventDefault();
      e.stopPropagation();

      // Calcula o deslocamento da roda (com suporte a deltaMode por linhas ou pixels)
      const rawDelta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      const multiplier = e.deltaMode === 1 ? 24 : 1;
      const delta = rawDelta * multiplier;

      el.scrollLeft += delta;
    };

    // { passive: false } é obrigatório para que e.preventDefault() funcione sem erro e bloqueie o scroll vertical
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  return elRef;
}
