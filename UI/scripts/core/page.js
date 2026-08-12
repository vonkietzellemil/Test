class PageStack {

  constructor(container) {
    if (typeof container === "object") {
      this.container = container;
    } else if (container) {
      this.container = document.querySelector(container);
    } else {
      return;
    }
    

    this.stack = [];
    this.isTransitioning = false;
  }

  static get templates() { return "pageTemplates" }
  static get configs() { return pageConfigs }
  
  get top() { return this.stack[this.stack.length - 1] || null; }
  get prev() { return this.stack[this.stack.length - 2] || null; }

  newPage({
    config,
    context,
    animation=true
  }) {

    return this.createPage({ pageTemplate: config.template, params: config.getParams(context), animation });
  }
  
  createPage({ pageTemplate, params, animation=true }) {

    const newPage = document.createElement("div");
    newPage.classList.add("page");


    const page = this.templates[pageTemplate];


    newPage.innerHTML = page.getInnerHTML(params);


    this.container.appendChild(newPage);


    this.push(newPage, animation);


    if (page.init) {
      page.init({
        page: newPage,
        params
      });
    }


    return newPage;
  }

  push(pageEl, animation=true) { 

    this.stack.push(pageEl);

    const previousPage = this.prev;

    previousPage?.classList.add("page-behind");

    if (!animation) return;
    this.isTransitioning = true;

    pageEl.classList.add("page-enter");
    
    requestAnimationFrame(() => {
      pageEl.classList.add("page-enter-active");
    });

    setTimeout(() => {
      this.isTransitioning = false;

      pageEl.classList.remove("page-enter", "page-enter-active");
    }, 300);
  }

  pop(animation=true) {

    if (this.isTransitioning) return;

    const currentPage = this.top;
    const previousPage = this.prev;

    currentPage.style.transform = "";
    if (previousPage) previousPage.style.transform = "";
    
    if (animation) {
      this.isTransitioning = true;

      currentPage.classList.add("page-exit-active");
      previousPage.classList.add("page-return");

      setTimeout(() => {
        previousPage.classList.remove(
          "page-behind",
          "page-return"
        );
      }, 300);

      setTimeout(() => {
        currentPage.remove();
        this.stack.pop();
        this.isTransitioning = false;
      }, 300);
    } else {
      currentPage.remove();
      this.stack.pop();
    }
    
  }

  clear() {
    this.stack.forEach(() => this.pop(false));      
  }

  snapBack() {
    const currentPage = this.top;
    const previousPage = this.prev;

    currentPage.style.transform = "";
    previousPage.style.transform = "";

    currentPage.classList.add("page-enter-active")
    previousPage.classList.add("page-behind")

    setTimeout(() => {
      currentPage.classList.remove("page-enter-active")
    }, 300);
  }
}


const pageInstance = new PageStack("", {});
