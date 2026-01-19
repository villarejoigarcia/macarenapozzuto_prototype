export const POSTS_QUERY = `*[_type=="post" && defined(slug.current)] | order(order asc)[] {_id, title, year, slug, images, cover, categories[]->{title}, publishedAt}`;
