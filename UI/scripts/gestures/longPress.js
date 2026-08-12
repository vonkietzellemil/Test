export class LongPress {
  constructor(
    el,
    {
      threshold = 600,
      handle,
      condition = () => true,

      getElementsToAnimate = () => [],

      onStart,
      onComplete,
      onCancel,
      onThresholdCrossed,
      onThresholdNotCrossed,
    } = {}
  ) {
    if (!el) {
      throw new Error("LongPress requires a valid element.");
    }

    this.el = el;
    this.threshold = threshold;
    this.handle = handle;
    this.condition = condition;

    this.getElementsToAnimate = getElementsToAnimate;

    this.onStart = onStart;
    this.onComplete = onComplete;
    this.onCancel = onCancel;
    this.onThresholdCrossed = onThresholdCrossed;
    this.onThresholdNotCrossed = onThresholdNotCrossed;

    this.timer = null;
    this.startTime = 0;
    this.isPressed = false;
    this.thresholdCrossed = false;

    this._bindEvents();
  }

  _bindEvents() {
    this._startHandler = this._start.bind(this);
    this._endHandler = this._end.bind(this);
    this._cancelHandler = this._cancel.bind(this);

    this.el.addEventListener("pointerdown", this._startHandler);

    this.el.addEventListener("pointerup", this._endHandler);
    this.el.addEventListener("pointerleave", this._cancelHandler);
    this.el.addEventListener("pointercancel", this._cancelHandler);
  }

  _start(event) {
    if (!this.condition(event)) return;

    this.isPressed = true;
    this.thresholdCrossed = false;
    this.startTime = Date.now();

    const elements = this.getElementsToAnimate(event);

    this.onStart?.({
      event,
      elements,
    });

    this.timer = setTimeout(() => {
      if (!this.isPressed) return;

      this.thresholdCrossed = true;

      this.onThresholdCrossed?.({
        event,
        elements,
      });

    }, this.threshold);
  }

  _end(event) {
    return;
    if (!this.isPressed) return;

    clearTimeout(this.timer);

    const duration = Date.now() - this.startTime;

    if (this.thresholdCrossed) {
      this.onComplete?.({
        event,
        duration,
      });
    } else {
      this.onThresholdNotCrossed?.({
        event,
        duration,
      });
    }

    this.isPressed = false;
  }

  _cancel(event) {
    return;
    if (!this.isPressed) return;

    clearTimeout(this.timer);

    const duration = Date.now() - this.startTime;

    if (this.thresholdCrossed) {
      this.onComplete?.({
        event,
        duration,
      });
    } else {
      this.onThresholdNotCrossed?.({
        event,
        duration,
      });
    }

    this.onCancel?.({
      event,
      duration,
    });

    this.isPressed = false;
  }

  destroy() {
    clearTimeout(this.timer);

    this.el.removeEventListener("pointerdown", this._startHandler);
    this.el.removeEventListener("pointerup",this._endHandler);
    this.el.removeEventListener("pointerleave", this._cancelHandler);
    this.el.removeEventListener("pointercancel", this._cancelHandler);
  }
}