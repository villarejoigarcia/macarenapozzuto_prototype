export function getPostTop(
    index: number,
    openIndex: number | null
) {
    const safeIndex = Math.max(0, index);
    const wrapper = document.querySelector('.wrapper') as HTMLElement | null;

    let centeredTop = 0;

        const itemHeightVh = openIndex !== null ? 70 : 27.5;
        const itemHeightPx = (itemHeightVh / 100) * window.innerHeight;
        const gapValue = wrapper
            ? getComputedStyle(wrapper).rowGap || getComputedStyle(wrapper).gap
            : '0';
        const gapPx = Number.parseFloat(gapValue || '0') || 0;
        const itemTop = safeIndex * (itemHeightPx + gapPx);
        centeredTop = itemTop + itemHeightPx / 2 - window.innerHeight / 2;

    const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
    );

    return Math.min(Math.max(centeredTop, 0), maxScroll);
}