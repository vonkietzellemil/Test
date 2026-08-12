const AppEl = document.getElementById("App");
const AppContent = document.getElementById("AppContent");
const pagesContainer = document.getElementById("pagesContainer");

const sidebar = document.getElementById("sidebar");
const allPages = document.querySelectorAll(".page");

const componentsPage = document.getElementById("componentsPage");


const pagesBackground = document.getElementById("pagesBackground");
const overlay = document.getElementById("pageOverlay");


import { App } from "./core/app.js";
import { state } from "./core/state.js"
import { StorageAPI } from "./services/storage.js";

function initiate() {

  // ========================================================
  // enable swipe for pages go back
  // ========================================================

  new App.gestures.Drag({
    handle: pagesContainer,

    direction: "horizontal",

    getElementsToAnimate() {
      return [
      App.pages.top(),
      App.pages.prev?.()
      ]
    },

    condition() {
      if (App.pages.stack.length >= 2) {
        return false;
      } else {
        return true;
      }
    },

    onMove({ dx }) {
      if (dx <= 0) return;

      const progress = Math.min(
        1,
        dx / window.innerWidth
      );

      App.pages.top().style.transform =
        `translateX(${dx}px)`;

      if(!App.pages.prev()) return;

      App.pages.prev().style.transform =
        `translateX(${-50 + progress * 50}px)`;
    },

    onThresholdCrossed({ dx }) {
      if (dx > 0) {
        App.pages.pop();
      }
    },

    onThresholdNotCrossed() {
      App.pages.snapBack();
    }
  });


  // ========================================================
  // Sidebar logic
  // ========================================================

  // const rotate = 25;

  const borderRadius = 20;
  const scale = 0.75;
  const gap = 20;
  const bgScale = scale * 0.9;
  const bgOpacity = 0.6;

  new App.gestures.Drag({
    handle: pagesContainer,

    direction: "horizontal",

    getElementsToAnimate() {
      return [
        pagesContainer,
        pagesBackground,
      ]
    },

    condition(e) {
      if (state.sidebarIsOpen || App.pages.stack.length <= 1) {
        return false;
      } else {
        return true;
      }
    },

    onMove({ dx }) {
      const sidebarWidth = sidebar.clientWidth;

      const startProgress = state.sidebarIsOpen ? 1 : 0;

      const progress = Math.max(
        0,
        Math.min(1, startProgress + dx / sidebarWidth)
      );

      updateSidebarProgress(progress);
    },

    onThresholdCrossed({ dx }) {
      if (dx > 0) {
        openSidebar();
      } else {
        closeSidebar();
      }
    },

    onThresholdNotCrossed() {
      state.sidebarIsOpen
        ? openSidebar()
        : closeSidebar();
    }
  });

  overlay.addEventListener("click", () => {
    closeSidebar();
  });

  function getBackgroundOffset() {
    const lostLeft = pagesContainer.clientWidth * (1 - bgScale) / 2;
    return sidebar.clientWidth - lostLeft;
  }

  function getPageOffset() {
    const W = pagesContainer.clientWidth;

    const lostLeft = W * (1 - scale) / 2;

    const bgOffset = getBackgroundOffset();
    const pageOffset = sidebar.clientWidth - lostLeft + gap;
    return pageOffset;
  }

  allPages.forEach(page => {
    page.querySelector(".page-header svg").addEventListener("click", e => {
      toggleSidebar();
    });
  });

  function toggleSidebar() {
    if (state.sidebarIsOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function updateSidebarProgress(progress) {
  
    pagesContainer.style.transform =`
      translateX(${getPageOffset() * progress}px)
      scale(${1 + progress * (scale - 1)})
    `;

    pagesContainer.style.borderRadius = borderRadius * progress + "px";


    const opacity = progress * bgOpacity;

    pagesBackground.style.transform = `
      translateX(${getBackgroundOffset() * progress}px)
      scale(${1 + progress * (bgScale - 1)})
    `;

    pagesBackground.style.opacity = opacity;
  }

  function openSidebar() {
    state.sidebarIsOpen = true;

    pagesContainer.style.transform =
      `translateX(${getPageOffset()}px) scale(${scale})`;
  // rotateY(-${rotate}deg)
    pagesContainer.style.borderRadius = "20px";
    

    pagesBackground.style.opacity = "1";
    pagesBackground.style.transform =
      `translateX(${getBackgroundOffset()}px) scale(${bgScale})`;

    overlay.classList.add("open");
  }

  function closeSidebar() {
    state.sidebarIsOpen = false;

    pagesContainer.style.transform = "";
    pagesContainer.style.borderRadius = "";

    pagesBackground.style.opacity = "0";
    pagesBackground.style.transform =
      `translateX(0) scale(${bgScale})`;

    overlay.classList.remove("open");
  }


  sidebar.querySelectorAll(".sidebar-nav-option").forEach(option => {
    option.addEventListener("click", () => {
      App.pages.stack.length = 0;

      sidebar.querySelectorAll(".sidebar-nav-option").forEach(option => option.classList.remove("active"));
      option.classList.add("active");

      closeSidebar();
      
      // Get Config: App.pages.configs[path];
      const config = App.utils.getNested(
        App.pages.configs,
        option.dataset.pageconfig
      )

      App.pages.clear();
      App.pages.newPage({ config, animation: false });
    });
  });


  sidebar.querySelector(".sidebar-action[data-action='support']").addEventListener("click", e => {
    
    sidebar.querySelectorAll(".sidebar-nav-option").forEach(option => option.classList.remove("active"));

    App.sheets.push(
      App.sheets.newSheet({ title: "Contact Support", content: "" })
    );
    
  });
}










const itemContainer = document.querySelector(".items-container");

const sortable = new Sortable(itemContainer, {
  delay: 600,
  delayOnTouchOnly: true,

  forceFallback: true,
  fallbackOnBody: true,
  fallbackClass: "sortable-drag-clone",

  animation: 350,
  ghostClass: "drag-ghost",

  draggable: ".list-item",

  onMove(evt) {
    document
      .querySelectorAll(".drag-hover")
      .forEach(el => el.classList.remove("drag-hover"));

    if (evt.related?.classList.contains("category-item-container")) {
      evt.related.classList.add("drag-hover");
    }
  },

  onStart(evt) {
    evt.item.classList.add("drag-activated");
  },

  onEnd(evt) {
    evt.item.classList.remove("drag-activated");

    document
      .querySelectorAll(".drag-hover")
      .forEach(el => el.classList.remove("drag-hover"));
  },
});



const item = document.getElementById("testList");

item.addEventListener("click", () => {
  App.pages.newPage({ config: App.pages.configs.lists.root });
});

function setupDragHoldFeedback(item, delay = 600) {
  let rafId = null;
  let startTime = 0;
  let active = false;

  function update(now) {
    if (!active) return;

    const progress = Math.min((now - startTime) / delay, 1);

    item.style.setProperty("--drag-progress", progress);

    if (progress >= 1) {
      item.classList.add("drag-ready");
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(update);
  }

  function start() {
    active = true;
    startTime = performance.now();

    item.classList.remove("drag-ready");
    item.style.setProperty("--drag-progress", 0);

    rafId = requestAnimationFrame(update);
  }

  function stop() {
    active = false;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    item.classList.remove("drag-ready");
    item.style.setProperty("--drag-progress", 0);
  }

  item.addEventListener("pointerdown", start);
  item.addEventListener("pointerup", stop);
  item.addEventListener("pointercancel", stop);
  item.addEventListener("pointerleave", stop);

  return {
    start,
    stop,
    destroy() {
      stop();

      item.removeEventListener("pointerdown", start);
      item.removeEventListener("pointerup", stop);
      item.removeEventListener("pointercancel", stop);
      item.removeEventListener("pointerleave", stop);
    },
  };
}

setupDragHoldFeedback(item);










document.addEventListener("DOMContentLoaded", () => {
  initiate();

  App.pages.newPage({ config: App.pages.configs.lists.root, animation: false });

  // App.pages.push(document.getElementById("testPage"), false);
  
});