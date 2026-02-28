// scripts/router.js
// =====================================================
// ROUTER (GitHub Pages safe)
// - #/lists
// - #/lists/<slug>--<id>
// =====================================================

function parseRoute() {
  const hash = location.hash || "#/lists";
  return hash.slice(2).split("/"); // ["lists"] or ["lists", "slug--id"]
}

function parseListId(param) {
  return param.split("--").pop();
}

function showView(name) {
  const overview = document.getElementById("view-overview");
  const list = document.getElementById("view-list");
  const listSettings = document.getElementById("view-list-settings");
  if (!overview || !list || !listSettings) return;

  overview.hidden = name !== "overview";
  list.hidden = name !== "list";
  listSettings.hidden = name !== "listSettings";
}

window.AppRoute = {
  currentListId: null,
  toOverview() { location.hash = "#/lists"; },
  toList(list) { location.hash = `#/lists/${list.slug}--${list.id}`; },
  toListSettings(list) { location.hash = `#/lists/${list.slug}--${list.id}/settings`; }
};

function renderRoute() {
  const [root, param, sub] = parseRoute();

  if (root !== "lists") {
    AppRoute.toOverview();
    return;
  }

  // =============================
  // OVERVIEW
  // =============================
  if (!param) {
    AppRoute.currentListId = null;
    showView("overview");
    window.renderOverview?.();
    return;
  }

  const listId = parseListId(param);
  AppRoute.currentListId = listId;

  // =============================
  // LIST SETTINGS
  // =============================
  if (sub === "settings") {
    showView("listSettings");
    window.renderListSettings?.(listId);
    return;
  }

  // =============================
  // LIST (default)
  // =============================
  showView("list");
  window.renderList?.(listId);
}

window.addEventListener("hashchange", renderRoute);
document.addEventListener("DOMContentLoaded", renderRoute);