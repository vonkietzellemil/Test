// scripts/swipe.js
// =====================================================
// Swipe to Delete (Touch devices)
// - Swipe left to delete
// - Tap does NOT delete
// - onDeleteAttempt() must return true (delete) or false (cancel)
// =====================================================

window.enableSwipeToDelete = function enableSwipeToDelete(rowEl, onDeleteAttempt) {
  const isTouch = window.matchMedia("(hover: none)").matches;
  if (!isTouch) return;

  let startX = 0;
  let currentX = 0;
  let isSwiping = false;
  let hasMoved = false;

  const SWIPE_THRESHOLD = 120;
  const TAP_THRESHOLD = 10;

  function reset() {
    rowEl.style.transform = "";
    rowEl.style.opacity = "";
    rowEl.classList.remove("delete-ready");
  }

  rowEl.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    currentX = startX;
    isSwiping = true;
    hasMoved = false;
    rowEl.classList.add("swiping");
  }, { passive: true });

  rowEl.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;

    currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;

    if (Math.abs(deltaX) > TAP_THRESHOLD) hasMoved = true;

    if (deltaX < 0) {
      rowEl.style.transform = `translateX(${deltaX}px)`;
      if (deltaX < -SWIPE_THRESHOLD) rowEl.classList.add("delete-ready");
      else rowEl.classList.remove("delete-ready");
    }
  }, { passive: true });

  rowEl.addEventListener("touchend", () => {
    isSwiping = false;
    rowEl.classList.remove("swiping");

    const deltaX = currentX - startX;

    // Tap -> nix
    if (!hasMoved || Math.abs(deltaX) < TAP_THRESHOLD) {
      reset();
      return;
    }

    // Nicht weit genug -> zurück
    if (!(deltaX < -SWIPE_THRESHOLD)) {
      reset();
      return;
    }

    // Weit genug -> Löschversuch (mit Confirm möglich)
    const ok = (typeof onDeleteAttempt === "function") ? onDeleteAttempt() : true;

    if (!ok) {
      // Nutzer hat abgebrochen
      reset();
      return;
    }

    // Löschen
    rowEl.style.transform = "translateX(-110%)";
    rowEl.style.opacity = "0";
    if (navigator.vibrate) navigator.vibrate(10);

    setTimeout(() => {
      rowEl.remove();
    }, 250);
  });

  // Click nach Swipe blockieren
  rowEl.addEventListener("click", (e) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
};