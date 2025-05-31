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
    if (app && app.settings['Hashnode API Key']) {
      this.constants.hashnodeConstants.apiKey = app.settings['Hashnode API Key'];
    }
  },
  async _syncAllPosts(app) {
    console.log('Started posts sync');
    const result = await app.prompt("Hashnode Sync Options", {
      inputs: [
        { label: "Hashnode Blog Address or url", type: 'string' },
        { label: "No of blogs to retrieve", type: 'string', value: this.constants.fetchCount },
      ]
    })
    if (!result) {
      app.alert("Sync cancelled!");
      return;
    }
    const [hashnodeBlogAddress, postFetchCount] = result;
    console.log('Got the inputs', hashnodeBlogAddress, postFetchCount);
    const publications = await this.hashnodeModule.getAllPosts(hashnodeBlogAddress, parseInt(postFetchCount));
    if (!publications.success) {
      app.alert(`Failed to fetch posts from hashnode. Response of api: ${publications.message}`)
      return;
    }
    console.log('Publications fetched:', publications);
    const publication = publications.data;
    const publicationTitle = publication.title;
    const posts = publication.posts;
    for (const post of posts) {
      const tags = [this.constants.hashnodeConstants.mainTag, publicationTitle];
      let hashnodeNote = await app.findNote({ name: post.title, tag: tags });
      if (hashnodeNote) {
        hashnodeNote = await app.notes.find(hashnodeNote.uuid)
        console.log('Post already synced, skipping');
        continue;
      }
      if (post.series?.name) {
        tags.push(post.series.name)
      }
      console.log('Creating new note');
      hashnodeNote = await app.notes.create(post.title, tags)

      // Move to note

      if (app.context.noteUUID !== hashnodeNote.uuid) {
        let origin;
        try {
          origin = window.location.origin.includes("localhost") ? "http://localhost:3000" : window.location.origin.replace("plugins", "www");
        } catch (err) {
          if (err.name === "TypeError") {
            throw (new Error(`${err.message} (line (74)`));
          }
        }
        const navigateUrl = `${origin}/notes/${dashboardNote.uuid}`;
        console.log('Navigating to ', navigateUrl);
        
        await app.navigate(navigateUrl);
      }
      
      // Write to note
      await app.insertNoteContent(hashnodeNote, post.content);
      console.log(`Post: ${post.title} is synced`);
    }
    const isAllPostsSynced = publication.totalDocuments === parseInt(postFetchCount);
    const postsRemainingToSync = publication.totalDocuments - parseInt(postFetchCount);
    const message = isAllPostsSynced ? 'All Posts are synced' : `${postsRemainingToSync} posts are to be synced`
    app.alert(`${postFetchCount} posts are sync. ${message}`)
  }
}
export default plugin;
