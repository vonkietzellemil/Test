import { StorageAPI } from "../../services/storage.js";

export const lists = {
  root: {
    template: "lists",
    getParams() {
      return {
        title: "Lists",
        items: StorageAPI.getItemsByParentId("root"),
      }
    }
  },
};