import { client } from "@/sanity/client";
import ArchivePage from "./archive";
import { archive_query } from "../queries/archive-query";

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