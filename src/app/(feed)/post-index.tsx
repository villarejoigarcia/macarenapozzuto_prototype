'use client';

import { useState, useEffect } from 'react';
import Posts from './post-list';
import { useBlur } from '../context/blur-context';

interface PostIndexProps {
    posts: any[];
}

export default function PostIndex({ posts }: PostIndexProps) {

    const [openPost, setOpenPost] = useState<string | null>(null);
    const [activePost, setActivePost] = useState<string | null>(null);
    const [openList, setOpenList] = useState(false);
    const { setType } = useBlur();

    const openIndex =
        openPost === null
            ? null
            : posts.findIndex(post => post._id === openPost);

    useEffect(() => {
        if (openPost) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [openPost]);

    const openByIndex = (index: number) => {
        const post = posts[index];
        if (!post) return;

        setOpenPost(post._id);
        window.history.pushState({}, '', `/${post.slug.current}`);
    };

    const [showOverflow, setShowOverflow] = useState(false);

    useEffect(() => {
        if (openPost) {
            setShowOverflow(true);
        } else {
            const timer = setTimeout(() => setShowOverflow(false), 500);
            return () => clearTimeout(timer);
        }
    }, [openPost]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        check(); // primera vez
        window.addEventListener('resize', check);

        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <>
            {/* index */}
            <nav
                className={`fixed lg:left-1/3 left-(--kv) lg:top-(--kv) top-auto lg:bottom-auto bottom-(--lh) ${showOverflow ? 'overflow-visible' : 'overflow-hidden'} z-50 flex flex-col justify-end`}
                onMouseEnter={() =>  {
                    setType('single');
                    setOpenList(true);
                }}
                onMouseLeave={() => {
                    setType('')
                    setOpenList(false);
                }}
            >
                {posts.map((p, i) => {
                    const isActive = i === openIndex;
                    const isHover = activePost === p._id;

                    return (
                        <div
                            key={p._id}
                            className={`cursor-pointer box-content transition-height duration-666 ${isActive || openList ? 'h-(--lh) opacity-100 lg:pb-(--kv) lg:pt-0 pt-(--kv) last:pb-0' : 'h-0 pb-0 opacity-0'}`}
                        >
                            <h1
                                onClick={() => {
                                    setType('single');
                                    openByIndex(i);
                                }}
                                onMouseEnter={() => setActivePost(p._id)}
                                onMouseLeave={() => setActivePost(null)}
                                className={`transition-opacity duration-666 ${isActive || isHover ? 'opacity-100' : 'opacity-30'}`}
                            >
                                {p.title}
                            </h1>
                        </div>
                    );
                })}
            </nav>

            <Posts
                posts={posts}

                openPost={openPost}
                setOpenPost={setOpenPost}

                activePost={activePost}
                setActivePost={setActivePost}

                openIndex={openIndex}
            />
        </>
    );
}