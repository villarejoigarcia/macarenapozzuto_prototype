'use client';

import PostItem from './post-item';
import { getPostTop } from './functions/post-top';

interface PostListProps {
  posts: any[];

  activePost: string | null;
  setActivePost: (id: string | null) => void;

  openPost: string | null;
  setOpenPost: (id: string | null) => void;

  openIndex: number | null;
}

export default function PostList({
  posts,
  activePost,
  setActivePost,
  openPost,
  setOpenPost,
  openIndex,
}: PostListProps) {
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
          getPostTop={getPostTop}
        />
      ))}
    </section>
  );
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