const HASHNODE_GRAPHQL_URL = "https://gql.hashnode.com"

export const getHashnodePosts = async (host, count) => {
  try {
    const query = `query Publication($host: String!, $count: Int!) {
        publication(host: $host) {
          title
          posts(first: $count) {
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
            totalDocuments
          }
        }
      }`
    const params = {
      host: host,
      count: count,
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
