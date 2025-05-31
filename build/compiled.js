(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // lib/plugin.js
  var import_hashnode = __toESM(__require("hashnode"), 1);
  var plugin = {
    constants: {
      fetchCount: 10,
      apiKeyConst: "",
      hashnodeConstants: {
        apiKey: "",
        mainTag: `hashnode`
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
    replaceText: {},
    _initialize(app, hashnodeModule) {
      this.hashnodeModule = hashnodeModule || import_hashnode.default;
      if (app && app.settings["Hashnode API Key"]) {
        this.constants.hashnodeConstants.apiKey = app.settings["Hashnode API Key"];
      }
      this._hashnodeBlogAddress = "";
      this._count = this.constants.fetchCount;
    },
    async _syncAllPosts(app) {
      [this._hashnodeBlogAddress, this._count] = app.prompt("Hashnode Sync Options", {
        inputs: [
          { label: "Hashnode Blog Address or url", type: "string" },
          { label: "No of blogs to retrieve", type: "string", value: "10" }
        ]
      });
      const publications = await this.hashnodeModule.getAllPosts(this._hashnodeBlogAddress, parseInt(this._count));
      if (!publications.success) {
        app.alert(`Failed to fetch posts from hashnode. Response of api: ${publications.message}`);
        return;
      }
      const publication = publications.data;
      const publicationTitle = publication.title;
      const posts = publication.posts;
      for (const post of posts) {
        const tags = [this.constants.hashnodeConstants.mainTag, publicationTitle];
        let hashnodeNote = await app.findNote({ name: post.title, tag: tags });
        if (hashnodeNote) {
          hashnodeNote = await app.notes.find(hashnodeNote.uuid);
          console.log("Post already synced, skipping");
          continue;
        }
        if (post.series?.name) {
          tags.push(post.series.name);
        }
        hashnodeNote = await app.notes.create(post.title, tags);
        await app.insertNoteContent(hashnodeNote, post.content);
        console.log(`Post: ${post.title} is synced`);
      }
      const isAllPostsSynced = publication.totalDocuments === parseInt(this._count);
      const postsRemainingToSync = publication.totalDocuments - parseInt(this._count);
      const message = isAllPostsSynced ? "All Posts are synced" : `${postsRemainingToSync} posts are to be synced`;
      app.alert(`${this._count} posts are sync. ${message}`);
    }
  };
  var plugin_default = plugin;
})();
