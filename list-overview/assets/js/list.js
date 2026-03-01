let rowsSortable = null;

// scripts/list.js
// =====================================================
// LIST VIEW
// - renders rows for current listId only
// - rows have count + content (content unused for now)
// =====================================================

const input = document.getElementById("input");
const addBtn = document.getElementById("addToListBtn");
const rowsContainer = document.getElementById("listRows"); // <-- wichtig
const currentListTitle = document.getElementById("currentListTitle");
const backBtn = document.getElementById("backToOverviewBtn");

// =====================================================
// EDIT ROW MODAL (title + content)
// =====================================================

let editingRowId = null;
let editingTitleEl = null; // Referenz zum <p class="title"> im DOM


backBtn?.addEventListener("click", () => AppRoute.toOverview());

function getRowByIdFromCurrentList(rowId) {
  const listId = AppRoute.currentListId;
  if (!listId) return null;
  return StorageAPI.getRowsByListId(listId).find(r => r.id === rowId) ?? null;
}

function openEditRowModal(rowId, titleEl) {
  const row = getRowByIdFromCurrentList(rowId);
  if (!row) return;

  editingRowId = rowId;
  editingTitleEl = titleEl;

  modalTitle = "Bearbeite den Eintrag";
  modalContent = getEditNameInput("editRowTitleInput", "Eintrag umbenennen") + getEditRowContentInput("editRowContentInput", "Füge eine Notiz hinzu...");
  modalBtns = getStandardBtn("saveChangesBtn", "Speichern");
  createModal();

  const editRowTitleInput = document.getElementById("editRowTitleInput");
  const editRowContentInput = document.getElementById("editRowContentInput");
  const closeEditRowModalBtn = document.getElementById("closeModalBtn");
  const saveChangesToRowBtn = document.getElementById("saveChangesBtn");

  editRowTitleInput.value = row.title ?? "";
  editRowContentInput.value = row.content ?? "";

  closeEditRowModalBtn?.addEventListener("click", closeEditRowModal);

  saveChangesToRowBtn?.addEventListener("click", () => {
    if (!editingRowId) return;

    const newTitle = editRowTitleInput.value.trim();
    const newContent = editRowContentInput.value; // content darf auch leer sein

    // optional: Titel muss nicht leer sein
    if (!newTitle) return;

    // LocalStorage updaten
    StorageAPI.updateRow(editingRowId, { title: newTitle, content: newContent });

    // UI direkt updaten (ohne neu rendern)
    if (editingTitleEl) editingTitleEl.textContent = newTitle;

    closeEditRowModal();
  });
}

function closeEditRowModal() {
  editingRowId = null;
  editingTitleEl = null;

  deleteModal();
}

function saveRowOrder() {
  const listId = AppRoute.currentListId;
  if (!listId) return;

  // Alle Row-IDs in aktueller Reihenfolge sammeln
  const ids = [...rowsContainer.querySelectorAll(".row")].map(el => el.dataset.id);

  // Reihenfolge im Storage speichern
  StorageAPI.setRowOrder(listId, ids);
}

window.renderList = function renderList(listId) {
  const list = StorageAPI.getListById(listId);
  if (!list) {
    AppRoute.toOverview();
    return;
  }

  currentListTitle.textContent = list.name;

  const mode = StorageAPI.getRowSortMode(listId);
  let rows = StorageAPI.getRowsByListId(listId);

  if (mode === "alphabetical") {
    rows = [...rows].sort((a, b) => a.title.localeCompare(b.title));
  } else if (mode === "count") {
    rows = [...rows].sort((a, b) => b.count - a.count);
  } else {
    rows = StorageAPI.getRowsByListIdSorted(listId);
  }

  rowsContainer.innerHTML = "";

  if (rows.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Noch keine Einträge in dieser Liste. Füge einen neuen Eintrag hinzu.";
    rowsContainer.appendChild(empty);
  }

  rows.forEach(r =>
    rowsContainer.appendChild(createRowElement(r, list, mode))
  );

  if (mode !== "manual") {
    if (rowsSortable) rowsSortable.destroy();
    rowsSortable = null;
    return;
  }

  if (window.Sortable && mode === "manual") {
    if (rowsSortable) rowsSortable.destroy();

    rowsSortable = Sortable.create(rowsContainer, {
      animation: 150,
      ghostClass: "drag-ghost",
      handle: isTouchDevice() ? ".drag-handle" : ".row",
      draggable: ".row",

      onEnd: saveRowOrder
    });
  }
};

function createRowElement(rowData, list, mode) {
  const row = document.createElement("div");
  row.classList.add("row");

  let count = rowData.count;

  row.innerHTML = `
    <div class="title-container">
      <div class="drag-handle" aria-label="Ziehen">⋮⋮</div>
      <div class="delete-icon-container">
        <img class="delete-icon" src="assets/img/delete-icon.svg">
      </div>
      <div class="edit-icon-container">
        <img class="edit-icon" src="assets/img/edit-icon.svg">
      </div>
      <p class="title">${rowData.title}</p>
    </div>

    <div class="counter-btn-container">
      <div class="counter">${count}</div>
      <button class="counter-plus-btn" type="button"><img class="counter-btn-icon" src="assets/img/plus.svg"></button>
      <button class="counter-minus-btn" type="button"><img class="counter-btn-icon" src="assets/img/minus.svg"></button>
    </div>
  `;

  row.dataset.id = rowData.id;

  const dragHandle = row.querySelector(".drag-handle");

  if (mode !== "manual" && dragHandle) {
    dragHandle.classList.add("disabled");
  }

  if (window.enableSwipeToDelete) {
    enableSwipeToDelete(row, () => {
      StorageAPI.deleteRow(rowData.id);
      renderList(list.id);
      return true;
    });
  }

  const titleEl = row.querySelector(".title");
  const editBtn = row.querySelector(".edit-icon-container");

  editBtn?.addEventListener("click", (e) => {
    e.stopPropagation(); // wichtig: verhindert Side-Effekte (Swipe/Click)
    openEditRowModal(rowData.id, titleEl);
  })

  const deleteIcon = row.querySelector(".delete-icon");

  // Counter nur anzeigen wenn aktiviert
  if (list.options?.enableCounter === false) {
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
    row.classList.add("deleting");
    StorageAPI.deleteRow(rowData.id);
    row.remove();
    renderList(list.id);
  });

  return row;
}

function addRowToCurrentList() {
  const listId = AppRoute.currentListId;
  if (!listId) return;

  const text = input.value.trim();
  if (!text) return;

  const newRow = StorageAPI.addRow(listId, text);
  const list = StorageAPI.getListById(listId);

  rowsContainer.appendChild(createRowElement(newRow, list, StorageAPI.getRowSortMode(listId)));
  input.value = "";
  renderList(list.id);
}

addBtn?.addEventListener("click", addRowToCurrentList);
input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addRowToCurrentList();
});

// ----------------------------
// List Settings
// ----------------------------
const openListSettingsBtn = document.getElementById("openListSettingsBtn");
const backToListBtn = document.getElementById("backToListBtn");
const listTitleEl = document.getElementById("currentListSettingsTitle");
const listSettings = document.getElementById("listSettings");

// List Settings event listeners

addEventListener("click", () => {
  if (openListSettingsBtn) {
    openListSettingsBtn.addEventListener("click", () => {
      AppRoute.toListSettings(StorageAPI.getListById(AppRoute.currentListId));
    });
  }
});

backToListBtn?.addEventListener("click", () => {
  const list = StorageAPI.getListById(AppRoute.currentListId);
  AppRoute.toList(list);
  listTitleEl.textContent = "";
});

listSettings.addEventListener("change", (e) => {
  const listId = AppRoute.currentListId;
  if (!listId) return;

  const list = StorageAPI.getListById(listId);
  if (!list) return;

  // =========================
  // OPTIONS
  // =========================
  if (e.target.id === "listSettingsEnableCounterCheckbox") {
    list.options = list.options || {};
    list.options.enableCounter = e.target.checked;
    StorageAPI.updateList(listId, list);
    return;
  }

  // =========================
  // SORT MODE (LIST ONLY)
  // =========================
  if (e.target.matches('#view-list-settings input[name="listRowSortSelect"]')) {
    StorageAPI.setRowSortMode(listId, e.target.value);
    renderList(listId);
  }
});

function getRowSortMode(listId) {
  const list = getListById(listId);
  return list?.sortMode || "manual";
}

function updateListOptions() {
  const enableCounterCheckbox =
    document.getElementById("listSettingsEnableCounterCheckbox");

  const listId = AppRoute.currentListId;
  if (!listId) return;

  const list = StorageAPI.getListById(listId);
  if (!list) return;

  list.options = list.options || {};
  list.options.enableCounter = enableCounterCheckbox.checked;

  StorageAPI.updateList(listId, list);
}

function updateListSortMode(e) {
  const radio = e.target;
  if (!radio.matches("input[type='radio']")) return;

  const listId = AppRoute.currentListId;
  if (!listId) return;

  const selectedMode = radio.value;
  StorageAPI.setRowSortMode(listId, selectedMode);

  // 🔥 wichtig für Sortable teardown/reinit
  renderList(listId);
}

window.renderListSettings = function(listId) {
  const list = StorageAPI.getListById(listId);

  listTitleEl.textContent = list.name;

  renderListSettingsContent(list);
  renderListStats(list);
};

function renderListSettingsContent(list) {
  // Options
  const listSettingsEnableCounterCheckbox = document.getElementById("listSettingsEnableCounterCheckbox");

  listSettingsEnableCounterCheckbox.checked = list.options?.enableCounter ?? false;

  // Sort Mode
  const sortMode = StorageAPI.getRowSortMode(list.id) || "manual";
  const sortModeRadios = document.querySelectorAll('input[name="listRowSortSelect"]');

  sortModeRadios.forEach(radio => {
    radio.checked = radio.value === sortMode;
  });
};

function renderListStats(list) {
  if (!list) return;

  const listStatsName = document.getElementById("listStatsName");
  const listStatsEntryCount = document.getElementById("listStatsEntryCount");
  const listStatsCounterSum = document.getElementById("listStatsCounterSum");

  const stats = calculateListStats(list);

  if (listStatsName) {
    listStatsName.textContent = stats.name;
  }

  if (listStatsEntryCount) {
    listStatsEntryCount.textContent = stats.entryCount;
  }

  if (listStatsCounterSum) {
    listStatsCounterSum.textContent = stats.counterSum;
  }
}

function calculateListStats(list) {
  if (!list) {
    return { name: "—", entryCount: 0, counterSum: 0 };
  }

  // 🔥 ALLE rows holen (global!)
  const allRows = JSON.parse(localStorage.getItem("stacked_rows") || "[]");

  // 🔥 nur rows dieser Liste
  const rows = allRows.filter(r => r.listId === list.id);

  let sum = 0;
  for (const r of rows) {
    sum += Number(r?.count) || 0;
  }

  return {
    name: list.name ?? "—",
    entryCount: rows.length,
    counterSum: sum
  };
};

const openListSettingsStatsBtn = document.querySelector('.open-list-settings-stats-btn');
const listStatsTooltip = document.querySelector('.list-stats');

openListSettingsStatsBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // verhindert sofortiges Schließen
  openListSettingsStatsBtn.classList.toggle('active');
});

document.addEventListener('click', () => {
  openListSettingsStatsBtn.classList.remove('active');
});

// optional: Klick im Tooltip soll ihn NICHT schließen
listStatsTooltip.addEventListener('click', (e) => {
  e.stopPropagation();
});