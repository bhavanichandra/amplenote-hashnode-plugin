(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // lib/hashnode.js
  var hashnode_exports = {};
  __export(hashnode_exports, {
    getAllPosts: () => getAllPosts
  });
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
                slug
                series {
                  name
                  slug
                }
                content {
                  markdown
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
      console.dir(responseJson);
      return responseJson;
    } catch (error) {
      console.error(error);
      return {};
    }
  };
  var getAllPosts = async (host, count) => {
    const publicationsResponse = await getHashnodePosts(host, count);
    if (!publicationsResponse.data) {
      return {
        message: `No publications found for the host ${host}`,
        success: false
      };
    }
    const posts = publicationsResponse.data.publication.posts.edges.map((edge) => {
      return {
        id: edge.node.id,
        title: edge.node.title,
        slug: edge.node.slug,
        series: edge.node.series,
        brief: edge.node.brief,
        url: edge.node.url,
        content: edge.node.content.markdown
      };
    });
    return {
      success: true,
      data: {
        title: publicationsResponse.data.publication.title,
        posts,
        totalDocuments: publicationsResponse.data.publication.posts.totalDocuments
      }
    };
  };

  // lib/plugin.js
  var plugin = {
    constants: {
      fetchCount: 10,
      apiKeyConst: "",
      hashnodeConstants: {
        apiKey: "",
        mainTag: "hashnode"
      }
    },
    hashnodeModule: void 0,
    appOption: {
      "Sync Posts": {
        run: async function(app) {
          this._initialize(app);
          await this._syncAllPosts(app);
        }
      }
    },
    _initialize(app, hashnodeModule) {
      this.hashnodeModule = hashnodeModule || hashnode_exports;
      if (app?.settings["Hashnode API Key"]) {
        this.constants.hashnodeConstants.apiKey = app.settings["Hashnode API Key"];
      }
    },
    async _syncAllPosts(app) {
      console.log("Started posts sync");
      const result = await app.prompt("Hashnode Sync Options", {
        inputs: [
          { label: "Hashnode Blog Address or url", type: "string" },
          {
            label: "No of blogs to retrieve",
            type: "string",
            value: this.constants.fetchCount
          }
        ]
      });
      if (!result) {
        app.alert("Sync cancelled!");
        return;
      }
      const [hashnodeBlogAddress, postFetchCount] = result;
      const publications = await this.hashnodeModule.getAllPosts(
        hashnodeBlogAddress,
        parseInt(postFetchCount)
      );
      if (!publications.success) {
        app.alert(
          `Failed to fetch posts from hashnode. Response: ${publications.message}`
        );
        return;
      }
      const publication = publications.data;
      const posts = publication.posts;
      for (const post of posts) {
        const noteData = {
          title: post.title,
          content: post.content,
          tags: [this.constants.hashnodeConstants.mainTag, publication.title]
        };
        const existingNote = await app.findNote({
          name: post.title,
          tag: noteData.tags
        });
        if (existingNote) {
          console.debug("Post already synced, skipping", post.title);
          continue;
        }
        const createdNote = await app.notes.create(noteData.title, noteData.tags);
        await app.insertNoteContent({ uuid: createdNote.uuid }, noteData.content);
        console.debug(`Post: ${post.title} is synced`);
      }
      console.debug("Post sync done!");
    }
  };
  var plugin_default = plugin;
})();
