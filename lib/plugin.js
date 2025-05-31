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
  replaceText: {},

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
            { label: "Hashnode Blog Address or url", type: "string" },
            { label: "No of blogs to retrieve", type: "string", value: this.constants.fetchCount }
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
        app.alert(`Failed to fetch posts from hashnode. Response: ${publications.message}`);
        return;
    }

    const publication = publications.data;
    const posts = publication.posts;

    for (const post of posts) {
        // Create minimal data structure for note creation
        const noteData = {
            title: post.title,
            content: post.content,
            tags: [this.constants.hashnodeConstants.mainTag, publication.title]
        };

        // Check if note exists using minimal data
        const existingNote = await app.findNote({
            name: post.title,
            tag: noteData.tags
        });

        if (existingNote) {
            console.log("Post already synced, skipping");
            continue;
        }

        // Create note with minimal data
        const createdNote = await app.notes.create(noteData.title, noteData.tags);
        await app.insertNoteContent({uuid: createdNote.uuid}, noteData.content);

        console.log(`Post: ${post.title} is synced`);
    }

    console.log("Post sync done!");
}
}
export default plugin;
