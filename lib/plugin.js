import {getHashnodePosts} from "./arbitrary-plugin-module"

// --------------------------------------------------------------------------------------
// API Reference: https://www.amplenote.com/help/developing_amplenote_plugins
// Tips on developing plugins: https://www.amplenote.com/help/guide_to_developing_amplenote_plugins
const plugin = {
  // --------------------------------------------------------------------------------------
  constants: {},

  // --------------------------------------------------------------------------
  // https://www.amplenote.com/help/developing_amplenote_plugins#insertText
  insertText: {},

  // --------------------------------------------------------------------------
  // https://www.amplenote.com/help/developing_amplenote_plugins#noteOption
  noteOption: {
    "Hashnode Sync: Notes": {
      check: async function (app, noteUUID) {
        return true;
      },
      run: async function (app, noteUUID) {
        const host = app.settings['Blog Host Name'];
        const result = await app.prompt("Enter no of blogs to fetch", {
          inputs: [
            {label: "Count", value: "10", type: "string"},
          ]
        });
        let count = 10;
        if (result) {
          console.log('interactivity result: ', result);
        }
        getHashnodePosts(host, "all", count, null).then(
            posts => {
              console.log('getHashnodePosts', posts);
            })
        await app.alert("You clicked `Hashnode Sync: Notes` option");
        console.log('Notes: ', noteUUID);
      }
    }
  },

  // --------------------------------------------------------------------------
  // https://www.amplenote.com/help/developing_amplenote_plugins#replaceText
  replaceText: {},

  // There are several other entry points available, check them out here: https://www.amplenote.com/help/developing_amplenote_plugins#Actions
  // You can delete any of the insertText/noteOptions/replaceText keys if you don't need them
};
export default plugin;
