// lib/arbitrary-plugin-module.js
import { createClient } from "graphql-http";
var HASHNODE_GRAPHQL_URL = "https://gql.hashnode.com";
var client = createClient({
  url: HASHNODE_GRAPHQL_URL
});
var getHashnodePosts = (host, fetchType, count, slug) => {
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
`;
  if (fetchType !== "all") {
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
   `;
  }
  console.log("getHashnodePostsQuery", query);
  return new Promise((resolve, reject) => {
    let result;
    client.subscribe(
      {
        query
      },
      {
        next: (data) => result = data,
        error: reject,
        complete: () => resolve(result)
      }
    );
  });
};

// lib/plugin.js
var plugin = {
  // --------------------------------------------------------------------------------------
  constants: {},
  // --------------------------------------------------------------------------
  // https://www.amplenote.com/help/developing_amplenote_plugins#insertText
  insertText: {},
  // --------------------------------------------------------------------------
  // https://www.amplenote.com/help/developing_amplenote_plugins#noteOption
  noteOption: {
    "Hashnode Sync: Notes": {
      check: async function(app, noteUUID) {
        return true;
      },
      run: async function(app, noteUUID) {
        getHashnodePosts("bhavanichandra.hashnode.dev", "all", 10, null).then(
          (posts) => {
            console.log("getHashnodePosts", posts);
          }
        );
        await app.alert("You clicked `Hashnode Sync: Notes` option");
        console.log("Notes: ", noteUUID);
      }
    }
  },
  // --------------------------------------------------------------------------
  // https://www.amplenote.com/help/developing_amplenote_plugins#replaceText
  replaceText: {}
  // There are several other entry points available, check them out here: https://www.amplenote.com/help/developing_amplenote_plugins#Actions
  // You can delete any of the insertText/noteOptions/replaceText keys if you don't need them
};
var plugin_default = plugin;
export {
  plugin_default as default
};
