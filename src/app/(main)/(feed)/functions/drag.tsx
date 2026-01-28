import { useEffect } from 'react';

export function Drag(
	ref: React.RefObject<HTMLElement>,
	enabled: boolean
) {
	useEffect(() => {
		if (!enabled || !ref.current) return;

		const el = ref.current;

		let isDragging = false;
		let dragMoved = false;
		let startX = 0;
		let scrollStart = 0;

		let velocity = 0;
		let lastX = 0;
		let lastTime = 0;
		let rafId: number | null = null;

		const onMouseDown = (e: MouseEvent) => {
			isDragging = true;
			dragMoved = false;
			startX = e.pageX;
			scrollStart = el.scrollLeft;

			lastX = e.pageX;
			lastTime = performance.now();

			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		};

		const onMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;

			const dx = e.pageX - startX;
			if (Math.abs(dx) > 5) dragMoved = true;

			el.scrollLeft = scrollStart - dx;

			const now = performance.now();
			const deltaX = e.pageX - lastX;
			const deltaTime = now - lastTime;

			if (deltaTime > 0) {
				velocity = deltaX / deltaTime;
			}

			lastX = e.pageX;
			lastTime = now;
		};

		const startInertia = () => {
			const friction = 0.95;

			const step = () => {
				if (Math.abs(velocity) < 0.01) {
					velocity = 0;
					rafId = null;
					return;
				}

				el.scrollLeft -= velocity * 16;
				velocity *= friction;
				rafId = requestAnimationFrame(step);
			};

			rafId = requestAnimationFrame(step);
		};

		const onMouseUp = () => {
			if (isDragging) {
				isDragging = false;
				startInertia();
			}
		};

		const onClick = (e: MouseEvent) => {
			if (dragMoved) {
				e.preventDefault();
				e.stopPropagation();
				dragMoved = false;
			}
		};

		el.querySelectorAll('img').forEach(img => {
			img.setAttribute('draggable', 'false');
		});

		el.addEventListener('mousedown', onMouseDown);
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		el.addEventListener('click', onClick, true);

		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			el.removeEventListener('mousedown', onMouseDown);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			el.removeEventListener('click', onClick, true);
		};
	}, [ref, enabled]);
}