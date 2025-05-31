const HASHNODE_GRAPHQL_URL = "https://gql.hashnode.com"

const getHashnodePosts = async (host, count) => {
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
                slug
                series {
                  name
                  slug
                }
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

export const getAllPosts =  async (host, count) => {
  const publicationsResponse = await getHashnodePosts(host, count);
  if (!publicationsResponse.data) {
    return {
      message: `No publications found for the host ${host}`,
      success: false
    }
  }
  const posts = publicationsResponse.data.publication.posts.edges.map(edge => {
    return {
      id: edge.node.id,
      title: edge.node.title,
      slug: edge.node.slug,
      series: edge.node.series,
      brief: edge.node.brief,
      url: edge.node.url,
      content: edge.node.content.markdown,
    };
  });
  return {
    success: true,
    data: {
      title: publicationsResponse.data.publication.title,
      posts: posts,
      totalDocuments: publicationsResponse.data.publication.posts.totalDocuments,
    }
  };
}

