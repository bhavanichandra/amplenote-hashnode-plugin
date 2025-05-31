import {mockAppWithContent, mockPlugin} from "./test-helpers.js"

// --------------------------------------------------------------------------------------
describe("This here plugin", () => {
  const plugin = mockPlugin();
  plugin.constants.isTestEnvironment = true;

  it("should run some tests", async () => {
    const {app, note} = mockAppWithContent(`Hello World!`);
    await plugin.appOption["Sync Posts"].run(app);
  })
});
