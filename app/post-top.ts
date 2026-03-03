export function getPostTop(
  index: number,
  openIndex: number | null,
  getCloseHeightVh: (i: number) => number, // altura dinámica en vh
  openVh = 75
) {
  let scrollVh = 0;

  for (let i = 0; i < index; i++) {
    scrollVh += i === openIndex ? openVh : getCloseHeightVh(i);
  }

  return (scrollVh / 100) * window.innerHeight;
}