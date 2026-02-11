// export const archive_query = `*[_type == "archive"] | order(_createdAt desc) {
//   _id,
//   title,
//   images[]{
//     asset->{
//       url
//     }
//   }
// }`;

export const archive_query = `
(
  *[_type == "archive"].images[]{
      _type,
      asset->{
        url
      },
      title
    }
)
+
(
  *[_type == "post"]{
    images[]{
      _type,
      asset->{
        url
      },
      title
    }
  }
)
+
(
  *[_type == "post" && defined(cover)].cover{
    _type,
    asset->{
      url
    },
    title
  }
)
`;