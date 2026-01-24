export const archive_query = `*[_type == "archive"] | order(_createdAt desc) {
  _id,
  title,
  images[]{
    asset->{
      url
    }
  }
}`;