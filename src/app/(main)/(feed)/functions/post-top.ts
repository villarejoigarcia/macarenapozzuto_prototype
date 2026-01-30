export function getPostTop(
    index: number,
    openIndex: number | null
) {
    if (window.innerWidth < 1024) {
        const posts = document.querySelectorAll('[data-post]');
        const el = posts[index] as HTMLElement | undefined;

        if (!el) return 0;

        const rect = el.getBoundingClientRect();
        return rect.top + window.scrollY;
    }

    const close = 27.5;
    const open = 75;

    let scrollVh = 0;

    for (let i = 0; i < index; i++) {
        scrollVh += i === openIndex ? open : close;
    }

    return (scrollVh / 100) * window.innerHeight;
}