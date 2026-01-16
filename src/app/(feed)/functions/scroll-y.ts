export function scrollFeed(
    target: number, 
    duration = 1500
) {
    const start = window.scrollY;
    const change = target - start;
    const startTime = performance.now();

    function animate(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);



        // easeInQuad
        // const ease = progress * progress;

        // easeOutQuad
        // const ease = progress * (2 - progress);

        // easeInOutQuad
        const ease = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;



        // easeInCubic
        // const ease = Math.pow(progress, 3);
        
        // easeOutCubic
        // const ease = 1 - Math.pow(1 - progress, 3);
        
        // easeInOutCubic
        // const ease = progress < 0.5
        //     ? 4 * Math.pow(progress, 3)
        //     : 1 - Math.pow(-2 * progress + 2, 3) / 2;



        // easeOutQuart
        // const ease = 1 - Math.pow(1 - progress, 4);

        // easeInOutQuart
        // const ease = progress < 0.5
        //     ? 8 * Math.pow(progress, 4)        
        //     : 1 - Math.pow(-2 * progress + 2, 4) / 2;



        // easeInOutSine
        // const ease = -0.5 * (Math.cos(Math.PI * progress) - 1);

        // easeOutSine
        // const ease = Math.sin((progress * Math.PI) / 2);



        window.scrollTo(0, start + change * ease);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}