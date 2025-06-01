import {jest} from '@jest/globals'
import {mockApp, mockNote, mockPlugin} from "../lib/test-helpers.js"
import {mockHashnodePublications} from "./mock-hashnode-posts.js";

describe("Hashnode Plugin", () => {
  const plugin = mockPlugin();

  it("Sync posts from hashnode based on provided prompts", async () => {

    const note = mockNote("", "test-note", "test123");
    const app = mockApp(note);
    const host = 'blog.hashnode.dev';
    const count = 10;
    app.prompt = jest.fn().mockImplementation(async (text, options = {}) => {
      console.debug("prompt was called", text);
      return [host, count];
    })
    global.fetch = jest.fn().mockImplementation(async () => {
      console.log('Calling fake fetch')
      return {
        json: () => Promise.resolve(mockHashnodePublications)
      }
    })
    await plugin.appOption['Sync Posts'].run(app);
    expect(global.fetch).toHaveBeenCalled();
  })
});
