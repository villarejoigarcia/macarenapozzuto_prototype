import { client } from "@/sanity/client";
import ArchivePage from "./archive";
import { archive_query } from "../../queries/archive-query";
import Transition from '../transition';
import Wrapper from '../wrapper';
import PageTransition from '../page-transition';

const options = { next: { revalidate: 30 } };

export default async function Archive({

}) {

  const archive = await client.fetch(archive_query, {}, options);

  return (
    <main>
          <ArchivePage data={archive} />
    </main>
  );
}