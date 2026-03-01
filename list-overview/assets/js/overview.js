function isTouchDevice() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

let listsSortable = null;

// scripts/overview.js
// =====================================================
// OVERVIEW VIEW
// - configureNewListBtn opens modal
// - create list saves + routes to list
// - delete list removes list + its rows
// =====================================================

const listsContainer = document.getElementById("listsContainer");

let editingListId = null;

function openEditListModal(list) {
  modalTitle = "Bearbeite deine Liste";
  modalContent = getEditNameInput("editListTitleInput", "Benenne deine Liste");
  modalBtns = getStandardBtn("saveChangesToListBtn", "Speichern");
  createModal();

  const editListTitleInput = document.getElementById("editListTitleInput");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const saveChangesToListBtn = document.getElementById("saveChangesToListBtn");

  editingListId = list.id;
  editListTitleInput.value = list.name;

  editListTitleInput.focus();
  editListTitleInput.select();

  closeModalBtn?.addEventListener("click", deleteModal);

  saveChangesToListBtn?.addEventListener("click", () => {
    if (!editingListId) return;

    const newName = editListTitleInput.value.trim();
    if (!newName) return;

    StorageAPI.updateList(editingListId, {
      name: newName,
    });

    deleteModal();
    renderOverview();
  });

  editListTitleInput?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") deleteModal();
    if (e.key === "Enter") saveChangesToListBtn.click();
  });
}

const createNewListMenuContainer = document.getElementById("createNewListMenuContainer");
const createNewListMenu = document.getElementById("createNewListMenu");
const createNewListBtn = document.getElementById("openNewListMenuBtn");
const newListNameInput = document.getElementById("newListNameInput");

let isCreateMenuOpen = false;

// Button nur EINMAL registrieren
createNewListBtn?.addEventListener("click", handleCreateButtonClick);

function handleCreateButtonClick() {
  if (!isCreateMenuOpen) {
    openCreateNewListMenu();
  } else {
    submitCreateNewList();
  }
}

// ---- Open ----
function openCreateNewListMenu() {
  isCreateMenuOpen = true;

  createNewListMenuContainer.classList.add("active");
  createNewListMenu.classList.add("active");
  createNewListBtn.classList.add("close");
  newListNameInput.style.display = "block";
  newListNameInput.focus();
}

// ---- Submit ----
function submitCreateNewList() {
  const name = newListNameInput.value.trim();

  if (!name) {
    closeCreateNewListMenu();
    return;
  }

  const newList = StorageAPI.createList(name);
  closeCreateNewListMenu();
  AppRoute.toListSettings(newList);
}

// ---- Key handling (auch nur einmal!) ----
newListNameInput?.addEventListener("keyup", (e) => {
  if (!isCreateMenuOpen) return;

  if (!newListNameInput.value) {
    createNewListBtn.classList.add("close");
    createNewListBtn.classList.remove("add");
  } else {
    createNewListBtn.classList.remove("close");
    createNewListBtn.classList.add("add");
  }

  if (e.key === "Enter") {
    submitCreateNewList();
    return;
  }

  if (e.key === "Escape") {
    closeCreateNewListMenu();
    return;
  }
});

// ---- Close ----
function closeCreateNewListMenu() {
  isCreateMenuOpen = false;

  createNewListMenuContainer.classList.remove("active");
  createNewListMenu.classList.remove("active");
  createNewListBtn.classList.remove("close", "add");
  newListNameInput.style.display = "none";
  newListNameInput.value = "";
}

function getListEnableCounter(list) {
  return list?.options?.enableCounter ?? list?.enableCounter ?? false;
}

// =====================================================
// Render lists
// =====================================================

window.renderOverview = function renderOverview() {
  const mode = StorageAPI.getListSortMode();
  let lists = StorageAPI.getLists();

  if (mode === "alphabetical") {
    lists = [...lists].sort((a, b) => a.name.localeCompare(b.name));
  } else if (mode === "created") {
    lists = [...lists].sort((a, b) => b.createdAt - a.createdAt);
  } else {
    lists = StorageAPI.getListsSorted();
  }

  listsContainer.innerHTML = "";

  if (lists.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Noch keine Listen. Erstelle unten eine neue Liste.";
    listsContainer.appendChild(empty);
    return;
  }

  lists.forEach(list => {
    const row = document.createElement("div");
    row.className = "row";
    row.dataset.id = list.id;

    row.innerHTML = `
      <div class="title-container">
        <div class="drag-handle">⋮⋮</div>
        <div class="delete-icon-container">
          <img class="delete-icon" src="assets/img/delete-icon.svg">
        </div>
        <div class="edit-icon-container">
          <img class="edit-icon" src="assets/img/edit-icon.svg">
        </div>
        <p class="title">${list.name}</p>
      </div>
      <div class="open-btn-container">
        <button class="open-btn" type="button">
          <img class="open-icon" src="assets/img/back-icon.svg">
        </button>
      </div>
    `;

    const dragHandle = row.querySelector(".drag-handle");
    if (mode !== "manual" && dragHandle) {
      dragHandle.classList.add("disabled");
    }

    // --- Edit ---
    row.querySelector(".edit-icon-container")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditListModal(list);
    });

    // --- Open List ---
    row.querySelector(".open-btn")?.addEventListener("click", () => {
      AppRoute.toList(list);
    });

    // --- Delete Icon ---
    row.querySelector(".delete-icon-container")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const confirmed = confirm(`Liste "${list.name}" wirklich löschen?`);
      if (!confirmed) return;
      StorageAPI.deleteList(list.id);
      renderOverview();
    });

    // --- Swipe to Delete ---
    enableSwipeToDelete(row, () => {
      const ok = confirm(`Liste "${list.name}" wirklich löschen?`);
      if (!ok) return false;
      StorageAPI.deleteList(list.id);
      renderOverview();
      return true;
    });

    listsContainer.appendChild(row);
  });

  // --- Drag / Sort ---
  if (mode !== "manual") {
    if (listsSortable) listsSortable.destroy();
    listsSortable = null;
    
    return;
  }

  if (window.Sortable) {
    if (listsSortable) listsSortable.destroy();
   
    listsSortable = Sortable.create(listsContainer, {
      animation: 150,
      ghostClass: "drag-ghost",
      handle: isTouchDevice() ? ".drag-handle" : ".row",
      draggable: ".row",

      onEnd: () => {
        const ids = [...listsContainer.querySelectorAll(".row")]
          .map(el => el.dataset.id);
        StorageAPI.setListOrder(ids);
      }
    });
  }
};