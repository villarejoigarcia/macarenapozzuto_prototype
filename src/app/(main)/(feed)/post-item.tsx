'use client';

import { useState, useRef, useEffect } from 'react';
import { urlFor } from '@/sanity/helper';
import { PortableText } from '@portabletext/react'

import { scrollPost } from './functions/scroll-x';
import { scrollFeed } from './functions/scroll-y';
import { Drag } from './functions/drag';
import { VerticalScroll } from './functions/vertical-scroll';

import { useBlur } from '../../context/blur-context';


interface PostItemProps {
    post: any;
    index: number;
    openPost: string | null;
    setOpenPost: (id: string | null) => void;
    activePost: string | null;
    setActivePost: (id: string | null) => void;
    openIndex: number | null;
    getPostTop: (index: number, openIndex: number | null) => number;
    showFields: boolean;
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
    showFields,
}: PostItemProps) {

    const postRef = useRef<HTMLDivElement | null>(null);
    const coverRef = useRef<HTMLDivElement | null>(null);

    const isOpen = openPost === post._id;
    const isActive = activePost === post._id;
    const isAnyOpen = openPost !== null;
    const isAnyActive = activePost !== null;

    const { setType, type } = useBlur();

    const [isHover, setIsHover] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        check(); // primera vez
        window.addEventListener('resize', check);

        return () => window.removeEventListener('resize', check);
    }, []);

    Drag(postRef as React.RefObject<HTMLElement>, !isMobile && (isHover || isOpen));
    VerticalScroll(postRef as React.RefObject<HTMLElement>, isOpen);

    useEffect(() => {
        if (window.location.pathname === `/${post.slug.current}`) {
            setOpenPost(post._id);
        }
    }, [post._id, post.slug.current, setOpenPost]);


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



    // useEffect(() => {
    //     if (!isOpen) return;

    //     const feed = document.getElementById('feed');
    //     if (!feed) return;

    //     const isMobile = window.innerWidth < 1024;

    //     // offset solo en desktop
    //     const offset = isMobile ? 0 : window.innerHeight * 0.125;

    //     const targetScroll = getPostTop(index, openIndex) - offset;

    //     scrollFeed(targetScroll);

    // }, [isOpen, index, openIndex, getPostTop]);



    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (e.target === target.closest('[data-post]') || (e.target as HTMLElement).id === 'home') {
                setOpenPost(null);
                setActivePost(null);
                setType('');
                window.history.pushState({}, '', '/');
            }
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [setOpenPost, setActivePost, setType]);



    useEffect(() => {
        const handlePopState = () => {
            if (isOpen) {
                setOpenPost(null);
                setActivePost(null);
                setType('');
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, setOpenPost, setActivePost, setType]);



    // useEffect(() => {
    //     if (!isOpen) setShowFields(false);
    // }, [isOpen]);

    // transitions

    const heightClass = isOpen
        ? 'lg:h-[75vh] h-dvh'
        : isAnyOpen
            ? 'lg:h-[27.5vh] h-[33.333vh]'
            : !isOpen && isActive
                ? 'lg:h-[33.333vh] h-[40vh]'
                : 'lg:h-[27.5vh] h-[33.333vh]';

    const opacityClass =
        (isAnyOpen && !isOpen) || (isAnyActive && !isActive && !isOpen)
            ? 'opacity-30'
            : 'opacity-100';

    const hoverActiveClass = isHover && !isOpen ? 'opacity-100 last:mb-(--caption)' : 'opacity-30';

    const pointerEvents =
        (isHover || isOpen)
            ? 'pointer-events-auto'
            : 'pointer-events-none';

    const paddingClass = isOpen && isMobile ? 'pb-0' : 'pb-[5px]';
    

    return (

        <div className={`relative transition-all duration-1000 last:pb-0 ${paddingClass} ${heightClass} ${opacityClass} ${hoverActiveClass} ${(isActive && !isAnyOpen && isMobile) ? 'mb-[calc(var(--caption)-5px)]' : 'mb-0'}`}>

            <div
                data-post
                data-post-id={post._id}
                ref={postRef}
                className={`flex flex-col items-center w-full h-full box-content ${(isActive && !isAnyOpen && !isMobile) || (isHover && isOpen) || isOpen ? 'lg:overflow-x-scroll overflow-y-scroll' : 'overflow-hidden'}`}
            >

                {/* cover */}

                <div
                    ref={coverRef}
                    className="relative h-full cursor-pointer"
                    onClick={() => {
                        if (isOpen) {
                            setOpenPost(null);
                            setActivePost(null);
                            window.history.pushState({}, '', '/');
                        } else {
                            setOpenPost(post._id);
                            if (postRef.current) {
                                scrollPost(postRef.current);
                            }
                            window.history.pushState({}, '', `/${post.slug.current}`);
                        }
                    }}

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

                            const delay = isMobile
                                ? `${(post.images.length - i - 1) * 50}ms` // mobile
                                : isHover || isOpen
                                    ? `${i * 150}ms`  // in desktop
                                    : `${(post.images.length - i - 1) * 50}ms`; // out desktop

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

            {/* caption */}
            <div className={`absolute left-0 top-[calc(100% - 5px)] flex items-center w-full justify-between p-(--kv) transition-opacity duration-500 pointer-events-none ${(isHover && !isAnyOpen) || (isMobile && isActive) ? 'opacity-100 lg:delay-666 delay-333' : 'opacity-0'}`}>
                <h2 className="lg:flex-1 flex-0">{index + 1}.</h2>
                <h2 className="flex-1 lg:grow-3 grow-2">{post.title}</h2>
                {post.categories?.[0] && (
                    <p className="flex-1">{post.categories[0].title}</p>
                )}
                <h2 className="lg:flex-1 flex-0">{post.year}</h2>
            </div>

            {/* fields */}
            <div className={`fixed lg:top-(--kv) top-auto lg:bottom-auto bottom-(--caption) lg:left-[calc(100vw*7/12)] left-(--kv) pr-[calc(100vw/12)] transition-opacity duration-500 pointer-events-none z-150 ${isOpen && showFields && type !== 'about' ? 'opacity-100' : 'opacity-0'}`}>

                {(post.categories?.length > 0 || post.year) && (
                    <div className='lg:mb-(--lh) mb-(--kv) flex'>
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
                )}
               
                
                {post.description?.length > 0 && (
                    <>
                        {/* <h2 className='mb-(--kv)'>Description</h2> */}
                        <div className='mb-(--lh)'>
                            <PortableText value={post.description} />
                        </div>
                    </>
                )}

                {post.credits?.length > 0 && (
                    <>
                        {/* <h2 className='mb-(--kv)'>Credits</h2> */}
                        <PortableText value={post.credits} />
                    </>
                )}

            </div>

        </div>
    );
}