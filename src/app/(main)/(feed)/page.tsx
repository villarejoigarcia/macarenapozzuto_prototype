import { client } from "@/sanity/client";
import PostIndex from "./post-index";
import { POSTS_QUERY } from "../../queries/query";
import Blur from '../../components/blur';

const options = { next: { revalidate: 30 } };

export default async function IndexPage({

}) {

  const posts = await client.fetch(POSTS_QUERY, {}, options);

  return (
    <>
    <main>
      <Blur/>
        <PostIndex posts={posts} />
    </main>
  
    </>
  );
}