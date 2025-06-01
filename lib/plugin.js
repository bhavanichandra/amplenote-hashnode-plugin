// Copyright (c) 2025 Bhavani Chandra Vajapeyayaajula
// Licensed under the MIT License

import * as hashnode from "./hashnode.js"

const plugin = {
  constants: {
    fetchCount: 10,
    apiKeyConst: "",
    hashnodeConstants: {
      apiKey: '',
      mainTag: 'hashnode'
    }
  },
  hashnodeModule: undefined,
  appOption: {
    "Sync Posts": {
      run: async function (app) {
        this._initialize(app);
        await this._syncAllPosts(app);
      },
    }
  },
  _initialize(app, hashnodeModule) {
    this.hashnodeModule = hashnodeModule || hashnode;
    if (app?.settings['Hashnode API Key']) {
      this.constants.hashnodeConstants.apiKey = app.settings['Hashnode API Key'];
    }
  },
  async _syncAllPosts(app) {
    console.log("Started posts sync");
    const result = await app.prompt("Hashnode Sync Options", {
      inputs: [
        {label: "Hashnode Blog Address or url", type: "string"},
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
          `Failed to fetch posts from hashnode. Response: ${publications.message}`);
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
      await app.insertNoteContent({uuid: createdNote.uuid}, noteData.content);
      console.debug(`Post: ${post.title} is synced`);
    }
    console.debug("Post sync done!");
  }
}
export default plugin;
