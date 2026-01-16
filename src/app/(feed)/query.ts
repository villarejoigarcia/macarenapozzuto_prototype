export const POSTS_QUERY = `*[_type=="post" && defined(slug.current)]|order(order asc)[0...12]{_id, title, year, slug, images, cover, categories[]->{title}, publishedAt}`;
