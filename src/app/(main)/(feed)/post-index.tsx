'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { urlFor } from '@/sanity/helper';

import { scrollPost } from './functions/scroll-x';
import { getPostTop } from './functions/post-top';
import { Drag } from './functions/drag';
import { useBlur } from '../../context/blur-context';
import { useAbout } from '../../context/about-context';
import Footer from '../../components/footer';
import { Beizer } from '../../components/beizer';
import { responsive } from '././functions/responsive';

import { PortableText } from '@portabletext/react';



interface PostIndexProps {
    posts: any[];
}

interface PostItemProps {
    post: any;
    index: number;
    isActive: boolean;
    isExpanded: boolean;
    closeRequestId: number;
    mobileCloseRequestId: number;
    onExpand: (expanded: boolean) => void;
    onActivate: (index: number | null) => void;
    onMobileVisibleChange: (index: number, visible: boolean) => void;
    isAnimatingRef: React.RefObject<boolean>;
    isLast: boolean;
}

const cssEase = Beizer(0.42, 0, 0.58, 1);
// const cssEase = Beizer(0.25, 0.1, 0.25, 1);
const beizerClass = 'ease-[cubic-bezier(0.42,0,0.58,1)]';

function getMediaUrl(media: any) {
    if (!media) return '';
    if (media._type === 'file') return media.asset?.url || '';
    return urlFor(media).url();
}

function PostItem({
    post,
    index,
    isActive,
    isExpanded,
    closeRequestId,
    mobileCloseRequestId,
    onExpand,
    onActivate,
    onMobileVisibleChange,
    isAnimatingRef,
    isLast,
}: PostItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const pageScrollRafRef = useRef<number | null>(null);
    const hadInnerScrollRef = useRef(false);
    const recenterTimeoutRef = useRef<number | null>(null);
    const lastHandledCloseRequestIdRef = useRef(0);
    const lastHandledMobileCloseRequestIdRef = useRef(0);
    const skipNextAutoCenterRef = useRef(false);
    const prevPageYRef = useRef(0);
    const [isMobile, setIsMobile] = useState(false);
    const { scrollY } = useScroll();
    const [isHover, setIsHover] = useState(false);
    const { setType, type } = useBlur();
    const { isOpen: isAboutOpen } = useAbout();
    const [isVisible, setIsVisible] = useState(false);

    const mediaItems = [post.cover, ...(post.images || [])].filter(Boolean);

    const scaleRaw = useTransform(scrollY, (latest) => {
        if (!ref.current || (!isExpanded && !isMobile)) return 1;

        const rect = ref.current.getBoundingClientRect();

        let viewportCenter;
        let elementCenter;

        if (latest < 5) {
            viewportCenter = 0;
            elementCenter = rect.top;
        } else {
            viewportCenter = window.innerHeight / 2;
            elementCenter = rect.top + rect.height / 2;
        }

        if (isMobile && isLast && elementCenter <= window.innerHeight / 2) {
            return 1;
        }

        const distance = Math.abs(viewportCenter - elementCenter);
        const maxDistance = window.innerHeight / 2;
        const normalized = Math.min(distance / maxDistance, 1);

        return 1 - normalized * 0.25;
    });

    const widthSpring = useSpring(scaleRaw, {
        stiffness: 1200,
        damping: 400,
        mass: 10,
    });

    const mobileWidth = useTransform(widthSpring, [0.75, 1], ['50%', '100%']);

    Drag(ref as React.RefObject<HTMLElement>, isHover || isActive);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isMobile) {
            setIsVisible(false);
        }
    }, [isMobile]);

    useEffect(() => {
        onMobileVisibleChange(index, isVisible);
    }, [index, isVisible, onMobileVisibleChange]);

    useEffect(() => {
        const unsubscribe = scrollY.on('change', () => {
            if (!ref.current) return;

            const currentPageY = window.scrollY;
            const verticalDelta = Math.abs(currentPageY - prevPageYRef.current);
            const hasVerticalPageScroll = verticalDelta > 10;

            if (isActive && hadInnerScrollRef.current && hasVerticalPageScroll) {
                scrollPost(ref.current, 750);
                hadInnerScrollRef.current = false;
            }

            const rect = ref.current.getBoundingClientRect();
            const viewportTrigger = !isMobile ? window.innerHeight / 3 : window.innerHeight / 2;
            const activeByPosition = rect.top <= viewportTrigger && rect.bottom >= viewportTrigger;

            if (isAnimatingRef.current) return;

            if (activeByPosition) {
                onActivate(index);
                setType('');
            } else if (isActive) {
                onActivate(null);
            }
        });

        return () => unsubscribe();
    }, [scrollY, isMobile, onActivate, index, isActive, isAnimatingRef, setType]);

    useEffect(() => {
        if (!ref.current) return;

        const node = ref.current;
        const handleInnerScroll = () => {
            const offset = node.scrollLeft;
            hadInnerScrollRef.current = offset > 0;
        };

        node.addEventListener('scroll', handleInnerScroll, { passive: true });
        return () => node.removeEventListener('scroll', handleInnerScroll);
    }, []);

    const opacityClass =
        (isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile && !isExpanded)
            ? 'opacity-100 delay-500'
            : 'opacity-0';

    const animatePageScrollTo = (targetY: number, duration = 0) => {
        return new Promise<void>((resolve) => {
            if (pageScrollRafRef.current !== null) {
                cancelAnimationFrame(pageScrollRafRef.current);
                pageScrollRafRef.current = null;
            }

            const startY = window.scrollY;
            const delta = targetY - startY;
            const startTime = performance.now();

            const step = (now: number) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = cssEase(progress);
                const nextY = startY + delta * ease;

                window.scrollTo({ top: nextY, behavior: 'auto' });

                if (progress < 1) {
                    pageScrollRafRef.current = requestAnimationFrame(step);
                } else {
                    pageScrollRafRef.current = null;
                    resolve();
                }
            };

            pageScrollRafRef.current = requestAnimationFrame(step);
        });
    };

    const duration = 1000;
    const classDuration = 'duration-1000';
    const desktopHeightClass = isExpanded ? 'lg:h-[70vh]' : isHover ? 'lg:h-[33.333vh]' : 'lg:h-[27.5vh]';

    const scrollToCenter = () => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const elementCenterY = rect.top + rect.height / 2 + window.scrollY;
        const target = Math.max(0, elementCenterY - window.innerHeight / 2);
        animatePageScrollTo(target, duration).catch(() => { });
    };

    // const snapCurrentPostToCenter = () => {
    //     if (!ref.current) return;

    //     const rect = ref.current.getBoundingClientRect();
    //     const target = Math.max(0, window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2);
    //     window.scrollTo({ top: target, behavior: 'auto' });
    // };

    useEffect(() => {
        if (!isActive || !isExpanded) return;

        if (skipNextAutoCenterRef.current) {
            skipNextAutoCenterRef.current = false;
            return;
        }

        recenterTimeoutRef.current = window.setTimeout(() => {
            scrollToCenter();
            recenterTimeoutRef.current = null;
            document.body.style.overflow = 'hidden';
            window.setTimeout(() => {
                document.body.style.overflow = 'scroll';
            }, duration);
        }, 1000);

        return () => {
            if (recenterTimeoutRef.current !== null) {
                window.clearTimeout(recenterTimeoutRef.current);
                recenterTimeoutRef.current = null;
            }
        };
    }, [isActive, isExpanded]);

    const handleClick = async () => {
        if (isAnimatingRef.current || isMobile) return;

        const shouldCollapse = isExpanded && isActive;

        isAnimatingRef.current = true;
        skipNextAutoCenterRef.current = true;

        if (shouldCollapse) {
            // Mantener activo el item que se cierra para no perder referencia durante la animacion.
            onActivate(index);
            onExpand(false);
            setType('');
            //   window.history.pushState({}, '', '/');
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            const collapsedTarget = getPostTop(index, null);
            await animatePageScrollTo(collapsedTarget, duration);

            // Correccion final con medicion real una vez terminado el colapso.
            // snapCurrentPostToCenter();
        } else {
            onExpand(true);
            onActivate(index);
            //   window.history.pushState({}, '', `/${post.slug?.current || ''}`);
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            const target = getPostTop(index, index);
            await animatePageScrollTo(target, duration);
        }

        isAnimatingRef.current = false;
    };

    useEffect(() => {
        if (!ref.current) return;
        if (!isActive) {
            scrollPost(ref.current, 750);
        }
    }, [isActive]);

    useEffect(() => {
        if (closeRequestId === lastHandledCloseRequestIdRef.current) return;
        lastHandledCloseRequestIdRef.current = closeRequestId;

        if (closeRequestId === 0) return;
        if (!isActive || !isExpanded) return;
        if (isAnimatingRef.current) return;

        handleClick();
    }, [closeRequestId, isActive, isExpanded, isAnimatingRef]);

    useEffect(() => {
        if (mobileCloseRequestId === lastHandledMobileCloseRequestIdRef.current) return;
        lastHandledMobileCloseRequestIdRef.current = mobileCloseRequestId;

        if (mobileCloseRequestId === 0) return;
        if (!isVisible) return;

        setIsVisible(false);
    }, [mobileCloseRequestId, isVisible]);

    const resetCurrentScroll = () => {
        if (!ref.current) return;
        scrollPost(ref.current, 1500);
        hadInnerScrollRef.current = false;
    };

    return (
        <div
            className={`w-full relative transition-height ${classDuration} ${beizerClass} ${desktopHeightClass}`}
        >
            <div
                ref={ref}
                data-post
                data-post-id={post._id}
                className={`item w-full h-full relative flex justify-center transition duration-500 ${(isActive && isExpanded) || (isHover && !isMobile && !isExpanded) ? 'overflow-x-auto cursor-ew-resize' : 'overflow-hidden cursor-pointer'} ${isExpanded ? 'pointer-events-auto' : 'pointer-events-none'} ${isActive || !isExpanded || (isExpanded && isHover) ? 'opacity-100' : 'opacity-25'}`}
                onClick={() => {
                    if (isVisible) return;

                    if (isMobile) {
                        onActivate(index);
                        setType('');
                        setIsVisible(true);
                        return;
                    }

                    handleClick();
                    // resetCurrentScroll();
                }}
            >
                <motion.div
                    style={isMobile ? { width: mobileWidth } : { scale: widthSpring }}
                    className="origin-center h-full will-change-transform flex pointer-events-auto"
                    onMouseEnter={() => {
                        setIsHover(true);
                    }}
                    onMouseLeave={() => {
                        setIsHover(false);
                        if (isExpanded) return;
                        resetCurrentScroll();
                    }}
                >
                    {mediaItems[0] && mediaItems[0]?._type === 'file' ? (
                        <video
                            src={getMediaUrl(mediaItems[0])}
                            loop
                            autoPlay
                            muted
                            playsInline
                            style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        mediaItems[0] && (
                            <img
                                src={getMediaUrl(mediaItems[0])}
                                alt={post.title}
                                style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
                            />
                        )
                    )}

                    {!isMobile && (
                        <div
                            className={`absolute top-0 left-full h-full w-max flex px-[3px] gap-[3px] ${(isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile) ? 'pointer-events-auto' : 'pointer-events-none'}`}
                        >
                            {mediaItems.length > 1 &&
                                mediaItems.slice(1).map((media: any, i: number) => {
                                    const delay = `${((isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile) ? i : mediaItems.length - 2 - i) * 100}ms`;

                                    if (media?._type === 'file') {
                                        return (
                                            <video
                                                key={`video-${i}`}
                                                src={getMediaUrl(media)}
                                                loop
                                                autoPlay
                                                muted
                                                playsInline
                                                className={`transition-opacity duration-500 ${(isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile) ? 'opacity-100' : 'opacity-0'}`}
                                                style={{
                                                    width: 'auto',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    transitionDelay: delay,
                                                }}
                                            />
                                        );
                                    }

                                    return (
                                        <img
                                            key={`image-${i}`}
                                            src={getMediaUrl(media)}
                                            alt={post.title}
                                            className={`transition-opacity duration-500 ${(isActive && isExpanded) || (isActive && isMobile) || (isHover && !isMobile) ? 'opacity-100' : 'opacity-0'}`}
                                            style={{
                                                width: 'auto',
                                                height: '100%',
                                                objectFit: 'contain',
                                                transitionDelay: delay,
                                            }}
                                        />
                                    );
                                })}
                        </div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {isMobile && isVisible && (
                        <motion.div
                            className={`z-25 fixed top-0 left-0 h-dvh w-screen overflow-scroll backdrop-blur-lg bg-(--blur) ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.66 } }}
                            exit={{ opacity: 0, transition: { duration: 0.66, when: 'afterChildren', delay: .66 } }}
                            onClick={() => {
                                setIsVisible(false);
                            }}
                        >
                            <motion.div
                                className={`flex flex-col gap-[3px]`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { duration: 0.66, delay: 0.66 } }}
                                exit={{ opacity: 0, transition: { duration: 0.66 } }}
                            >
                                {mediaItems.map((media: any, i: number) => {
                                    if (media?._type === 'file') {
                                        return (
                                            <video
                                                key={`mobile-video-${i}`}
                                                src={getMediaUrl(media)}
                                                loop
                                                autoPlay
                                                muted
                                                playsInline
                                                className="w-auto h-full object-contain"
                                            />
                                        );
                                    }

                                    return (
                                        <img
                                            key={`mobile-image-${i}`}
                                            src={getMediaUrl(media)}
                                            alt={post.title}
                                            className="w-auto h-full object-contain"
                                        />
                                    );
                                })}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div
                ref={textRef}
                className={`lg:z-100 z-10 relative pointer-events-none flex w-full px-(--kv) transition-all duration-1000 ${isActive && isMobile ? 'py-[10px_5px] h-[30px]' : !isMobile ? 'py-[10px_5px]' : 'h-0 py-0'} ${(type === 'single') && isActive ? 'active' : ''} ${isExpanded ? 'opacity-0' : 'opacity-100'}`}
                // onClick={() => {
                //     if (type === 'single') {
                //         setType('');
                //     }
                // }}
            >
                <p className={`flex-1 lg:grow-1 grow-0 mr-[.2em] opacity-0 transition-opacity duration-500 ${opacityClass}`}>{index + 1}.</p>
                <p className={`flex-1 lg:grow-3 grow-2 opacity-0 transition-opacity duration-500 ${opacityClass}`}>{post.title || ''}</p>
                <p className={`flex-1 lg:grow-1 opacity-0 transition-opacity duration-500 ${opacityClass}`}>{post.categories?.[0]?.title || ''}</p>
                <p className={`flex-1 lg:grow-1 grow-0 text-right opacity-0 transition-opacity duration-500 ${opacityClass}`}>{post.year || ''}</p>
            </div>


            {/* description */}

            <div
                className={`single-nav lg:pl-0 pl-(--kv) py-(--kv) pr-(--kv) transition-opacity duration-1000 fixed lg:left-[calc(100vw/3)] lg:top-0 top-auto bottom-0 lg:w-[calc(100vw/1.5)] w-screen flex lg:flex-row flex-col-reverse justify-end z-[51] pointer-events-none ${(!isAboutOpen && isExpanded && isActive) || isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} ${(type === 'single') ? 'active' : ''}`}
                onClick={() => {
                    if (type === 'single') {
                        setType('');
                    }
                }}
            >
                <div className='flex-1'>
                    <p>
                        {post.title}
                    </p>
                </div>



                <div className={`lg:flex-[1.67] transition-opacity duration-500 pointer-events-none ${(type === 'single') ? 'opacity-100' : 'opacity-0'}`}>
                    <div className='lg:pr-[25%]'>
                        
                        <div className='flex gap-1'>
                            <div className='mb-(--lh) flex'>
                                {post.categories?.map((cat: { title: string }) => (
                                    <p key={cat.title} className="pr-[.2em] after:content-[',']">
                                        {cat.title}
                                    </p>
                                ))}

                                {post.year && (
                                    <p className="pr-[3px]">
                                        {post.year}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                        <PortableText
                                value={post.description}
                                components={{
                                    block: {
                                        normal: ({ children }) => (
                                            <p className='not-last:mb-(--lh)'>
                                                {children}
                                            </p>
                                        ),
                                    },
                                }}
                            />
                            </div>
                        <div className='py-(--lh)'>
                            <PortableText
                                value={post.credits}
                                components={{
                                    block: {
                                        normal: ({ children }) => (
                                            <p className=''>
                                                {children}
                                            </p>
                                        ),
                                    },
                                }}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PostIndex({ posts }: PostIndexProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [closeRequestId, setCloseRequestId] = useState(0);
    const [mobileCloseRequestId, setMobileCloseRequestId] = useState(0);
    const [mobileVisibleIndex, setMobileVisibleIndex] = useState<number | null>(null);
    const isAnimatingRef = useRef(false);
    const pageTopRafRef = useRef<number | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isLastItemOutOfView, setIsLastItemOutOfView] = useState(false);
    const { type, setType } = useBlur();
    const { isOpen: isAboutOpen } = useAbout();
    const isMobile = responsive();

    const showGlobalControls = !isAboutOpen && ((isExpanded && activeIndex !== null) || mobileVisibleIndex !== null);

    // const animatePageScrollToTop = (duration = 0) => {
    //     const startY = window.scrollY;
    //     const startTime = performance.now();

    //     const step = (now: number) => {
    //         const elapsed = now - startTime;
    //         const progress = Math.min(elapsed / duration, 1);
    //         const ease = cssEase(progress);
    //         const nextY = startY * (1 - ease);

    //         window.scrollTo({ top: nextY, behavior: 'auto' });

    //         if (progress < 1) {
    //             pageTopRafRef.current = requestAnimationFrame(step);
    //         } else {
    //             pageTopRafRef.current = null;
    //         }
    //     };

    //     pageTopRafRef.current = requestAnimationFrame(step);
    // };

    //   useEffect(() => {
    //     const path = window.location.pathname;
    //     const initialIndex = posts.findIndex((p) => `/${p.slug?.current}` === path);

    //     if (initialIndex >= 0) {
    //       setActiveIndex(initialIndex);
    //       setIsExpanded(true);
    //     }
    //   }, [posts]);

    useEffect(() => {
        const updateLastItemVisibility = () => {
            const items = wrapperRef.current?.querySelectorAll('.item');
            if (!items || items.length === 0) return;

            const lastItem = items[items.length - 1] as HTMLElement;
            const rect = lastItem.getBoundingClientRect();
            // const outOfView = rect.bottom <= window.innerHeight / 1.5;
            const outOfView = rect.bottom <= 50;

            setIsLastItemOutOfView((prev) => (prev === outOfView ? prev : outOfView));
        };

        updateLastItemVisibility();
        window.addEventListener('scroll', updateLastItemVisibility, { passive: true });
        window.addEventListener('resize', updateLastItemVisibility);

        return () => {
            window.removeEventListener('scroll', updateLastItemVisibility);
            window.removeEventListener('resize', updateLastItemVisibility);
        };
    }, []);

    return (
        <>
            <section
                ref={wrapperRef}
                className={`wrapper flex flex-col gap-[5px] items-center transition-padding duration-1000 ${beizerClass} ${isExpanded ? 'lg:pb-[15vh]' : 'lg:pb-[25px]'}`}
                id="feed"
            >
                {posts.map((post, idx) => (
                    <PostItem
                        key={post._id}
                        post={post}
                        index={idx}
                        isActive={activeIndex === idx}
                        isExpanded={isExpanded}
                        closeRequestId={closeRequestId}
                        mobileCloseRequestId={mobileCloseRequestId}
                        onExpand={setIsExpanded}
                        onActivate={setActiveIndex}
                        onMobileVisibleChange={(itemIndex, visible) => {
                            setMobileVisibleIndex((prev) => {
                                if (visible) return itemIndex;
                                if (prev === itemIndex) return null;
                                return prev;
                            });
                        }}
                        isAnimatingRef={isAnimatingRef}
                        isLast={idx === posts.length - 1}
                    />
                ))}
            </section>

            <div
            
                className={`fixed z-100 lg:left-1/2 lg:w-1/2 lg:top-0 lg:bottom-auto top-auto bottom-0 right-(--kv) w-1/3 z-50 pr-(--kv) py-(--kv) flex justify-between transition-opacity duration-500 ${showGlobalControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} ${type === 'single' ? 'active' : ''}`}
            >
                <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() => {
                        setType((prev) => (prev === 'single' ? '' : 'single'));
                    }}
                >
                    {type === 'single' ? 'Info –' : 'Info +'}
                </button>

                <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() => {
                        setType('');
                        if (mobileVisibleIndex !== null) {
                            setMobileCloseRequestId((prev) => prev + 1);
                            return;
                        }

                        setCloseRequestId((prev) => prev + 1);
                    }}
                >
                    Close
                </button>
            </div>

            <div
                className={`${isLastItemOutOfView ? 'lg:pb-[0]' : 'lg:pb-[500vh]'}`}
            // onClick={() => animatePageScrollToTop(3000)}
            >
                <Footer />
            </div>
        </>
    );
}
