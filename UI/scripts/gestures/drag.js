export class Drag {
  constructor({
    handle,
    direction = "horizontal",
    deadzone = 10,
    thresholdDistance = 100,
    thresholdVelocity = 0.9,

    condition,

    getElementsToAnimate = () => { return [] },

    onStart,
    onMove,
    onEnd,
    onThresholdCrossed,
    onThresholdNotCrossed,
  }) {

    // Set Arguments
    this.handle = handle;
    this.direction = direction;
    this.deadzone = deadzone;
    this.thresholdDistance = thresholdDistance;
    this.thresholdVelocity = thresholdVelocity;

    this.condition = condition;

    this.getElementsToAnimate = getElementsToAnimate;
    this.onStart = onStart;
    this.onMove = onMove;
    this.onEnd = onEnd;
    this.onThresholdCrossed = onThresholdCrossed;
    this.onThresholdNotCrossed = onThresholdNotCrossed;


    // Needed states that have to be accessable to all function while dragging
    this.state = {
      pointerDown: false,
      dragging: false,

      startX: 0,
      startY: 0,

      dragDirection: null,
      animatedElements: [],
      originalTransitions: new Map(),

      velocity: 0,
      lastPos: 0,
      lastTime: 0,
    };


    handle.addEventListener("pointerdown", e => {
      if (!condition?.(e) === false) return;
      this.state.pointerDown = true;
      this.state.dragging = false;

      this.state.startX = e.clientX;
      this.state.startY = e.clientY;

      this.state.dragDirection = null;

      this.state.originalTransitions.clear();

      this.state.animatedElements = getElementsToAnimate();

      this.state.animatedElements.forEach(el => {
        if (!el) return;

        this.state.originalTransitions.set(el, el.style.transition);
        el.style.transition = "none";
      });

      handle.setPointerCapture(e.pointerId);
      
      this.state.lastPos =
        direction === "horizontal"
          ? e.clientX
          : e.clientY;

      this.state.lastTime = performance.now();
      this.state.velocity = 0;

      onStart?.(e);
    });

    handle.addEventListener("pointermove", e => {
      if (!this.state.pointerDown) return;

      const dx = e.clientX - this.state.startX;
      const dy = e.clientY - this.state.startY;

      if (this.state.dragDirection === null) {
        if (Math.hypot(dx, dy) < deadzone) return;

        this.state.dragDirection =
          Math.abs(dx) > Math.abs(dy)
            ? "horizontal"
            : "vertical";
      }

      if (this.state.dragDirection !== direction) return;

      this.state.dragging = true;


      const currentPos =
        direction === "horizontal"
          ? e.clientX
          : e.clientY;

      const now = performance.now();

      const deltaPos = currentPos - this.state.lastPos;
      const deltaTime = now - this.state.lastTime;

      if (deltaTime > 0) {
        this.state.velocity = deltaPos / deltaTime;
      }

      this.state.lastPos = currentPos;
      this.state.lastTime = now;


      onMove?.({
        event: e,
        dx,
        dy,
        startX: this.state.startX,
        startY: this.state.startY,
      });
    });

    const finishDrag = (e) => {
      if (!this.state.pointerDown) return;

      this.state.pointerDown = false;

      // Restore transitions BEFORE callbacks trigger animations
      this.state.animatedElements.forEach(el => {
        if (!el) return;
        el.style.transition =
          this.state.originalTransitions.get(el) ?? "";
      });

      if (!this.state.dragging) {
        onEnd?.({ event: e, dx: 0, dy: 0 });
        return;
      }

      if (handle.hasPointerCapture(e.pointerId)) {
        handle.releasePointerCapture(e.pointerId);
      }

      requestAnimationFrame(() => {
        const dx = e.clientX - this.state.startX;
        const dy = e.clientY - this.state.startY;

        const distance =
          direction === "horizontal"
            ? dx
            : dy;

        const crossedDistance =
          Math.abs(distance) >= thresholdDistance;

        const crossedVelocity =
          Math.abs(this.state.velocity) >= thresholdVelocity;

        if (crossedDistance || crossedVelocity) {
          onThresholdCrossed?.({
            event: e,
            dx,
            dy,
            velocity: this.state.velocity,
            crossedDistance,
            crossedVelocity,
          });
        } else {
          onThresholdNotCrossed?.({
            event: e,
            dx,
            dy,
            velocity: this.state.velocity,
          });
        }


        onEnd?.({ event: e, dx, dy });
      });

      this.state.dragging = false;
    }

    handle.addEventListener("pointerup", finishDrag);
    handle.addEventListener("pointercancel", finishDrag);
  }


  destroy() {
    this.handle.removeEventListener("pointerdown", this._handlePointerDown);
    this.handle.removeEventListener("pointermove", this._handlePointerMove);
    this.handle.removeEventListener("pointerup", this._finishDrag);
    this.handle.removeEventListener("pointercancel", this._finishDrag);
  }

}





// ======================================
// Initial drag function
// ======================================

// function enableDrag({
//   handle,
//   direction = "horizontal",
//   deadzone = 10,
//   thresholdDistance = 100,
//   thresholdVelocity = 0.9,

//   condition,

//   getElementsToAnimate = () => { return [] },

//   onStart,
//   onMove,
//   onEnd,
//   onThresholdCrossed,
//   onThresholdNotCrossed,
// }) {
//   let pointerDown = false;
//   let dragging = false;

//   let startX = 0;
//   let startY = 0;

//   let dragDirection = null;

//   let animatedElements = [];

//   let velocity = 0;
//   let lastPos = 0;
//   let lastTime = 0;

//   const originalTransitions = new Map();

//   handle.addEventListener("pointerdown", e => {
//     if (!condition?.(e) === false) return;
//     pointerDown = true;
//     dragging = false;

//     startX = e.clientX;
//     startY = e.clientY;

//     dragDirection = null;

//     originalTransitions.clear();

//     animatedElements = getElementsToAnimate();

//     animatedElements.forEach(el => {
//       if (!el) return;

//       originalTransitions.set(el, el.style.transition);
//       el.style.transition = "none";
//     });

//     handle.setPointerCapture(e.pointerId);
    
//     lastPos =
//       direction === "horizontal"
//         ? e.clientX
//         : e.clientY;

//     lastTime = performance.now();
//     velocity = 0;

//     onStart?.(e);
//   });

//   handle.addEventListener("pointermove", e => {
//     if (!pointerDown) return;

//     const dx = e.clientX - startX;
//     const dy = e.clientY - startY;

//     if (dragDirection === null) {
//       if (Math.hypot(dx, dy) < deadzone) return;

//       dragDirection =
//         Math.abs(dx) > Math.abs(dy)
//           ? "horizontal"
//           : "vertical";
//     }

//     if (dragDirection !== direction) return;

//     dragging = true;


//     const currentPos =
//       direction === "horizontal"
//         ? e.clientX
//         : e.clientY;

//     const now = performance.now();

//     const deltaPos = currentPos - lastPos;
//     const deltaTime = now - lastTime;

//     if (deltaTime > 0) {
//       velocity = deltaPos / deltaTime;
//     }

//     lastPos = currentPos;
//     lastTime = now;


//     onMove?.({
//       event: e,
//       dx,
//       dy,
//       startX,
//       startY,
//     });
//   });

//   function finishDrag(e) {
//     if (!pointerDown) return;

//     pointerDown = false;

//     // Restore transitions BEFORE callbacks trigger animations
//     animatedElements.forEach(el => {
//       if (!el) return;
//       el.style.transition =
//         originalTransitions.get(el) ?? "";
//     });

//     if (!dragging) {
//       onEnd?.({ event: e, dx: 0, dy: 0 });
//       return;
//     }

//     if (handle.hasPointerCapture(e.pointerId)) {
//       handle.releasePointerCapture(e.pointerId);
//     }

//     requestAnimationFrame(() => {
//       const dx = e.clientX - startX;
//       const dy = e.clientY - startY;

//       const distance =
//         direction === "horizontal"
//           ? dx
//           : dy;

//       const crossedDistance =
//         Math.abs(distance) >= thresholdDistance;

//       const crossedVelocity =
//         Math.abs(velocity) >= thresholdVelocity;

//       if (crossedDistance || crossedVelocity) {
//         onThresholdCrossed?.({
//           event: e,
//           dx,
//           dy,
//           velocity,
//           crossedDistance,
//           crossedVelocity,
//         });
//       } else {
//         onThresholdNotCrossed?.({
//           event: e,
//           dx,
//           dy,
//           velocity,
//         });
//       }


//       onEnd?.({ event: e, dx, dy });
//     });

//     dragging = false;
//   }

//   handle.addEventListener("pointerup", finishDrag);
//   handle.addEventListener("pointercancel", finishDrag);
// };