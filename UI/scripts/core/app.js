const AppEl = document.getElementById("App");
const AppContent = document.getElementById("AppContent");
const pagesContainer = document.getElementById("pagesContainer");

const sidebar = document.getElementById("sidebar");
const allPages = document.querySelectorAll(".page");

const componentsPage = document.getElementById("componentsPage");


const pagesBackground = document.getElementById("pagesBackground");
const overlay = document.getElementById("pageOverlay");

import { state } from "../core/state.js"

import { pageConfigs } from "../configs/pageConfigs/index.js"

import { settingsPage } from "../templates/pageTemplates/settings.js";
import { listsPage } from "../templates/pageTemplates/lists.js";
import { listPage } from "../templates/pageTemplates/list.js";

const pageTemplates = {
  settings: settingsPage,
  lists: listsPage,
  list: listPage
};


import { sheetConfigs } from "../configs/sheetConfigs/index.js";


import { listSheet } from "../templates/sheetTemplates/list.js";

const sheetTemplates = {
  list: listSheet,
};



import { ui } from "../ui/index.js";
import { utils } from "../utils/index.js";
import { gestures } from "../gestures/index.js";

// ========================================================
// App:
//  Pages
//  Sheets
//  Gestures
// ========================================================

export const VIEWS = {
  root: {
    parent: {
     view: "root",
     id: null,
    },
    
    page: pageConfigs.lists.root,
  },

  archive: {
    page: {
      type: "lists",
      getParams() {
        return {
          title: "Archive",
        };
      },
    },
  },
  deleted: {
    page: {
      type: "lists",
      getParams() {
        return {
          title: "Trash",
        };
      },
    },
  },


  singleList: {
    page: {
      type: "list",
      getParams() {
        return {
          title: "Single List",
        };
      },
    },
  },
};

export const App = {
  pages: {
    templates: pageTemplates,
    configs: pageConfigs,
    stack: [],
    top() { return this.stack[this.stack.length - 1]; },
    prev() { return this.stack[this.stack.length - 2]; },
    isTransitioning: false,

    newPage({
      config,
      context,
      container=pagesContainer,
      animation=true
    }) {

      return App.pages.createPage({ pageTemplate: config.template, params: config.getParams(context), container, animation });
    },
   
    createPage({ pageTemplate, params, container, animation=true }) {

      const newPage = document.createElement("div");
      newPage.classList.add("page");


      const page = this.templates[pageTemplate];


      newPage.innerHTML = page.getInnerHTML(params);


      pagesContainer.appendChild(newPage);


      this.push(newPage, animation);


      if (page.init) {
        page.init({
          page: newPage,
          params
        });
      }


      return newPage;
    },

    push(pageEl, animation=true) { 

      this.stack.push(pageEl);

      const previousPage = this.prev();

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
    },

    pop(animation=true) {

      if (this.isTransitioning) return;

      const currentPage = this.top();
      const previousPage = this.prev();

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
      
    },

    clear() {
      this.stack.forEach(() => this.pop(false));      
    },

    snapBack() {
      const currentPage = this.top();
      const previousPage = this.prev();

      currentPage.style.transform = "";
      previousPage.style.transform = "";

      currentPage.classList.add("page-enter-active")
      previousPage.classList.add("page-behind")

      setTimeout(() => {
        currentPage.classList.remove("page-enter-active")
      }, 300);
    },
  },

  sheets: {
    templates: sheetTemplates,
    configs: sheetConfigs,
    stack: [],
    top() { return this.stack[this.stack.length - 1]; },
    prev() { return this.stack[this.stack.length - 2]; },

    newSheet({
      config,
      context,
      animation=false
    }) {
      return App.sheets.createBottomSheet({
        sheetTemplate: config.template,
        params: config.getParams(context),
      }, animation);
    },

    createBottomSheet ({
      sheetTemplate,
      params,
      animation
    }) {

      const newSheet = document.createElement("div");
      newSheet.classList.add("sheet__wrapper", "hidden");

      const sheet = this.templates[sheetTemplate];

      console.log(sheet, this.templates, sheetTemplate)
      newSheet.innerHTML = `
        
        <div class="sheet__backdrop"></div>


        <div class="sheet">

          <div class="sheet__handle"></div>

            <h2>
              ${params.title}
            </h2>

            <div class="sheet__content">${sheet.getInnerHTML(params) || "content..."}</div>

            <button class="button button--secondary">Cancel</button>

          </div>
        </div>
      `;

      document.body.appendChild(newSheet);

      newSheet.querySelector(".sheet__backdrop").addEventListener("click", e => {
        this.pop();
      });

      if (sheet.init) {
        sheet.init({
          sheet: newSheet,
          params
        });
      }

      this.push(newSheet, animation);

      return newSheet;
    },

    push(sheetEl) {

      const backdrop = sheetEl.querySelector(".sheet__backdrop");
      const sheet = sheetEl.querySelector(".sheet");

      App.gestures.enableDrag({
        handle: sheet,
        direction: "vertical",
        deadzone: 10,
        thresholdDistance: 100,
        thresholdVelocity: 0.9,

        getElementsToAnimate() {
          return [
            backdrop,
            sheet
          ];
        },

        onMove({
          event: e,
          dx,
          dy,
          startX,
          startY,
        }) {
          if (dy <= 0) return;
          sheet.style.transform = `translateY(${dy}px)`;
          backdrop.style.opacity = 1 - 0;
        },
        onThresholdCrossed() {
          App.sheets.pop();
        },
        onThresholdNotCrossed() {
          App.sheets.snapBack();
        },
      });

      this.stack.push(sheetEl);

      const depth = App.sheets.stack.length;
      const scale = Math.max(0.92, 1 - depth * 0.04);

      if (!state.sidebarIsOpen) {
        AppContent.style.transform = `scale(${scale})`;
      }

      requestAnimationFrame(() => {
        sheetEl.classList.remove("hidden");
      });

      setTimeout(() => {
      }, 300);
    },

    pop() {
      const currentSheet = this.top();
      this.remove(currentSheet);
    },

    clear() {
      this.stack.forEach(() => this.pop());      
    },

    remove(sheetEl) {
      sheetEl.classList.add("hidden");
      sheetEl.querySelector(".sheet").style.transform = "translateY(100%)";

      AppContent.style.transform = `scale(1)`;

      setTimeout(() => {
        sheetEl.remove();
        this.stack.pop();
      }, 400);
    },

    snapBack() {
      const currentSheet = this.top();

      const depth = App.sheets.stack.length;
      const scale = Math.max(0.92, 1 - depth * 0.04);

      if (!state.sidebarIsOpen) {
        AppContent.style.transform = `scale(${scale})`;
      }

      currentSheet.querySelector(".sheet").style.transform = "";
    },
  },

  gestures,
  ui,
  utils,
};

function showPage(page) {
  allPages.forEach(page => page.style.display = "none");

  page.style.display = "flex";

  App.pages.push(page, false);
}


// setTimeout(() => openSidebar(), 200);

// App.sheets.push( App.sheets.createBottomSheet({ title: 'Create List', content: sheets.list }) )


function isAnyInputFocused() { return ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName); }



// ===================================
// Collapsing searchbar try
// ===================================

// .page-header.collapsed {
//   gap: 0;
// }

// .page-header.collapsed .open-sidebar-button {
//   transform: translateY(49px);
//   transition: transform 0.1s linear;
// }

// .page-header.collapsed .page-title h1 {
//   margin: 0;
//   margin-left: -42px;
//   transition: transform 0.1s linear;
// }

// .page-header.collapsed .searchbar {
//   height: 0;
//   border-width: 0;
//   padding-top: 0;
//   padding-bottom: 0;
//   overflow: hidden;
// }



// JavaScripts
// function center(rect) {
//   return {
//     x: rect.left + rect.width / 2,
//     y: rect.top + rect.height / 2
//   };
// }

// const header = document.querySelector(".page-header");
// const title = document.querySelector(".page-title h1");
// const icon = document.querySelector(".open-sidebar-button");
// const searchbar = document.querySelector(".searchbar");

// function measureLayout() {
//   const expanded = {
//     title: center(title.getBoundingClientRect()),
//     icon: center(icon.getBoundingClientRect()),
//     searchHeight: searchbar.offsetHeight
//   };

//   header.classList.add("collapsed");

//   const collapsed = {
//     title: center(title.getBoundingClientRect()),
//     icon: center(icon.getBoundingClientRect())
//   };

//   header.classList.remove("collapsed");

//   return { expanded, collapsed };
// }

// let layout = measureLayout();

// window.addEventListener("resize", () => {
//   layout = measureLayout();
// });

// const grid = document.querySelector("#grid");

// grid.addEventListener("scroll", () => {
//   const progress = Math.min(
//     grid.scrollTop / layout.expanded.searchHeight,
//     1
//   );

//   const titleDx =
//     layout.collapsed.title.x -
//     layout.expanded.title.x;

//   const titleDy =
//     layout.collapsed.title.y -
//     layout.expanded.title.y;

//   const iconDx =
//     layout.collapsed.icon.x -
//     layout.expanded.icon.x;

//   const iconDy =
//     layout.collapsed.icon.y -
//     layout.expanded.icon.y;

//   title.style.transform =
//     `translate(${titleDx * progress}px, ${titleDy * progress}px)`;

//   icon.style.transform =
//     `translate(${iconDx * progress}px, ${iconDy * progress}px)`;

//   searchbar.style.height =
//     `${layout.expanded.searchHeight * (1 - progress)}px`;

//   searchbar.style.opacity = 1 - progress;
// });
