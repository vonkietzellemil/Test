import { lists } from "./lists.js"
import { archive } from "./archive.js"
import { trash } from "./trash.js"

import { list } from "./list.js"
import { settings } from "./settings.js"

const test = {
  root: {
    template: "lists",
    getParams() {
      return {
        title: "Test Page",
      }
    }
  },
};

export const pageConfigs = {
  lists,
  archive,
  trash,
  list,
  settings,

  test,
};