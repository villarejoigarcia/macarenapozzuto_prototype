import { useEffect } from 'react';

export function VerticalScroll(ref: React.RefObject<HTMLElement>, active: boolean) {
    useEffect(() => {
        if (!active || !ref.current) return;

        const el = ref.current;

        const onWheel = (e: WheelEvent) => {
            if (el.scrollWidth > el.clientWidth) {
                el.scrollLeft += e.deltaY;
            }
        };

        el.addEventListener('wheel', onWheel, { passive: true });

        return () => {
            el.removeEventListener('wheel', onWheel);
        };
    }, [ref, active]);
}