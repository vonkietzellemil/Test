export const list = {
  root: {
    template: "list",
    getParams(context) {
      
      const list = context.list;

      return {
        title: list.name,
      }
    }
  },
};