(() => {
  // lib/arbitrary-plugin-module.js
  var HASHNODE_GRAPHQL_URL = "https://gql.hashnode.com";
  var getHashnodePosts = async (host, count) => {
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
      }`;
      const params = {
        host,
        count
      };
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
          const host = app.settings["Blog Host Name"];
          const result = await app.prompt("Enter no of blogs to fetch", {
            inputs: [
              { label: "Count", value: "10", type: "string" }
            ]
          });
          let count = 10;
          if (result) {
            console.log("interactivity result: ", result);
          }
          getHashnodePosts(host, count).then(
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
