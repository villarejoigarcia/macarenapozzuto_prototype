'use client';

import { useEffect, useState } from 'react';
import PostItem from './post-item';
import { getPostTop } from './functions/post-top';
import { useBlur } from '../../context/blur-context';

interface PostListProps {
  posts: any[];

  activePost: string | null;
  setActivePost: (id: string | null) => void;

  openPost: string | null;
  setOpenPost: (id: string | null) => void;

  openIndex: number | null;
  openByIndex: (index: number) => void;

  showFields: boolean;
  setShowFields: React.Dispatch<React.SetStateAction<boolean>>;

  fromIndex: boolean;
  setFromIndex: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PostList({
  posts,
  activePost,
  setActivePost,
  openPost,
  setOpenPost,
  openIndex,
  showFields,
  setShowFields,
  fromIndex,
  setFromIndex
}: PostListProps) {

  const { setType, type } = useBlur();

  useEffect(() => {
    if (type === '') {
      setShowFields(false);
    }
  }, [type]);

  useEffect(() => {
    if (!openPost) {
      setShowFields(false);
      // if (!fromIndex) {
      //   setType('');
      // }
      // setFromIndex(false);

    } else {
      setShowFields(false);
      // if (!fromIndex) {
      //   setType('');
      // }
      // setFromIndex(false);

    }
  }, [openPost]);



  // useEffect(() => {
  //   if (window.innerWidth >= 1024) return;

  //   const elements = Array.from(
  //     document.querySelectorAll<HTMLElement>('#feed [data-post]')
  //   );

  //   const onScroll = () => {
  //     const vh = window.innerHeight;
  //     const threshold = vh / 3;

  //     // Caso: inicio del scroll → primer post
  //     if (window.scrollY <= 0 && elements[0]) {
  //       const id = elements[0].dataset.postId;
  //       if (id) setActivePost(id);
  //       return;
  //     }

  //     // Caso: final del scroll → último post
  //     if (
  //       window.innerHeight + window.scrollY >=
  //       document.body.scrollHeight - 1
  //     ) {
  //       const last = elements[elements.length - 1];
  //       if (last) {
  //         const id = last.dataset.postId;
  //         if (id) setActivePost(id);
  //       }
  //       return;
  //     }

  //     // Caso normal: primer post cuyo centro supera el threshold
  //     for (const el of elements) {
  //       const rect = el.getBoundingClientRect();
  //       if (rect.top + rect.height / 2 >= threshold) {
  //         const id = el.dataset.postId;
  //         if (id) setActivePost(id);
  //         return;
  //       }
  //     }
  //   };

  //   onScroll();
  //   window.addEventListener('scroll', onScroll, { passive: true });
  //   window.addEventListener('resize', onScroll);

  //   return () => {
  //     window.removeEventListener('scroll', onScroll);
  //     window.removeEventListener('resize', onScroll);
  //   };
  // }, [posts, setActivePost]);



  useEffect(() => {
    if (window.innerWidth >= 1024) return;

    const feed = document.getElementById('feed');
    if (!feed) return;

    const elements = Array.from(
      feed.querySelectorAll<HTMLElement>('[data-post]')
    );

    const onScroll = () => {
      const vh = window.innerHeight;
      const scrollTop = window.scrollY;
      const threshold = vh / 3;

      // inicio del scroll → primer post
      if (scrollTop <= 0 && elements[0]) {
        const id = elements[0].dataset.postId;
        if (id) setActivePost(id);
        return;
      }

      // final del scroll → último post
      if (scrollTop + vh >= feed.scrollHeight - 1) {
        const last = elements[elements.length - 1];
        if (last) {
          const id = last.dataset.postId;
          if (id) setActivePost(id);
        }
        return;
      }

      // caso normal → primer post cuyo centro supera el threshold
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;

        if (centerY >= threshold) {
          const id = el.dataset.postId;
          if (id) setActivePost(id);
          return;
        }
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [posts, setActivePost]);



  return (
    // <section className="flex flex-col items-stretch overflow-hidden" id="feed">
    <section className="flex flex-col items-stretch" id="feed">
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

          showFields={showFields}
        />

      ))}

      <button
        className={`cursor-pointer fixed lg:top-(--kv) top-auto lg:bottom-auto bottom-(--kv) lg:left-1/2 left-3/5 z-50 transition-opacity duration-500 ${openPost && type !== 'about' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => {
          // setShowFields(v => !v)
          if (showFields === true) {
            setType('');
            setShowFields(false);
          } else {
            setType('single');
            setShowFields(true);
          }
          // setType(prev => (prev === 'single' ? '' : 'single'));
        }}
      >
        {/* {showFields ? 'Info -' : 'Info +'} */}
        Info
      </button>

      <button
        className={`cursor-pointer fixed lg:top-(--kv) top-auto lg:bottom-auto bottom-(--kv) right-(--kv) z-50 transition-opacity duration-500 ${openPost && type !== 'about' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => {
          setOpenPost(null);
          setType('');
          window.history.pushState({}, '', '/');
        }}
      >
        Close
      </button>

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