import { listBase } from "./listBase.js";

export const listPage = {
  getInnerHTML(params) {
    return listBase({
      ...params,
    });
  }
};