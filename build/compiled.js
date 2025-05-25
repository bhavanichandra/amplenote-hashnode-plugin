(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });

  // lib/arbitrary-plugin-module.js
  var import_client = __require("@apollo/client");
  var HASHNODE_GRAPHQL_URL = "https://gql.hashnode.com";
  var client = new import_client.ApolloClient({
    uri: HASHNODE_GRAPHQL_URL,
    cache: new import_client.InMemoryCache()
  });
  var getHashnodePosts = async (host, fetchType, count, slug) => {
    let query = import_client.gql`
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
`;
    if (fetchType !== "all") {
      query = import_client.gql`
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
   `;
    }
    const result = await client.query({
      query
    });
    console.log(result);
    return result;
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
      "Baby's first Note Option command": {
        check: async function(app, noteUUID) {
          const noteContent = await app.getNoteContent({ uuid: noteUUID });
          return /cool/i.test(noteContent.toLowerCase());
        },
        run: async function(app, noteUUID) {
          await app.alert(
            "You clicked the Baby's first Note Option command in a COOL note!"
          );
          getHashnodePosts("bhavanichandra.hashnode.dev", "all", 10, null).then(
            (posts) => {
              console.log("getHashnodePosts", posts);
            }
          );
          console.debug("Special message to the DevTools console");
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
})();
