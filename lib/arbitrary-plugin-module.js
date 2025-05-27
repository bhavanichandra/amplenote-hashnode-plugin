const HASHNODE_GRAPHQL_URL = "https://gql.hashnode.com"

export const getHashnodePosts = async (host, fetchType, count, slug) => {
  try {
    let query = `
  query Publication($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
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
`;
    let params = {
      host: host,
      count: count,
    }
    if (fetchType !== 'all') {
      query = `
  query Publication($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
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
`;
      params = {
        host: host,
        slug: slug,
      }
    }

    const response = await fetch(HASHNODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: params,
      })
    });
    const responseJson = await response.json();
    console.log(responseJson);
    return responseJson;
  } catch (error) {
    console.error(error);
    return {};
  }

}
