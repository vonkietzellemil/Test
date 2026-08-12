import { StorageAPI } from "../../services/storage.js";

export const list = {
  create: {
    template: "list",
    getParams() {
      return {
        title: "List Title",
        
      }
    }
  },

  edit: {
    template: "list",
    getParams({ list }) {

      return {
        title: list?.name || "Error, couldn't load list successfully",

        list: list,
      }
    }
  },
};