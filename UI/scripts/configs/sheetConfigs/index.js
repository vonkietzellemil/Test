import { list } from "./list.js";

const test = {
  root: {
    type: "lists",
    getParams() {
      return {
        title: "Test Page",
      }
    }
  },
};

export const sheetConfigs = {
  list

  // test,
};