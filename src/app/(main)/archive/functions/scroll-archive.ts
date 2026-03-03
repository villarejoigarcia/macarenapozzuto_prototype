export function scrollArchive(
  el: HTMLElement,
  duration = 1000 // ← controla la velocidad (ms)
) {
  const media = el.querySelector<HTMLImageElement | HTMLVideoElement>('img, video');
  if (!media) return;
  
  // const archive = document.getElementById('archive') as HTMLElement;
  // if (!archive) return;

  const rect = media.getBoundingClientRect();
  const startY = window.scrollY;
  const targetY =
    startY +
    rect.top -
    window.innerHeight / 2 +
    rect.height / 2;

  const startTime = performance.now();

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // easing suave (easeInOut)
    const ease =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

    window.scrollTo(0, startY + (targetY - startY) * ease);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}