'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type PostContextValue = {
  openPost: string | null;
  activePost: string | null;
  type: string;
  setOpenPost: (id: string | null) => void;
  setActivePost: (id: string | null) => void;
  setType: (type: string) => void;
  closePost: () => void;
};

const PostContext = createContext<PostContextValue | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<string | null>(null);
  const [type, setType] = useState<string>('');

  const closePost = () => {
    setOpenPost(null);
    setActivePost(null);
    setType('');
    // window.history.pushState({}, '', '/');
  };

  return (
    <PostContext.Provider
      value={{
        openPost,
        activePost,
        type,
        setOpenPost,
        setActivePost,
        setType,
        closePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error('usePost must be used within PostProvider');
  return ctx;
}