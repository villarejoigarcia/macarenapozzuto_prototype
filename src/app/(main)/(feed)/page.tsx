import { client } from "@/sanity/client";
import PostIndex from "./post-index";
import { POSTS_QUERY } from "../../queries/query";
import Wrapper from '../wrapper';
import PageTransition from '../page-transition';


const options = { next: { revalidate: 30 } };

export default async function IndexPage({

}) {

  const posts = await client.fetch(POSTS_QUERY, {}, options);

  return (
    <main>
          <PostIndex posts={posts} />
    </main>
  );
}