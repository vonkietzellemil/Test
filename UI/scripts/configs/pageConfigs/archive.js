import { StorageAPI } from "../../services/storage.js";

export const archive = {
  root: {
    template: "lists",
    getParams() {
      return {
        title: "Archive",
        items: StorageAPI.getItemsByParentId("archive"),
      }
    }
  },
};