let swipeEnabled = null;
let itemsSortable = null;

import { App } from "../../core/app.js";
import { StorageAPI } from "../../services/storage.js";

const ENTITY_TYPES = {
  list: {
    tag: "list",
    name: "List",
    createItem: (props) => StorageAPI.createList(props),
    createElement: createListRowElem,
    updateItem: StorageAPI.updateList,
    getItemById: StorageAPI.getListById,

    // addIcon: icons.general.addList,
    addText: "Add List",
    addPlaceholder: "ToDo, Shopping, etc.",
  },

  row: {
    tag: "row",
    name: "Entry",
    createItem: (props) => StorageAPI.addRow(props),
    createElement: createRowElem,
    updateItem: StorageAPI.updateRow,
    getItemById: StorageAPI.getRowById,

    // addIcon: icons.general.addCircle,
    addText: "Add Entry",
    addPlaceholder: "Add Entry",
  },

  category: {
    tag: "category",
    name: "Category",
    createItem: (props) => StorageAPI.createCategory(props),
    createElement: createCategoryElem,
    updateItem: StorageAPI.updateCategory,
    getItemById: StorageAPI.getCategoryById,
    canHaveDirectChildren: true,

    // addIcon: icons.general.addLabel,
    addText: "Add Category",
    addPlaceholder: "Add Category",
  },
};

export function renderCollection({
  container,
  items,
  config,
  parentId,
  emptyMessage=true,
  createNewSortable
}) {
  if (itemsSortable) {
    itemsSortable.forEach(s => s.destroy());
    itemsSortable = null;
  }
  container.innerHTML = "";
  swipeEnabled = config.swipeEnabled;

  const currentView =
    parentId ??
    config.parent.id ??
    config.parent.view;


  // const sortMode = updateSortUIAndGetSortMode(); // Have Sort Button work

  // const sortedItems = sortItems(
  //   items,
  //   sortMode,
  //   StorageAPI.getViewOrderByView(currentView),
  //   config.customSorts || null
  // );

  // const searchResult = searchItems(sortedItems, document.querySelector("#searchbar").value);
  const searchResult = [items, {}]
  const searchData = searchResult[1]
  items = searchResult[0]

  if (items.length === 0 && emptyMessage) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `<div>${config.emptyMessage}</div>`;;
    container.appendChild(empty);
  }

  // disableViewCreateMenu();
  // config.enableViewCreateMenu ? config.enableViewCreateMenu() : null;
  // disableViewHeader();
  // config.enableViewHeader ? config.enableViewHeader() : null;

  if (config.groups) {
    
    config.groups.forEach(group => {
      const groupItems = items.filter(group.filter);

      if (groupItems.length === 0) return;

      const details = document.createElement("details");
      details.className = "group";
      details.open = false;

      const summary = document.createElement("summary");
      summary.className = "group-header";
      summary.innerHTML = `
        <span class="group-title">${group.name}</span>
        <span class="group-count">${groupItems.length}</span>
        ${ group.button && `<span class="group-btn">${group.button.icon}</span>` }
      `;

      if (group.button) {
        summary.querySelector(".group-btn").addEventListener("click", () => {
          group.button.onClick(groupItems);
        });
      }

      const content = document.createElement("div");
      content.className = "group-content";
      const contentInner = document.createElement("div");
      contentInner.className = "group-content-inner";
      content.appendChild(contentInner);

      groupItems.forEach(item => {
        contentInner.appendChild(renderItem(item, config, container));
      });

      details.append(summary, content);
      container.appendChild(details);
    });



  } else {
    items.forEach(item => {
      const el = renderItem(item, config, container, searchData[item.id]);
      container.appendChild(el);
    });
  }

  if (createNewSortable !== false) {
    const categoryContainers = container.querySelectorAll(".category-item-container");
    const nestedSortables = [
      container,
      ...categoryContainers
    ];

    // Loop hrough each nested sortable element
    // itemsSortable = nestedSortables.map(el =>
    //   new Sortable(el, {
    //     fallbackOnBody: true,
    //     animation: 150,
    //     ghostClass: "drag-ghost",
    //     handle: isTouchDevice() ? ".drag-handle" : ".row",
    //     draggable: ".draggable",
    //     group: "nested",

    //     onMove(evt) {
    //       document
    //         .querySelectorAll(".drag-hover")
    //         .forEach(el => el.classList.remove("drag-hover"));

    //       if (evt.related.classList.contains("category-item-container")) {
    //         evt.related.classList.add("drag-hover");
    //       }
    //     },

    //     onEnd(evt) {
    //       document
    //         .querySelectorAll(".drag-hover")
    //         .forEach(el => el.classList.remove("drag-hover"));


    //       const movedItemData = StorageAPI.getItemById(evt.item.dataset.id);
    //       const targetContainer = evt.to;

    //       // Update the parentId of the moved item based on the target container
    //       movedItemData.parentId = targetContainer.dataset.id || config.parent.id || config.parent.view;
    //       StorageAPI.updateItem(movedItemData.id, movedItemData);


    //       // Update order of items

    //       function saveContainerOrder(container) {
    //         const parentId =
    //           container.dataset.id ||
    //           config.parent.id ||
    //           config.parent.view;

    //         const ids = [...container.children]
    //           .filter(el => el.dataset.id)
    //           .map(el => el.dataset.id);

    //         StorageAPI.setViewOrder(parentId, ids);
    //       };

    //       saveContainerOrder(evt.to);

    //       if (evt.from !== evt.to) {
    //         saveContainerOrder(evt.from);
    //       }
    //     }
    //   })
    // );
  }

  if (
    // StorageAPI.getSortMode(currentView) !== "manual" ||
    false || document.querySelector("#searchbar").value
  ) {
    itemsSortable?.forEach(sortable => sortable.destroy());
    itemsSortable = null;
    container.querySelectorAll(".row .drag-handle").forEach(el => el.classList.add("disabled"));
  }
}
function renderItem(item, config, container, searchData={}) {
  const el = ENTITY_TYPES[item.type].createElement(
    item,
    searchData,
    config
  );

  el.dataset.type = item.type;

  return el;
}








// Create entity elements
function createListRowElem(item, { query, titleMatch, entrySnippet, rowCount }, config) {
  const list = item;
  const row = document.createElement("div");
  row.classList.add("list-item", "draggable");
  row.dataset.id = list.id;

  row.innerHTML = `
    <div class="deleted-label" style="display: none;">
      ${StorageAPI.getTimeLeft(item.purgeAt)}
    </div>


    <div class="drag-handle">
      ⋮⋮
    </div>

    <button class="list-main" type="button">

      <div class="list-content">
        <p class="list-title">${item.name}</p>
        <p class="list-meta">${5} items • Last edited 2h ago</p>
      </div>

    </button>

    <div class="list-actions">

      <button class="favorite-btn" type="button">
        <svg viewBox="0 -960 960 960">
          <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z"/>
        </svg>
      </button>

      <button class="more-btn" type="button">
        <svg viewBox="0 -960 960 960">
          <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/>
        </svg>
      </button>

    </div>

    <svg class="restore-icon" style="display: none;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-320h80v-166l64 62 56-56-160-160-160 160 56 56 64-62v166ZM280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Z"/></svg>

  `;

  if (list.parentId === "deleted" && list.purgeAt) {
    row.classList.add("deleted");
  }

  if (list.status?.favored) {
    row.querySelector(".favorite-btn").classList.add("active");
  }

  // if (SelectionManager.isSelected(item.id)) {
  //   row.classList.add("selected");
  // }

  attachListEvents(row, list, config);
  // enableSelection(row, item, config, container);

  return row;
}

function createRowElem(item, { query, titleMatch, contentMatch, rowCount }, config) {
  const row = document.createElement("div");
  row.classList.add("row", "draggable");

  const [root, param, sub] = parseRoute();

  const rowData = item;
  const list = StorageAPI.getListById(rowData.listId);

  let count = rowData.count;

  row.innerHTML = `

    <div class="deleted-label" style="">
      ${StorageAPI.getTimeLeft(item.purgeAt)}
    </div>
    
    <div class="title-container">
      <div class="drag-handle" ${query && "style='display: none;'"}>⋮⋮</div>
      <div class="delete-icon-container">
        <svg class="delete-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/></svg>
      </div>
      <div class="edit-icon-container">
        <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M120-120v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm584-528 56-56-56-56-56 56 56 56Z"/></svg>
      </div>
      <p class="row-position" ${list?.options.enableNumbering ? "style='display: none;'" : "style='display: none;'"}>${"position"}.</p>
      <div class="title-wrapper">
        <p class="title">${highlightSmart(rowData.name, searchbar.value)}</p>
        <p class="subtitle" ${!rowData.content && "style='display: none;'"}>${contentMatch ? highlightSmart(rowData.content, searchbar.value).trim() : rowData.content}</p>
      </div>
    </div>

    <div class="counter-btn-container">
      <div class="counter">${count}</div>
      <button class="counter-plus-btn" type="button">
        <svg class="plus-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
      </button>
      <button class="counter-minus-btn">
        <svg class="minus-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-440v-80h560v80H200Z"/></svg>
      </button>
    </div>

    <svg class="checked-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">${rowData.status?.checked ? `<path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z"/>` : `<path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"/>`}</svg>

    <svg class="favorite-icon${rowData.status?.favored ? " active" : ""}"
    xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z"/></svg>

    <svg class="restore-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-320h80v-166l64 62 56-56-160-160-160 160 56 56 64-62v166ZM280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Z"/></svg>
  `;

  row.dataset.id = rowData.id;

  if (rowData.parentId === "deleted" && rowData.purgeAt) {
    row.classList.add("deleted");
  }

  if (rowData.status?.checked) row.classList.add("checked");
  
  if (SelectionManager.isSelected(rowData.id)) {
    row.classList.add("selected");
  }

  attachRowEvents(row, rowData, config);
  enableSelection(row, item, config, container);

  return row;
}

function createCategoryElem(item, { query, }, config) {
  const row = document.createElement("div");
  row.classList.add("category", "draggable");

  const [root, param, sub] = parseRoute();

  const category = item;
  const list = StorageAPI.getListById(category.listId);

  let count = category.count;

  row.innerHTML = `
    <div class="header">

      <div class="deleted-label" style="">
        ${StorageAPI.getTimeLeft(item.purgeAt)}
      </div>

      <div class="drag-handle" ${query && "style='display: none;'"}>⋮⋮</div>

      <button class="collapse-btn">
        <svg class="collapse-icon" viewBox="0 0 24 24">
          <path d="M8 5l8 7-8 7"/>
        </svg>
      </button>
      
      <div class="delete-icon-container">
        <svg class="delete-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm80-160h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/></svg>
      </div>
      <div class="title-wrapper">
        <p class="title">${highlightSmart(category.name, searchbar.value)}</p>
        <p class="subtitle" ${!category.content && "style='display: none;'"}></p>
      </div>

      <span class="category-count">${StorageAPI.getItemsByParentId(item.id).length}</span>

      <div class="more">
        ${icons.general.moreVert}

      </div>

      <svg class="restore-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-320h80v-166l64 62 56-56-160-160-160 160 56 56 64-62v166ZM280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Z"/></svg>
    </div>

    <div class="category-item-container" data-id="${category.id}">
      
    </div>
  `;

  row.dataset.id = category.id;

  if (category.parentId === "deleted" && category.purgeAt) {
    row.classList.add("deleted");
  }

  if (item.collapsed) {
    row.classList.add("collapsed");
  }

  if (category.status?.checked) row.classList.add("checked");
  
  if (SelectionManager.isSelected(category.id)) {
    row.classList.add("selected");
  }

  renderCollection({
    container: row.querySelector(".category-item-container"),
    createNewSortable: false,
    items: StorageAPI.getItemsByParentId(category.id),
    config,
    parentId: item.id,
    emptyMessage: false
  });

  attachCategoryEvents(row, item, config);
  enableSelection(row.querySelector(".header"), item, config, container);

  return row;
}
function createCategoryMenu(item, el) {
  const menu = document.createElement("div");
  menu.classList.add("category-menu");

  menu.innerHTML = `
    <div class="menu-item edit">✏️ Edit</div>
    ${!AppRoute.currentView.id ? `<div class="menu-item archive">📁 ${item.parentId === "root" ? "Archive" : "Unarchive"}</div>` : ""}
    <div class="menu-item delete">🗑 Delete</div>
  `;

  document.body.appendChild(menu);

  const button = el.querySelector(".more");
  const rect = button.getBoundingClientRect();

  // Temporarily hide so we can measure
  menu.style.visibility = "hidden";
  menu.style.display = "block";

  const menuRect = menu.getBoundingClientRect();

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = rect.right - menuRect.width;
  let top = rect.bottom + 8;

  // If it goes off the left side
  if (left < 8) {
    left = 8;
  }

  // If it goes off the right side
  if (left + menuRect.width > viewportWidth - 8) {
    left = viewportWidth - menuRect.width - 8;
  }

  // If it goes off the bottom, open upwards
  if (top + menuRect.height > viewportHeight) {
    top = rect.top - menuRect.height - 8;
  }

  // If it goes off the top too
  if (top < 8) {
    top = 8;
  }

  menu.style.left = `${left + window.scrollX}px`;
  menu.style.top = `${top + window.scrollY}px`;
  menu.style.visibility = "visible";

  // Edit
  menu.querySelector(".edit").onclick = () => {
    openEditModal(item);
    menu.remove();
  };

  // Archive
  if (menu.querySelector(".archive")) {
    menu.querySelector(".archive").onclick = () => {
      const confirmed = confirm("Archive Category?");
      if (!confirmed) return false;

      StorageAPI.updateItem(item.id, { parentId: item.parentId === "root" ? "archive" : "root" });
      el.remove();
      menu.remove()
    };
  }

  // Delete
  menu.querySelector(".delete").onclick = () => {
    const confirmed = confirm("Delete Category?");
    if (!confirmed) return false;

    StorageAPI.updateItem(item.id, { parentId: "deleted", purgeAt: Date.now() + (15 * 24 * 60 * 60 * 1000) });
    el.remove();
    menu.remove();
  };


  // Close when clicking elsewhere
  setTimeout(() => {
    document.addEventListener("click", function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    });
  }, 0);

  return menu;
}


function attachListEvents(row, list, config) {
  row.addEventListener("click", (e) => {
    // if (SelectionManager.longPressTriggered) {
    //   SelectionManager.longPressTriggered = false;
    //   return;
    // }

    // if (SelectionManager.active && (e.target === row.querySelector(".favorite-icon") || e.target === row.querySelector(".favorite-icon path"))) {
    //   toggleFavoredList();
    //   return;
    // };

    // if (SelectionManager.active) {

    //   SelectionManager.toggle(
    //     row,
    //     list,
    //     config
    //   );

    //   return;
    // }

    App.pages.newPage({
      config: App.pages.configs.list.root,
      context: { list }
    });
  });

  // --- Edit ---
  row.querySelector(".more-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    
    App.sheets.newSheet({
      config: App.sheets.configs.list.edit,
      context: { list },
    });
  });


  row.querySelector(".favorite-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();

    toggleFavoredList();
  });

  // --- Open List ---
  row.querySelector(".open-btn")?.addEventListener("click", () => {
    AppRoute.toList(list);
  });

  // --- Delete Icon ---
  row.querySelector(".delete-icon-container")?.addEventListener("click", (e) => {
    e.stopPropagation();
    StorageAPI.moveItemtoTrash(list.id);
    renderCurrentView();
  });

  // --- Swipe to Delete ---
  // enableSwipeToDelete(row, () => {
  //   StorageAPI.moveItemtoTrash(list.id);
  //   renderCurrentView();
  //   return true;
  // });

  // --- Restore Icon ---
  row.querySelector(".restore-icon")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const confirmed = confirm(`Restore ${list.name} from trash?`);
    if (!confirmed) return;

    list.parentId = "root"
    StorageAPI.updateItem(list.id, { parentId: list.parentId });
    renderCurrentView();
    return true;
  });

  // --- Favorite icon ---
  function toggleFavoredList() {
    list.status.favored = !list.status.favored;

    if (list.status.favored) {
      row.querySelector(".favorite-btn").classList.add("heart-filled");
      row.querySelector(".favorite-btn").classList.add("active");
    } else {
      row.querySelector(".favorite-btn").classList.remove("heart-filled");
      row.querySelector(".favorite-btn").classList.remove("active");
    }

    StorageAPI.updateList(list.id, {
      status: {
        favored: list.status.favored,
        ...list.status
      },
    });
  }
}
function attachRowEvents(row, rowData, config) {
  const rootParent = StorageAPI.getRootParentById(rowData.id);
  const list = StorageAPI.getItemById(rowData.parentId);

  row.addEventListener("click", (e) => {
    if (SelectionManager.longPressTriggered) {
      SelectionManager.longPressTriggered = false;
      return;
    }

    if (SelectionManager.active && (e.target === row.querySelector(".favorite-icon") || e.target === row.querySelector(".favorite-icon path"))) {
      toggleFavoredRow();
      return;
    };

    if (SelectionManager.active && (e.target === row.querySelector(".checked-icon") || e.target === row.querySelector(".checked-icon path"))) {
      toggleCheckedRow();
      return;
    };

    if (SelectionManager.active) {

      SelectionManager.toggle(
        row,
        rowData,
        config
      );

      return;
    }

    row.classList.add("active");
  });

  document.addEventListener("click", (e) => {
    if (!row.contains(e.target) || SelectionManager.active) {
      row.classList.remove("active");
    };
  });

  const dragHandle = row.querySelector(".drag-handle");

  if (window.enableSwipeToDelete) {
    enableSwipeToDelete(row, () => {
      StorageAPI.moveItemtoTrash(rowData.id);
      renderCurrentView();
      return true;
    });
  }

  const titleEl = row.querySelector(".title");
  const editBtn = row.querySelector(".edit-icon-container");

  editBtn?.addEventListener("click", (e) => {
    e.stopPropagation(); // wichtig: verhindert Side-Effekte (Swipe/Click)
    
    openEditModal(rowData);
  })

  const deleteIcon = row.querySelector(".delete-icon");

  // Counter nur anzeigen wenn aktiviert
  if (!rootParent?.options?.enableCounter) {
    const counterContainer = row.querySelector(".counter-btn-container");
    if (counterContainer) counterContainer.style.display = "none";
  }

  const counterEl = row.querySelector('.counter');
  const plusBtn = row.querySelector('.counter-plus-btn');
  const minusBtn = row.querySelector('.counter-minus-btn');

  if (plusBtn && minusBtn && counterEl) {
    plusBtn.addEventListener('click', () => {
      StorageAPI.updateRow(rowData.id, { count: rowData.count + 1 });
      rowData.count++;
      counterEl.textContent = rowData.count;
    });

    minusBtn.addEventListener('click', () => {
      if (rowData.count === 0) return;
      StorageAPI.updateRow(rowData.id, { count: rowData.count - 1 });
      rowData.count--;
      counterEl.textContent = rowData.count;
    });
  }

  deleteIcon.addEventListener("click", () => {
    StorageAPI.moveItemtoTrash(item.id);
    renderCurrentView();
  });

  // --- Restore Icon ---
  row.querySelector(".restore-icon")?.addEventListener("click", (e) => {
    e.stopPropagation();

    const modalContent =`
      <select class="form-select">
        ${`<option value="" hidden selected>Choose a list</option>`}

        ${StorageAPI.getLists().sort((a, b) => a.name.localeCompare(b.name)).filter(l => l.id !== "deleted").map(l => `<option value="${l.id}">${l.name}</option>`).join("") || `<option disabled>No other lists available</option>`}
      </select>
    `;

    createModal("Select a list to restore this item to.", modalContent, getModalConfirmBtn("modalConfirmBtn", "move entries"));
    
    document.getElementById("modalConfirmBtn").addEventListener("click", () => {
      const select = document.querySelector(".modal-card .form-select");
      const targetListId = select.value;
      if (!targetListId) return;
      
      StorageAPI.updateItem(rowData.id, { parentId: targetListId });

      renderCurrentView();
      deleteModal();
      createAlert("info", "Restored Entry", `${rowData.name} was restored to ${StorageAPI.getListById(targetListId).name}`);
    });

    return true;
  });

  // --- Favorite icon ---
  function toggleFavoredRow() {
    rowData.status.favored = !rowData.status.favored;

    if (rowData.status.favored) {
      row.querySelector(".favorite-icon").classList.add("heart-filled");
      row.querySelector(".favorite-icon").classList.add("active");
    } else {
      row.querySelector(".favorite-icon").classList.remove("heart-filled");
      row.querySelector(".favorite-icon").classList.remove("active");
    }

    StorageAPI.updateRow(rowData.id, {
      status: {
        favored: rowData.status.favored,
        ...rowData.status
      },
    });
  }

  // --- Checked Row ---
  function toggleCheckedRow() {
    rowData.status.checked = !rowData.status.checked;

    if (rowData.status.checked) {
      row.classList.add("checked");
      row.querySelector(".checked-icon").innerHTML = `<path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z"/>`;
    } else {
      row.classList.remove("checked");
      row.querySelector(".checked-icon").innerHTML = `<path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"/>`;
    }

    StorageAPI.updateRow(rowData.id, {
      status: {
        checked: rowData.status.checked,
        ...rowData.status
      },
    });
  }  
}
function attachCategoryEvents(el, item, config) {
  const list = StorageAPI.getListById(item.listId);

  el.addEventListener("click", (e) => {
    if (SelectionManager.longPressTriggered) {
      SelectionManager.longPressTriggered = false;
      return;
    }

    if (SelectionManager.active) {
      return;
    }

    el.classList.add("active");
  });

  document.addEventListener("click", (e) => {
    if (!el.contains(e.target) || SelectionManager.active) {
      el.classList.remove("active");
    };
  });

  const dragHandle = el.querySelector(".drag-handle");

  // Collapsed Btn
  const collapseBtn = el.querySelector(".collapse-btn");

  collapseBtn?.addEventListener("click", e => {
    e.stopPropagation();

    const collapsed = StorageAPI.getItemById(item.id).collapsed;
    StorageAPI.updateItem(item.id, { collapsed: !collapsed })

    el.classList.toggle("collapsed");
  });

  const titleEl = el.querySelector(".title");
  const editBtn = el.querySelector(".edit-icon-container");

  editBtn?.addEventListener("click", (e) => {
    e.stopPropagation(); // wichtig: verhindert Side-Effekte (Swipe/Click)
    openEditelModal(item.id, titleEl);
  })

  const deleteIcon = el.querySelector(".delete-icon");

  deleteIcon?.addEventListener("click", () => {
    StorageAPI.moveItemtoTrash(item.id);
    renderCurrentView();
  });

  const moreButton = el.querySelector(".more");

  moreButton.addEventListener("click", (e) => {
    e.stopPropagation();

    // remove other open menus
    document.querySelectorAll(".category-menu")
      .forEach(menu => menu.remove());

    createCategoryMenu(item, el);
  });

  // --- Restore Icon ---
  el.querySelector(".restore-icon")?.addEventListener("click", (e) => {
    e.stopPropagation();

    const categoryKind = CATEGORY_KINDS[item.categoryKind];
    console.log(categoryKind.allowedChildTypes)

    if (categoryKind?.allowedChildTypes[0] === "list") {
      StorageAPI.updateItem(item.id, { parentId: "root" });  
      el.remove();
    } else if (categoryKind?.allowedChildTypes[0] === "row") {
      console.log("hiehrfi");
      const modalContent =`
        <select class="form-select">
          ${`<option value="" hidden selected>Choose a list</option>`}

          ${StorageAPI.getLists().sort((a, b) => a.name.localeCompare(b.name)).filter(l => l.id !== "deleted").map(l => `<option value="${l.id}">${l.name}</option>`).join("") || `<option disabled>No other lists available</option>`}
        </select>
      `;

      createModal("Select a list to restore this item to.", modalContent, getModalConfirmBtn("modalConfirmBtn", "restore"));
      
      document.getElementById("modalConfirmBtn").addEventListener("click", () => {
        const select = document.querySelector(".modal-card .form-select");
        const targetListId = select.value;
        if (!targetListId) return;
        
        StorageAPI.updateItem(item.id, { parentId: targetListId });

        el.remove();
        deleteModal();
        createAlert("info", "Restored Category", `${item.name} was restored to ${StorageAPI.getListById(targetListId).name}`);
      });
    }
    
    return true;
  });
}