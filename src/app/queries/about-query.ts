export const ABOUT_QUERY = `*[_type == "about"] | order(_updatedAt desc)[0] {..., services[]->{_id, title}}`;
