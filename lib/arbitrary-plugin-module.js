import {ApolloClient, gql, InMemoryCache} from '@apollo/client'

const HASHNODE_GRAPHQL_URL = "https://gql.hashnode.com"

const client = new ApolloClient({
  uri: HASHNODE_GRAPHQL_URL,
  cache: new InMemoryCache(),
})

export const getHashnodePosts = async (host, fetchType, count, slug) => {
  let query = gql`
  {
    publication(host: ${host}) {
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
    query = gql`
     {
      publication(host: ${host}) {
        post(slug: ${slug}) {
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

  const result = await client.query({
    query: query
  })
  console.log(result)
  return result
}
