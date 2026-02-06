export function getPostTop(
    index: number,
    openIndex: number | null
) {
    // if (window.innerWidth < 1024) {
    //     const posts = document.querySelectorAll('[data-post]');
    //     const el = posts[index] as HTMLElement | undefined;

    //     if (!el) return 0;

    //     const rect = el.getBoundingClientRect();
    //     return rect.top + window.scrollY;
    // }
    const isMobile = window.innerWidth < 1024;
    const close = isMobile ? 33.333 : 27.5;
    const open = isMobile ? 100 : 75;

    let scrollVh = 0;

    for (let i = 0; i < index; i++) {
        scrollVh += i === openIndex ? open : close;
    }

    return (scrollVh / 100) * window.innerHeight;
}

// export function getPostTop(
//     index: number,
//     openIndex: number | null
// ) {
//     const isMobile = window.innerWidth < 1024;

//     const close = isMobile ? 33.333 : 27.5;
//     const open = isMobile ? 100 : 75;

//     let scrollVh = 0;

//     for (let i = 0; i < index; i++) {
//         scrollVh += i === openIndex ? open : close;
//     }

//     const vh = isMobile && window.visualViewport
//         ? window.visualViewport.height
//         : window.innerHeight;

//     return (scrollVh / 100) * vh;
// }

// export function getPostTop(
//     index: number,
//     openIndex: number | null
// ) {

//     const isMobile = window.innerWidth < 1024;

//     const close = isMobile ? 33.333 : 27.5;
//     const open  = isMobile ? window.innerHeight : 75;

//     const effectiveOpenIndex =
//         openIndex === index ? null : openIndex;

//     let scrollVh = 0;

//     for (let i = 0; i < index; i++) {
//         scrollVh += i === effectiveOpenIndex ? open : close;
//     }

//     const calculatedTop = (scrollVh / 100) * window.innerHeight

//     return calculatedTop;
// }

// export function getPostTop(index: number) {
//   const posts = Array.from(document.querySelectorAll<HTMLElement>('[data-post]'));
//   let top = 0;

//   for (let i = 0; i < index; i++) {
//     const el = posts[i];
//     if (!el) continue;
//     top += el.offsetHeight; // altura real del DOM
//   }

//   return top;
// }