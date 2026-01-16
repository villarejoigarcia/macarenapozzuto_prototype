'use client';

import { useState, useEffect } from 'react';
import PostItem from './post-item';

export default function PostList({ posts }: { posts: any[] }) {

  const [activePost, setActivePost] = useState<string | null>(null);
  const [openPost, setOpenPost] = useState<string | null>(null);
  
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

  return (
    <section className="flex flex-col items-stretch overflow-hidden" id="feed">
      {posts.map((post, index) => (
        <PostItem
          key={post._id}
          post={post}
          index={index}

          activePost={activePost}
          setActivePost={setActivePost}

          openPost={openPost}
          setOpenPost={setOpenPost}

          openIndex={openIndex}
          getScrollTopForPost={getScrollTopForPost}
        />
      ))}
    </section>
  );
}

  function getScrollTopForPost(
    index: number,
    openIndex: number | null
  ) {
    const close = 27.5;
    const open = 75;

    let scrollVh = 0;

    for (let i = 0; i < index; i++) {
      scrollVh += i === openIndex ? open : close;
    }

    return (scrollVh / 100) * window.innerHeight;
    
  }

// 'use client';

// import { useEffect, useState } from 'react';
// import PostItem from './post-item';

// export default function PostListInfinite({ posts }: { posts: any[] }) {
//   const displayPosts = [...posts, ...posts];

//   const [activePost, setActivePost] = useState<string | null>(null);
//   const [openPost, setOpenPost] = useState<string | null>(null);

//   const openIndex =
//     openPost === null
//       ? null
//       : posts.findIndex(post => post._id === openPost);

//   useEffect(() => {
//     const handleScroll = () => {
//       const firstCopyHeight = document.body.scrollHeight / 2;
//       if (window.scrollY >= firstCopyHeight) {
//         window.scrollTo(0, window.scrollY - firstCopyHeight);
//       } else if (window.scrollY <= 0) {
//         window.scrollTo(0, window.scrollY + firstCopyHeight);
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     if (openPost) document.body.style.overflow = 'hidden';
//     else document.body.style.overflow = '';
//   }, [openPost]);

//   const getScrollTopForPost = (index: number, openIndex: number | null) => {
//     const close = 27.5;
//     const open = 75;
//     let scrollVh = 0;
//     for (let i = 0; i < index; i++) {
//       scrollVh += i === openIndex ? open : close;
//     }
//     return (scrollVh / 100) * window.innerHeight;
//   };

//   return (
//     <section className="flex flex-col items-stretch overflow-visible" id="feed">
//       {displayPosts.map((post, index) => (
//         <PostItem
//           key={`${post._id}-${index}`}
//           post={post}
//           index={index % posts.length}
//           activePost={activePost}
//           setActivePost={setActivePost}
//           openPost={openPost}
//           setOpenPost={setOpenPost}
//           openIndex={openIndex}
//           getScrollTopForPost={getScrollTopForPost}
//         />
//       ))}
//     </section>
//   );
// }