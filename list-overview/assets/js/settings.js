const dragHandle = document.getElementById("settingsDragHandle");
const container = document.querySelector(".container");

const settingsModalContainer = document.getElementById("settingsModalContainer");
const settingsModal = document.querySelector(".settings-modal");
const openSettingsButton = document.getElementById("openSettingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

const settingsPageRoot = document.getElementById("settingsPageRoot");
const settingsPageTheme = document.getElementById("settingsPageTheme");

const openThemePageBtn = document.getElementById("openThemePageBtn");
const backToSettingsRootBtn = document.getElementById("backToSettingsRootFromThemeBtn");
const themeDoneBtn = document.getElementById("themeDoneBtn");

const openStatsPageBtn = document.getElementById("openStatsPageBtn");
const settingsPageStats = document.getElementById("settingsPageStats");
const backToSettingsRootFromStatsBtn = document.getElementById("backToSettingsRootFromStatsBtn");
const statsDoneBtn = document.getElementById("statsDoneBtn");

const settingsPageSort = document.getElementById("settingsPageSort");
const openSortPageBtn = document.getElementById("openSortPageBtn");
const backToSettingsRootFromSortBtn = document.getElementById("backToSettingsRootFromSortBtn");
const sortDoneBtn = document.getElementById("sortDoneBtn");

// Performance
const settingsPagePerformance = document.getElementById("settingsPagePerformance");
const openPerformancePageBtn = document.getElementById("openPerformancePageBtn");
const backToSettingsRootFromPerformanceBtn = document.getElementById("backToSettingsRootFromPerformanceBtn");
const performanceDoneBtn = document.getElementById("performanceDoneBtn");

// =====================================================
// THEME CORE
// =====================================================

function getTheme() {
  return localStorage.getItem("theme") || "system";
}

function setTheme(theme) {
  localStorage.setItem("theme", theme);
  applyTheme(theme);
  syncHeaderToggle(theme);
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else if (theme === "light") {
    document.body.classList.remove("dark");
  } else {
    document.body.classList.toggle("dark", systemPrefersDark());
  }
}

// 🔥 FIX: Header Toggle korrekt bei system
function syncHeaderToggle(theme) {
  const headerToggle = document.getElementById("themeToggle");
  if (!headerToggle) return;

  if (theme === "dark") headerToggle.checked = true;
  else if (theme === "light") headerToggle.checked = false;
  else headerToggle.checked = systemPrefersDark();
}

// =====================================================
// PERFORMANCE MODE
// =====================================================

function getPerformanceMode() {
  return localStorage.getItem("performanceMode") || "auto";
}

function setPerformanceMode(mode) {
  localStorage.setItem("performanceMode", mode);
  applyPerformanceMode();
}

function getTotalItemCount() {
  try {
    const data = StorageAPI.exportData();
    const listCount = data.lists?.length || 0;
    const rowCount = data.rows?.length || 0;
    return listCount + rowCount;
  } catch {
    return 0;
  }
}

function applyPerformanceMode() {
  const mode = getPerformanceMode();

  let enableReduceLag = false;

  if (mode === "on") {
    enableReduceLag = true;
  } else if (mode === "off") {
    enableReduceLag = false;
  } else {
    // 🔥 AUTO MODE
    const total = getTotalItemCount();

    // Schwelle kannst du später tweaken
    enableReduceLag = total > 200;
  }

  if (enableReduceLag) {
    PerformanceFlags.virtualizeRows = true;
  } else {
    PerformanceFlags.virtualizeRows = false;
  }

  document.body.classList.toggle("reduce-lag-mode", enableReduceLag);
  document.dispatchEvent(new CustomEvent("performanceModeChanged"));
}

// ========================================
// PERFORMANCE FLAGS
// ========================================

window.PerformanceFlags = {
  virtualizeRows: false
};

// =====================================================
// OPEN / CLOSE
// =====================================================

function openSettings() {
  settingsModalContainer.classList.remove("hidden");
  settingsModal.classList.remove("hidden");

  requestAnimationFrame(() => {
    settingsModal.classList.add("open");
  });

  container.style.transform = "scale(0.94)";
  showRootPage();
  syncThemeRadios();
  syncListSortRadios();
  renderStats();
}

function closeSettings() {
  settingsModal.classList.remove("open");
  container.style.transform = "scale(1)";

  setTimeout(() => {
    settingsModalContainer.classList.add("hidden");
    settingsModal.classList.add("hidden");
    settingsModal.style.transform = "";
  }, 280);
}

openSettingsButton?.addEventListener("click", openSettings);
closeSettingsBtn?.addEventListener("click", closeSettings);

// backdrop click
settingsModalContainer?.addEventListener("click", (e) => {
  if (e.target === settingsModalContainer) closeSettings();
});

// =====================================================
// PAGE NAV
// =====================================================

function showRootPage() {
  settingsPageRoot.classList.remove("hidden");
  settingsPageTheme.classList.add("hidden");
  settingsPageSort?.classList.add("hidden");
  settingsPagePerformance?.classList.add("hidden");
}

function showThemePage() {
  settingsPageRoot.classList.add("hidden");
  settingsPageTheme.classList.remove("hidden");
  settingsPageSort.classList.add("hidden");
  settingsPagePerformance.classList.add("hidden");
  settingsPageStats.classList.add("hidden");
}

function showSortPage() {
  settingsPageRoot.classList.add("hidden");
  settingsPageTheme.classList.add("hidden");
  settingsPageSort.classList.remove("hidden");
  settingsPagePerformance.classList.add("hidden");
  syncListSortRadios();
}

function showStatsPage() {
  settingsPageRoot.classList.add("hidden");
  settingsPageTheme.classList.add("hidden");
  settingsPageSort.classList.add("hidden");
  settingsPagePerformance.classList.add("hidden");
  settingsPageStats.classList.remove("hidden");
}

function showPerformancePage() {
  settingsPageRoot.classList.add("hidden");
  settingsPageTheme.classList.add("hidden");
  settingsPageSort.classList.add("hidden");
  settingsPageStats.classList.add("hidden");
  settingsPagePerformance.classList.remove("hidden");
  syncPerformanceRadios();
}


openThemePageBtn?.addEventListener("click", showThemePage);
backToSettingsRootBtn?.addEventListener("click", showRootPage);
themeDoneBtn?.addEventListener("click", closeSettings);

openSortPageBtn?.addEventListener("click", showSortPage);
backToSettingsRootFromSortBtn?.addEventListener("click", showRootPage);
sortDoneBtn?.addEventListener("click", closeSettings);

openStatsPageBtn?.addEventListener("click", () => {
  showStatsPage();
  renderStats(); // 🔥 wichtig
});
backToSettingsRootFromStatsBtn?.addEventListener("click", showRootPage);
statsDoneBtn?.addEventListener("click", closeSettings);

openPerformancePageBtn?.addEventListener("click", showPerformancePage);
backToSettingsRootFromPerformanceBtn?.addEventListener("click", showRootPage);
performanceDoneBtn?.addEventListener("click", closeSettings);

// =====================================================
// THEME RADIO SYNC
// =====================================================

function syncThemeRadios() {
  const theme = getTheme();
  document.querySelectorAll('input[name="themeSelect"]').forEach(r => {
    r.checked = r.value === theme;
  });
}

document.querySelectorAll('input[name="themeSelect"]').forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.checked) setTheme(radio.value);
  });
});

// =====================================================
// LIST SORT RADIO SYNC
// =====================================================

function syncListSortRadios() {
  const mode = StorageAPI.getListSortMode();
  document.querySelectorAll('input[name="listSortSelect"]').forEach(r => {
    r.checked = r.value === mode;
  });
}

document.querySelectorAll('input[name="listSortSelect"]').forEach(radio => {
  radio.addEventListener("change", () => {
    if (!radio.checked) return;
    StorageAPI.setListSortMode(radio.value);
    renderOverview();
  });
});

// =====================================================
// PERFORMANCE RADIO SYNC
// =====================================================

function syncPerformanceRadios() {
  const mode = getPerformanceMode();

  document.querySelectorAll('input[name="performanceModeSelect"]')
    .forEach(r => {
      r.checked = r.value === mode;
    });
}

document.querySelectorAll('input[name="performanceModeSelect"]')
  .forEach(radio => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      setPerformanceMode(radio.value);
    });
  });

// =====================================================
// HEADER TOGGLE → SETTINGS SYNC
// =====================================================

document.getElementById("themeToggle")?.addEventListener("change", (e) => {
  setTheme(e.target.checked ? "dark" : "light");
});

// =====================================================
// 🔥 NEXT LEVEL DRAG PHYSICS
// =====================================================

let startY = 0;
let currentY = 0;
let velocity = 0;
let lastY = 0;
let lastTime = 0;
let dragging = false;

dragHandle?.addEventListener("pointerdown", (e) => {
  dragging = true;
  startY = e.clientY;
  lastY = e.clientY;
  lastTime = performance.now();

  settingsModal.style.transition = "none";
  dragHandle.setPointerCapture(e.pointerId);
});

dragHandle?.addEventListener("pointermove", (e) => {
  if (!dragging) return;

  const now = performance.now();
  const dy = e.clientY - lastY;
  const dt = now - lastTime;

  velocity = dy / dt;

  lastY = e.clientY;
  lastTime = now;

  currentY = Math.max(0, e.clientY - startY);

  settingsModal.style.transform = `translateY(${currentY}px)`;
});

dragHandle?.addEventListener("pointerup", () => {
  if (!dragging) return;
  dragging = false;

  settingsModal.style.transition = "transform 0.28s cubic-bezier(.2,.8,.2,1)";

  const shouldClose =
    currentY > 140 || velocity > 0.9;

  if (shouldClose) {
    settingsModal.style.transform = "translateY(100%)";
    setTimeout(closeSettings, 220);
  } else {
    settingsModal.style.transform = "translateY(0)";
  }
});

// =====================================================
// 📊 STATS RENDER
// =====================================================

function renderStats() {
  try {
    const data = StorageAPI.exportData();

    const lists = data.lists || [];
    const rows = data.rows || [];

    // ----------------------------
    // BASIC
    // ----------------------------
    const totalLists = lists.length;
    const totalRows = rows.length;

    // ----------------------------
    // Ø rows per list
    // ----------------------------
    const avgRows =
      totalLists > 0 ? (totalRows / totalLists).toFixed(1) : 0;

    // ----------------------------
    // größte Liste
    // ----------------------------
    let largestListSize = 0;
    let largestListName = "-";

    const rowsByList = {};

    rows.forEach(r => {
      rowsByList[r.listId] = (rowsByList[r.listId] || 0) + 1;
    });

    lists.forEach(list => {
      const count = rowsByList[list.id] || 0;
      if (count > largestListSize) {
        largestListSize = count;
        largestListName = list.name || "Unbenannt";
      }
    });

    // ----------------------------
    // leere Listen
    // ----------------------------
    const emptyLists = lists.filter(
      l => !(rowsByList[l.id] > 0)
    ).length;

    // ----------------------------
    // counter sum
    // ----------------------------
    const counterSum = rows.reduce(
      (sum, r) => sum + (r.count || 0),
      0
    );

    // ----------------------------
    // meistgeklickt
    // ----------------------------
    let mostClicked = "-";
    let maxCount = -1;

    rows.forEach(r => {
      const c = r.count || 0;
      if (c > maxCount) {
        maxCount = c;
        mostClicked = r.title || r.name || "-";
      }
    });

    // =================================================
    // 🔥 DOM UPDATE
    // =================================================

    setText("totalListsStat", totalLists);
    setText("totalRowsStat", totalRows);
    setText("avgRowsStat", avgRows);
    setText(
      "largestListStat",
      largestListSize > 0
        ? `${largestListName} (${largestListSize})`
        : "-"
    );
    setText("emptyListsStat", emptyLists);
    setText("counterSumStat", counterSum);
    setText("mostClickedStat", mostClicked);

  } catch (err) {
    console.error("Stats render failed", err);
  }

  // ===============================
  // STAT-CARD Section
  // ===============================

  const statCardColors = [
    "#FFB3BA", // pastel red
    "#FFDFBA", // pastel orange
    "#FFF3B0", // pastel yellow
    "#C7F9CC", // pastel mint
    "#BDE0FE", // pastel blue
    "#D7C0F1", // pastel lavender
    "#F1C0E8", // pastel pink
    "#CDEAC0", // soft green
    "#E2F0CB", // light lime
    "#CFE8FF"  // soft sky
  ];

  colorizeStatCards();

  function colorizeStatCards() {
    const cards = document.querySelectorAll(".stat-card");

    cards.forEach((card, index) => {
      const color = statCardColors[index % statCardColors.length];
      card.style.backgroundColor = color; // oder: card.style.setProperty("--card-color", color)
    });
  }
}

// =====================================================
// STATS Card Stack
// =====================================================

const stack = document.querySelector('.card-stack');
const cards = document.querySelectorAll('.stat-card');

let activeCard = null;

cards.forEach(card => {
  card.addEventListener('click', (e) => {
    e.stopPropagation();

    // ✅ Wenn diese Card schon offen ist → schließen
    if (activeCard === card) {
      card.classList.remove('active');
      stack.classList.remove('dimmed');
      activeCard = null;
      return;
    }

    // ✅ Wenn eine ANDERE offen ist → nur schließen
    if (activeCard && activeCard !== card) {
      activeCard.classList.remove('active');
      stack.classList.remove('dimmed');
      activeCard = null;
      return; // 🔥 wichtig: NICHT neue öffnen
    }

    // ✅ Wenn keine offen ist → diese öffnen
    card.classList.add('active');
    stack.classList.add('dimmed');
    activeCard = card;
  });
});

document.addEventListener('click', (e) => {
  if (!stack.contains(e.target) && activeCard) {
    activeCard.classList.remove('active');
    stack.classList.remove('dimmed');
    activeCard = null;
  }
});


// kleine helper
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// =====================================================
// INIT
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  const theme = getTheme();
  applyTheme(theme);
  syncHeaderToggle(theme);
  applyPerformanceMode();

  // 🔥 live system change
  window.matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (getTheme() === "system") {
        applyTheme("system");
        syncHeaderToggle("system");
      }
    });
});

// =====================================================
// EXPORT
// =====================================================

document.getElementById("exportDataBtn")?.addEventListener("click", () => {
  const data = StorageAPI.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "stacked-backup.json";
  a.click();

  URL.revokeObjectURL(url);
});






// =====================================================
// IMPORT BUTTON → FILE PICKER
// =====================================================

document.getElementById("importDataBtn")?.addEventListener("click", () => {
  document.getElementById("importFileInput")?.click();
});

// =====================================================
// IMPORT
// =====================================================

document.getElementById("importFileInput")?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Backup der aktuellen Daten
  const currentData = StorageAPI.exportData();
  localStorage.setItem("stacked-auto-backup", JSON.stringify(currentData));

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const importedData = JSON.parse(reader.result);

      // Merge Logik
      const mergedData = mergeData(currentData, importedData);

      StorageAPI.importData(mergedData);
      location.reload();
    } catch (err) {
      console.error(err);
      alert("Import fehlgeschlagen");
    }
  };
  reader.readAsText(file);
});

// =====================================================
// MERGE FUNCTION
// =====================================================

function mergeData(current, incoming) {
  // =========================
  // LISTS MERGE
  // =========================
  const mergedLists = [...(current.lists || [])];

  incoming.lists?.forEach(inList => {
    const existing = mergedLists.find(l => l.id === inList.id);

    if (existing) {
      // vorhandene Liste aktualisieren
      existing.name = inList.name || existing.name;
      existing.options = { ...existing.options, ...inList.options };
      existing.slug = inList.slug || existing.slug;
      existing.createdAt = inList.createdAt || existing.createdAt;
    } else {
      mergedLists.push(inList);
    }
  });

  // =========================
  // ROWS MERGE (🔥 WICHTIG)
  // =========================
  const mergedRows = [...(current.rows || [])];

  incoming.rows?.forEach(inRow => {
    const exists = mergedRows.find(r => r.id === inRow.id);

    if (exists) {
      Object.assign(exists, inRow);
    } else {
      mergedRows.push(inRow);
    }
  });

  // =========================
  // ORDER MERGE (optional safe)
  // =========================
  const mergedOrderLists = [
    ...(current.orderLists || []),
    ...((incoming.orderLists || []).filter(
      id => !(current.orderLists || []).includes(id)
    ))
  ];

  return {
    ...current,
    lists: mergedLists,
    rows: mergedRows,
    orderLists: mergedOrderLists,
    settings: incoming.settings || current.settings,
    sort: incoming.sort || current.sort
  };
}

// Hilfsfunktion für Zeilen/Items in einer Liste
function mergeRows(currentRows = [], incomingRows = []) {
  const merged = [...currentRows];

  incomingRows.forEach(row => {
    const exists = merged.find(r => r.id === row.id);
    if (exists) {
      // Vorhandenes Item aktualisieren
      Object.assign(exists, row);
    } else {
      merged.push(row);
    }
  });

  return merged;
}

// =====================================================
// CREATE BACKUP
// =====================================================

document.getElementById("createBackupBtn")?.addEventListener("click", () => {
  const data = StorageAPI.exportData();
  localStorage.setItem("stacked-backup", JSON.stringify(data));
  alert("Backup erstellt");
});

// =====================================================
// RESTORE BACKUP
// =====================================================

document.getElementById("restoreBackupBtn")?.addEventListener("click", () => {
  const raw = localStorage.getItem("stacked-backup");
  if (!raw) {
    alert("Kein Backup vorhanden");
    return;
  }

  // ⚠️ WARNUNG
  const confirmed = confirm(
    "⚠️ Backup wiederherstellen?\n\n" +
    "Alle aktuellen Daten werden überschrieben und auf den Stand des letzten Backups zurückgesetzt.\n\n" +
    "Dieser Vorgang kann nicht rückgängig gemacht werden."
  );

  if (!confirmed) return;

  try {
    const data = JSON.parse(raw);
    StorageAPI.importData(data);
    location.reload();
  } catch {
    alert("Backup beschädigt");
  }
});



// Reduce Lag Virtuell container, only render rows that are in or near the viewport
function setupVirtualScroll(container) {
  container.removeEventListener("scroll", handleVirtualScroll);

  if (window.PerformanceFlags?.virtualizeRows) {
    container.addEventListener("scroll", handleVirtualScroll, { passive: true });
  }
}

let virtualState = {
  start: 0,
  end: 0,
  rowHeight: 51,
  buffer: 500 / 51 // 500px Puffer
};

function renderVirtualRows(allRows, container) {
  if (!window.PerformanceFlags?.virtualizeRows) {
    container.innerHTML = "";
    allRows.forEach(r => container.appendChild(r));
    return;
  }

  const scrollTop = container.scrollTop;
  const height = container.clientHeight;

  const visibleCount = Math.ceil(height / virtualState.rowHeight);
  const start = Math.max(0, Math.floor(scrollTop / virtualState.rowHeight) - virtualState.buffer);
  const end = Math.min(allRows.length, start + visibleCount + virtualState.buffer * 2);

  container.innerHTML = "";

  const spacerTop = document.createElement("div");
  spacerTop.style.height = (start * virtualState.rowHeight) + "px";

  const spacerBottom = document.createElement("div");
  spacerBottom.style.height = ((allRows.length - end) * virtualState.rowHeight) + "px";

  container.appendChild(spacerTop);

  for (let i = start; i < end; i++) {
    container.appendChild(allRows[i]);
  }

  container.appendChild(spacerBottom);
}

container.addEventListener("scroll", () => {
  renderVirtualRows(allRows, container);
});

document.addEventListener("performanceModeChanged", () => {
  // optional re-render trigger
  if (window.forceRerenderRows) {
    window.forceRerenderRows();
  }
});