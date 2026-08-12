export function autoPosition(
  triggerEl,
  positioningEl,
  placement="auto-auto"
) {
  const rect = triggerEl.getBoundingClientRect();
  const positioningElRect = positioningEl.getBoundingClientRect();

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const gap = 8; // Unser flexibler Sicherheitsabstand

  let top = 0;
  let left = 0;

  let chosenVertical = placement.split("-")[0] || "auto";
  let chosenHorizontal = placement.split("-")[1] || "auto";

  // --- 1. CALC VERTICAL PREFERENCE ---
  if (chosenVertical === "auto") {
    const triggerCenterY = rect.top + rect.height / 2;
    chosenVertical = triggerCenterY < viewportHeight / 2 ? "bottom" : "top";
  }

  if (chosenVertical === "top") {
    top = rect.top - positioningElRect.height - gap;
  } else {
    top = rect.bottom + gap;
  }

  // --- 2. CALC HORIZONTAL PREFERENCE ---
  if (chosenHorizontal === "auto") {
    const triggerCenterX = rect.left + rect.width / 2;
    chosenHorizontal = triggerCenterX < viewportWidth / 2 ? "left" : "right";
  }

  if (chosenHorizontal === "right") {
    left = rect.right - positioningElRect.width;
  } else {
    left = rect.left;
  }

  // --- 3. COLLISION DETECTION (FALLBACKS) ---
  // Check if el is cut of at the left
  if (left < gap) {
    left = gap;
  }
  // Check if el is cut of at the right
  if (left + positioningElRect.width > viewportWidth - gap) {
    left = viewportWidth - positioningElRect.width - gap;
  }
  // Check if el is cut of at the bottom
  if (top + positioningElRect.height > viewportHeight - gap) {
    top = rect.top - positioningElRect.height - gap;
  }
  // Check if el is cut of at the top
  if (top < gap) {
    top = gap;
  }

  positioningEl.style.left = `${left + window.scrollX}px`;
  positioningEl.style.top = `${top + window.scrollY}px`;
  positioningEl.style.visibility = "visible";
}