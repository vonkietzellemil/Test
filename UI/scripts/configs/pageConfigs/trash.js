import { StorageAPI } from "../../services/storage.js";

export const trash = {
  root: {
    template: "lists",
    getParams() {
      return {
        title: "Trash",
        items: StorageAPI.getItemsByParentId("deleted"),
      }
    }
  },

  lists: {
    template: "lists",
    getParams() {
      return {
        title: "Trash",
        items: StorageAPI.getItemsByParentId("deleted"),
      }
    }
  },

  entries: {
    template: "lists",
    getParams() {
      return {
        title: "Trash",
        items: StorageAPI.getItemsByParentId("deleted"),
      }
    }
  },

  sections: {
    template: "list",
    getParams() {
      return {
        title: "Trash",
        items: StorageAPI.getItemsByParentId("deleted"),
      }
    }
  },
};