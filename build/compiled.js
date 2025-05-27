(() => {
  // lib/arbitrary-plugin-module.js
  var HASHNODE_GRAPHQL_URL = "https://gql.hashnode.com";
  var getHashnodePosts = async (host, fetchType, count, slug) => {
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
        host,
        count
      };
      if (fetchType !== "all") {
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
          host,
          slug
        };
      }
      const response = await fetch(HASHNODE_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query,
          variables: params
        })
      });
      const responseJson = await response.json();
      console.log(responseJson);
      return responseJson;
    } catch (error) {
      console.error(error);
      return {};
    }
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
})();
