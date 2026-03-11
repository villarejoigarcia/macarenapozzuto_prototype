export function Beizer(x1: number, y1: number, x2: number, y2: number) {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;

    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;

    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
    const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

    return (x: number) => {
        const progress = Math.min(Math.max(x, 0), 1);
        let t = progress;

        for (let i = 0; i < 6; i += 1) {
            const currentX = sampleCurveX(t) - progress;
            const currentSlope = sampleCurveDerivativeX(t);
            if (Math.abs(currentX) < 1e-5 || currentSlope === 0) break;
            t -= currentX / currentSlope;
        }

        return sampleCurveY(Math.min(Math.max(t, 0), 1));
    };
}