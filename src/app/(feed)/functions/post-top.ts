export function getPostTop(
    index: number,
    openIndex: number | null
) {
    const close = 27.5;
    const open = 75;

    let scrollVh = 0;

    for (let i = 0; i < index; i++) {
        scrollVh += i === openIndex ? open : close;
    }

    return (scrollVh / 100) * window.innerHeight;
}