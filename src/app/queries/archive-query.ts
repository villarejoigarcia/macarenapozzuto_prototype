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
    asset->{
      url
    }
  }
)
+
(
  *[_type == "post"].images[]{
    asset->{
      url
    }
  }
)
  +
(
  *[_type == "post" && defined(cover)]{
    "asset": cover.asset->{
      url
    }
  }
)
`;