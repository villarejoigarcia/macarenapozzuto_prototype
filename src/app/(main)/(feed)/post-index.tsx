'use client';

import { useState, useEffect } from 'react';
import Posts from './post-list';
import { useBlur } from '../../context/blur-context';

interface PostIndexProps {
    posts: any[];
}

export default function PostIndex({ posts }: PostIndexProps) {

    const [openPost, setOpenPost] = useState<string | null>(null);
    const [activePost, setActivePost] = useState<string | null>(null);
    const [showOverflow, setShowOverflow] = useState(false);
    const [openList, setOpenList] = useState(false);
    const [showFields, setShowFields] = useState(false);

    const { setType, type } = useBlur();

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

    const [fromIndex, setFromIndex] = useState(false);

    return (
        <>
            <Posts
                posts={posts}

                openPost={openPost}
                setOpenPost={setOpenPost}

                activePost={activePost}
                setActivePost={setActivePost}

                openIndex={openIndex}
                openByIndex={openByIndex}

                showFields={showFields}
                setShowFields={setShowFields}

                fromIndex={fromIndex}
                setFromIndex={setFromIndex}

            />

            {/* index */}
            <nav
                className={`fixed lg:left-1/3 left-(--kv) lg:top-(--kv) top-auto lg:bottom-auto bottom-(--kv) z-50 transition-all duration-500 flex flex-col justify-end
                    ${showOverflow ? 'overflow-visible' : 'overflow-hidden'}
                    ${type === 'about' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onMouseEnter={() => {
                    if (isMobile) return;
                    setOpenList(true);
                    if (showFields) return;
                    setType('single');
                }}
                onMouseLeave={() => {
                    if (isMobile) return;
                    setOpenList(false);
                    if (showFields) return;
                    setType('')
                }}
            >

                {posts.map((p, i) => {
                    const isActive = i === openIndex;
                    const isHover = activePost === p._id;

                    return (
                        <div
                            key={p._id}
                            className={`cursor-pointer box-content transition-height duration-666 ${isActive || openList ? 'h-(--lh) opacity-100 lg:pb-(--kv) lg:pt-0 pt-(--kv) last:pb-0' : 'h-0 pb-0 opacity-0'}`}
                            onClick={() => {
                                if (isMobile) return;
                                // setType('single');
                                openByIndex(i);
                                // setFromIndex(true);
                            }}
                        >
                            <h1
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

        </>
    );
}