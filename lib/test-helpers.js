import dotenv from "dotenv"
import { jest } from "@jest/globals"
import fetch from "isomorphic-fetch"
import pluginObject from "./plugin"

dotenv.config();

// --------------------------------------------------------------------------------------
export const mockPlugin = () => {
  const plugin = pluginObject;
  global.fetch = fetch; // So tests can run "fetch" without importing this module & later fouling up esbuild

  // Whatever entry point/actions you will implement should be included in this array
  [ "insertText", "noteOption", "replaceText" ].forEach(entryPointKey => {
    if (plugin[entryPointKey]) {
      Object.entries(plugin[entryPointKey]).forEach(([ functionName, checkAndRunOrFunction ]) => {
        if (checkAndRunOrFunction.check || checkAndRunOrFunction.run) {
          if (checkAndRunOrFunction.check) {
            plugin[entryPointKey][functionName].check = plugin[entryPointKey][functionName].check.bind(plugin);
          }
          if (checkAndRunOrFunction.run) {
            plugin[entryPointKey][functionName].run = plugin[entryPointKey][functionName].run.bind(plugin);
          }
        } else {
          plugin[entryPointKey][functionName] = plugin[entryPointKey][functionName].bind(plugin); // .insertText
        }
      });
    }
  });

  return plugin;
}

// --------------------------------------------------------------------------------------
export const mockAppWithContent = noteContent => {
  const note = mockNote(noteContent, "Baby's first plugin", "abc123");
  const app = mockApp(note);
  return { app, note };
}

// --------------------------------------------------------------------------------------
export const mockApp = seedNote => {
  const app = {};
  app.alert = jest.fn().mockImplementation(async (text, options = {}) => {
    console.debug("Alert was called", text);
  });
  app.context = {};
  app.context.noteUUID = "abc123";
  app.context.replaceSelection = jest.fn();
  app.context.replaceSelection.mockImplementation(async (newContent, sectionObject = null) => {
    await seedNote.replaceContent(newContent, sectionObject);
  });
  app.createNote = jest.fn();
  app.getNoteContent = jest.fn();
  app.insertNoteContent = jest.fn().mockImplementation(async (noteHandle, content, { atEnd = false } = {}) => {
    if (atEnd) {
      seedNote.body += content;
    } else {
      seedNote.body = `${ content }${ seedNote.body }`;
    }
  })
  app.prompt = jest.fn().mockImplementation(async (text, options = {}) => {
    console.error("Prompting user", text, "You probably wanted to mock this so it would respond?");
  });
  app.navigate = jest.fn();
  app.notes = {};
  app.notes.find = jest.fn().mockResolvedValue(null);
  app.notes.filter = jest.fn().mockResolvedValue(null);
  app.replaceNoteContent = jest.fn().mockImplementation(async (noteHandle, content, { section = null } = {}) => {
    if (section) {
      console.error("Todo: Implement section replacement in mockApp.replaceNoteContent");
    }
    seedNote.body = content;
  });
  app.settings = {};

  if (seedNote) {
    const noteFunction = jest.fn();
    noteFunction.mockImplementation(noteHandle => {
      if (noteHandle === seedNote.uuid) {
        return seedNote;
      }
      return null;
    });
    const getContent = jest.fn();
    getContent.mockImplementation(noteHandle => {
      if (noteHandle.uuid === seedNote.uuid) {
        return seedNote.content();
      }
      return null;
    });

    app.findNote = noteFunction;
    app.notes.find = noteFunction;
    app.getNoteContent = getContent;
  }

  return app;
}

// --------------------------------------------------------------------------------------
// Call this in order to accept the default option in an alert that would be shown to user
export function mockAlertAccept(app) {
  app.alert = jest.fn();
  app.alert.mockImplementation(async (text, options) => {
    if (!options) return null;
    return -1;
  });
}

// --------------------------------------------------------------------------------------
export const mockNote = (content, name, uuid) => {
  const note = {};
  note.body = content;
  note.name = name;
  note.uuid = uuid;
  note.content = () => note.body;

  // --------------------------------------------------------------------------------------
  note.insertContent = async (newContent, options = {}) => {
    if (options.atEnd) {
      note.body += newContent;
    } else {
      note.body = `${ note.body }\n${ newContent }`;
    }
  }

  // --------------------------------------------------------------------------------------
  note.replaceContent = async (newContent, sectionObject = null) => {
    if (sectionObject) {
      const sectionHeadingText = sectionObject.section.heading.text;
      let throughLevel = sectionObject.section.heading?.level;
      if (!throughLevel) throughLevel = sectionHeadingText.match(/^#*/)[0].length;
      if (!throughLevel) throughLevel = 1;

      const indexes = Array.from(note.body.matchAll(/^#+\s*([^#\n\r]+)/gm));
      const sectionMatch = indexes.find(m => m[1].trim() === sectionHeadingText.trim());
      let startIndex, endIndex;
      if (!sectionMatch) {
        throw new Error(`Could not find section ${ sectionHeadingText } that was looked up. This might be expected`);
      } else {
        const level = sectionMatch[0].match(/^#+/)[0].length;
        const nextMatch = indexes.find(m => m.index > sectionMatch.index && m[0].match(/^#+/)[0].length <= level);
        endIndex = nextMatch ? nextMatch.index : note.body.length;
        startIndex = sectionMatch.index + sectionMatch[0].length + 1;
      }

      if (Number.isInteger(startIndex)) {
        const revisedContent = `${ note.body.slice(0, startIndex) }${ newContent.trim() }\n${ note.body.slice(endIndex) }`;
        note.body = revisedContent;
      } else {
        throw new Error(`Could not find section ${ sectionObject.section.heading.text } in note ${ note.name }`);
      }
    } else {
      note.body = newContent;
    }
  };

  // --------------------------------------------------------------------------------------
  note.sections = async () => {
    const headingMatches = note.body.matchAll(/^#+\s*([^\n]+)/gm);
    return Array.from(headingMatches).map(match => ({
      anchor: match[1].replace(/\s/g, "_"),
      level: /^#+/.exec(match[0]).length,
      text: match[1],
    }));
  }
  return note;
}
