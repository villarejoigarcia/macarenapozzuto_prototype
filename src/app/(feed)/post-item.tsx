'use client';

import { useState, useRef, useEffect } from 'react';
import { urlFor } from '@/sanity/helper';
import { scrollPost } from './functions/scroll-x';
import { scrollFeed } from './functions/scroll-y';
import { useBlur } from '../context/blur-context';


interface PostItemProps {
    post: any;
    index: number;
    openPost: string | null;
    setOpenPost: (id: string | null) => void;
    activePost: string | null;
    setActivePost: (id: string | null) => void;
    openIndex: number | null;
    getPostTop: (index: number, openIndex: number | null) => number;
}

export default function PostItem({
    post,
    index,
    openPost,
    setOpenPost,
    activePost,
    setActivePost,
    openIndex,
    getPostTop,

}: PostItemProps) {

    const [isHover, setIsHover] = useState(false);
    const postRef = useRef<HTMLDivElement | null>(null);
    const coverRef = useRef<HTMLDivElement | null>(null);

    const isOpen = openPost === post._id;
    const isActive = activePost === post._id;
    const isAnyOpen = openPost !== null;
    const isAnyActive = activePost !== null;

    const [isMobile, setIsMobile] = useState(false);

    const { setType } = useBlur();

    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        check(); // primera vez
        window.addEventListener('resize', check);

        return () => window.removeEventListener('resize', check);
    }, []);

    // const [scrollX, setScrollX] = useState(0);

    useEffect(() => {
        if (window.location.pathname === `/${post.slug.current}`) {
            setOpenPost(post._id);
        }
    }, [post._id, post.slug.current, setOpenPost]);

    // useEffect(() => {
    //     if (isOpen && postRef.current) {  
    //         const rect = postRef.current.getBoundingClientRect();
    //         const targetScroll = rect.top + window.scrollY - window.innerHeight * 0.125; // 25vh
    //         console.log(targetScroll);
    //         scrollFeed(targetScroll, 1000);
    //     }
    // }, [isOpen]);

    // useEffect(() => {
    //     if (!isOpen) return;
    //     const targetScroll = getScrollTopForPost(index, openIndex) - window.innerHeight * .125;
    //     scrollFeed(targetScroll);
    // }, [isOpen, index, openIndex, getScrollTopForPost]);

    

    useEffect(() => {

        if (!isOpen) return;

        const isMobile = window.innerWidth < 1024; 
        const offset = isMobile ? 0 : window.innerHeight * 0.125;

        const targetScroll = getPostTop(index, openIndex) - offset;

        scrollFeed(targetScroll);
        
    }, [isOpen, index, openIndex, getPostTop]);



    useEffect(() => {
        if (!isOpen && postRef.current) {
            scrollPost(postRef.current);
        }
    }, [isOpen]);



    useEffect(() => {
        if (!isOpen) return;

        // Función para clicks fuera del post
        const handleClickOutside = (e: MouseEvent) => {
            if (!coverRef.current) return;

            if (!coverRef.current.contains(e.target as Node)) {
                setOpenPost(null);
                setActivePost(null);
                window.history.pushState({}, '', '/');
            }

            setType('');
        };

        // Función para detectar botón atrás/adelante
        const handlePopState = () => {
            setOpenPost(null);
            setActivePost(null);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, setOpenPost, setActivePost]);

    // transitions

    const heightClass = isOpen
        ? 'lg:h-[75dvh] h-dvh'
        : isAnyOpen
            ? 'h-[27.5dvh]'
            : !isOpen && isActive
                ? 'h-[33.333dvh]'
                : 'h-[27.5dvh]';

    const opacityClass =
        (isAnyOpen && !isOpen) || (isAnyActive && !isActive && !isOpen)
            ? 'opacity-30'
            : 'opacity-100';

    const hoverActiveClass = isHover ? 'opacity-100' : 'opacity-30';

    const pointerEvents =
        (isHover || isOpen)
            // ? 'opacity-100 pointer-events-auto' 
            // : 'opacity-0 pointer-events-none';
            ? 'pointer-events-auto'
            : 'pointer-events-none';

//  

    // const mediaDelay =
    //     !isOpen && isAnyOpen
    //         ? 'delay-0' 
    //         : !isHover && scrollX > 0 ? 'delay-500': 'delay-0';

    return (

        <div className={`relative transition-all duration-1000 pb-[5px] last:pb-0 ${heightClass} ${opacityClass} ${hoverActiveClass}`}>
            <div
                ref={postRef}
                className={`flex flex-col items-center w-full h-full ${(isActive && !isAnyOpen) || (isHover && isOpen) || isOpen ? 'lg:overflow-x-scroll overflow-y-scroll' : 'overflow-hidden'}`}
            >
                {/* cover */}
                <div
                    ref={coverRef}
                    className="relative h-full cursor-pointer"
                    onClick={() => {
                        // setOpenPost(isOpen ? null : post._id);
                        setOpenPost(post._id);
                        if (postRef.current) {
                            scrollPost(postRef.current);
                        }
                        // window.history.pushState({}, '', isOpen ? '/' : `/${post.slug.current}`);
                        window.history.pushState({}, '', `/${post.slug.current}`);
                    }}
                    // onMouseEnter={() => {
                    //     setActivePost(post._id);
                    //     setIsHover(true);
                    // }}
                    // onMouseLeave={() => {
                    //     setActivePost(null);
                    //     if (postRef.current) {
                    //         if (!isOpen) scrollPost(postRef.current);
                    //     }
                    //     setIsHover(false);
                    // }}     

                    onMouseEnter={() => {
                        if (isMobile) return;
                        setActivePost(post._id);
                        setIsHover(true);
                    }}
                    onMouseLeave={() => {
                        if (isMobile) return;
                        setActivePost(null);
                        if (postRef.current && !isOpen) {
                            scrollPost(postRef.current);
                        }
                        setIsHover(false);
                    }}
                >
                    {post.cover && (
                        <img
                            src={urlFor(post.cover).url()}
                            alt={post.title}
                            className="object-cover w-auto max-w-full lg:h-full max-h-full mx-auto"
                        />
                    )}

                    {/* media */}
                    <div
                        // className={`absolute flex gap-[3px] top-0 left-full w-max h-full pl-[3px] transition-opacity duration-500 ${pointerEvents} ${mediaDelay}`}
                        className={`lg:absolute relative flex lg:flex-row flex-col gap-[3px] lg:top-0 top-auto lg:left-full left-0 lg:w-max w-full lg:h-full h-max lg:pl-[3px] pl-0 lg:pt-0 pt-[3px] ${pointerEvents}`}
                    >
                        {post.images?.map((img: any, i: number) => {
                            // const delay = `${i * 250}ms`;
                           

                            const delay = isMobile
                                ? `${(post.images.length - i - 1) * 50}ms` // mobile
                                : isHover || isOpen
                                    ? `${i * 150}ms`  // in desktop
                                    : `${(post.images.length - i - 1) * 100}ms`; // out desktop

                            return (
                                <img
                                    key={i}
                                    src={urlFor(img).url()}
                                    alt={post.title}
                                    className={`object-cover w-auto transition-opacity duration-500`}
                                    style={{
                                        opacity: isHover || isOpen ? 1 : 0,
                                        transitionDelay: delay,
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* text */}
            <div
                className={`lg:absolute relative left-0 top-[calc(100% - 5px)] flex items-center w-full justify-between p-(--kv) transition-opacity duration-500 ${isHover && !isAnyOpen ? 'opacity-100' : 'opacity-0'}`}
            >
                <h2 className="flex-1">{index + 1}.</h2>
                <h2 className="flex-1 grow-3">{post.title}</h2>
                {post.categories.map((cat: { title: string }) => (
                    <p key={cat.title} className="flex-1">{cat.title}</p>
                ))}
                <h2 className="flex-1">{post.year}</h2>
            </div>
        </div>
    );
}