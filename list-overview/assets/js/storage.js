// scripts/storage.js
// =====================================================
// STORAGE API
// - lists: { id, name, slug, createdAt, options }
// - rows:  { id, listId, title, count, content }
// =====================================================

const KEYS = {
  LISTS: "stacked_lists",
  ROWS:  "stacked_rows"
};

KEYS.SETTINGS = "stacked_settings";

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[ä]/g, "ae").replace(/[ö]/g, "oe").replace(/[ü]/g, "ue").replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

window.StorageAPI = {
  // ---------- LISTS ----------
  getLists() {
    return read(KEYS.LISTS, []);
  },

  getListById(id) {
    return this.getLists().find(l => l.id === id) ?? null;
  },

  createList(name, options = {}) {
    const lists = read(KEYS.LISTS, []);

    const list = {
      id: crypto.randomUUID(),
      name,
      slug: slugify(name),
      createdAt: Date.now(),
      options: {
        enableCounter: false
      }
    };

    lists.push(list);
    write(KEYS.LISTS, lists);

    return list;
  },


  deleteList(listId) {
    // remove list
    write(KEYS.LISTS, read(KEYS.LISTS, []).filter(l => l.id !== listId));
    // remove rows of this list
    write(KEYS.ROWS, read(KEYS.ROWS, []).filter(r => r.listId !== listId));

    
    write(ORDER_KEYS.LISTS, read(ORDER_KEYS.LISTS, []).filter(id => id !== listId));
    // und rows order key löschen:
    localStorage.removeItem(ORDER_KEYS.ROWS_PREFIX + listId);
  },

  updateList(listId, patch) {
    const lists = read(KEYS.LISTS, []);
    const list = lists.find(l => l.id === listId);
    if (!list) return null;

    if (typeof patch.name === "string") {
      const cleanName = patch.name.trim();
      list.name = cleanName;
      list.slug = slugify(cleanName); // slug aktualisieren
    }

    // falls du später mehr patchen willst (options usw.)
    if (patch.options && typeof patch.options === "object") {
      list.options = { ...(list.options || {}), ...patch.options };
    }

    write(KEYS.LISTS, lists);
    return list;
  },

  // ---------- ROWS ----------
  getRowsByListId(listId) {
    return read(KEYS.ROWS, []).filter(r => r.listId === listId);
  },

  addRow(listId, title) {
    const rows = read(KEYS.ROWS, []);
    const row = {
      id: crypto.randomUUID(),
      listId,
      title: title.trim(),
      count: 0,
      content: ""
    };
    rows.push(row);
    write(KEYS.ROWS, rows);
    return row;

    const key = ORDER_KEYS.ROWS_PREFIX + listId;
    const order = read(key, []);
    order.push(row.id);
    write(key, order);
  },

  updateRow(rowId, patch) {
    const rows = read(KEYS.ROWS, []);
    const r = rows.find(x => x.id === rowId);
    if (!r) return null;
    Object.assign(r, patch);
    write(KEYS.ROWS, rows);
    return r;
  },

  deleteRow(rowId) {
    write(KEYS.ROWS, read(KEYS.ROWS, []).filter(r => r.id !== rowId));

    const rows = read(KEYS.ROWS, []);
    const row = rows.find(r => r.id === rowId);
    if (row) {
      const key = ORDER_KEYS.ROWS_PREFIX + row.listId;
      write(key, read(key, []).filter(id => id !== rowId));
    }
  }
};

// --- ORDER KEYS ---
const ORDER_KEYS = {
  LISTS: "stacked_listOrder",
  ROWS_PREFIX: "stacked_rowOrder_" // + listId
};

// --- ORDER API ---
StorageAPI.getListOrder = function () {
  return read(ORDER_KEYS.LISTS, []);
};

StorageAPI.setListOrder = function (ids) {
  write(ORDER_KEYS.LISTS, ids);
};

StorageAPI.getRowOrder = function (listId) {
  return read(ORDER_KEYS.ROWS_PREFIX + listId, []);
};

StorageAPI.setRowOrder = function (listId, ids) {
  write(ORDER_KEYS.ROWS_PREFIX + listId, ids);
};


StorageAPI.getListsSorted = function () {
  const lists = this.getLists();
  const order = this.getListOrder();

  const map = new Map(lists.map(l => [l.id, l]));
  const ordered = order.map(id => map.get(id)).filter(Boolean);

  // neue Listen, die noch nicht in order sind, hinten anhängen
  const remaining = lists.filter(l => !order.includes(l.id));
  return [...ordered, ...remaining];
};

StorageAPI.getRowsByListIdSorted = function (listId) {
  const rows = this.getRowsByListId(listId);
  const order = this.getRowOrder(listId);

  const map = new Map(rows.map(r => [r.id, r]));
  const ordered = order.map(id => map.get(id)).filter(Boolean);

  const remaining = rows.filter(r => !order.includes(r.id));
  return [...ordered, ...remaining];
};

// ---------- SETTINGS ----------
StorageAPI.getSettings = function () {
  return read(KEYS.SETTINGS, {
    theme: "system",
    accentColor: "#ff3b30",
    defaults: {
      enableCounter: true
    }
  });
};

StorageAPI.updateSettings = function (patch) {
  const current = this.getSettings();
  const next = {
    ...current,
    ...patch,
    defaults: {
      ...(current.defaults || {}),
      ...(patch.defaults || {})
    }
  };
  write(KEYS.SETTINGS, next);
  return next;
};

// =====================================================
// SORT MODES
// =====================================================

KEYS.SORT = "stacked_sortModes";

StorageAPI.getSortModes = function () {
  return read(KEYS.SORT, {
    lists: "manual",
    rows: {} // per listId
  });
};

StorageAPI.setListSortMode = function (mode) {
  const s = this.getSortModes();
  s.lists = mode;
  write(KEYS.SORT, s);
};

StorageAPI.setRowSortMode = function (listId, mode) {
  const s = this.getSortModes();
  s.rows[listId] = mode;
  write(KEYS.SORT, s);
};

StorageAPI.getListSortMode = function () {
  return this.getSortModes().lists || "manual";
};

StorageAPI.getRowSortMode = function (listId) {
  return this.getSortModes().rows[listId] || "manual";
};

// =====================================================
// EXPORT / IMPORT
// =====================================================

StorageAPI.exportData = function () {
  return {
    lists: read(KEYS.LISTS, []),
    rows: read(KEYS.ROWS, []),
    orderLists: read(ORDER_KEYS.LISTS, []),
    settings: this.getSettings(),
    sort: this.getSortModes()
  };
};

StorageAPI.importData = function (data) {
  if (!data) return false;

  write(KEYS.LISTS, data.lists || []);
  write(KEYS.ROWS, data.rows || []);
  write(ORDER_KEYS.LISTS, data.orderLists || []);
  write(KEYS.SETTINGS, data.settings || {});
  write(KEYS.SORT, data.sort || { lists: "manual", rows: {} });

  return true;
};