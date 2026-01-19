// import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import PostIndex from "./post-index";
import { POSTS_QUERY } from "../../queries/query";
// import { ABOUT_QUERY } from "./about-query";
// import About from './about';

const options = { next: { revalidate: 30 } };

export default async function IndexPage({

}) {
  
  const posts = await client.fetch(POSTS_QUERY, {}, options);
  // const aboutData = await client.fetch(ABOUT_QUERY, {}, options);
  
  // const isAboutOpen = searchParams.about === 'true';

  return (
    <main>
      <PostIndex posts={posts} />
      {/* {isAboutOpen && aboutData && <About data={aboutData} />} */}
    </main>
  );
}