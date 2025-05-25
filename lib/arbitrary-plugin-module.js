import {createClient} from 'graphql-http';

const HASHNODE_GRAPHQL_URL = "https://gql.hashnode.com"

const client = createClient({
  url: HASHNODE_GRAPHQL_URL
})

export const getHashnodePosts = (host, fetchType, count, slug) => {
  let query = `
  {
    publication(host: "${host}") {
      title
      posts(first: ${count}) {
        edges {
          node {
            id
            title
            brief
            url
            content {
              html
            }
          }
        }
      }
    }
  }
`
  if (fetchType !== 'all') {
    query = `
     {
      publication(host: "${host}") {
        post(slug: "${slug}") {
            id
            slug
            title
            author {
              name
            }
            content {
              markdown
            }
        }
      }
    }
   `
  }

  console.log('getHashnodePostsQuery', query)
  return new Promise((resolve, reject) => {
    let result;
    client.subscribe(
        {
          query: query,
        },
        {
          next: (data) => (result = data),
          error: reject,
          complete: () => resolve(result),
        },
    );
  });
}
