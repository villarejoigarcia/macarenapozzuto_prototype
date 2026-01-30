export const POSTS_QUERY = `*[_type=="post" && defined(slug.current)] | order(order asc)[] {_id, title, year, slug, images, description, credits, cover, categories[]->{title}, publishedAt}`;
