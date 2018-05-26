// TODO groups .. EventListenerList.group("test-events")

export class EventListenerList {
  constructor () {
    this.mList = [];
    this.attached = false;
  }

  add (target, name, handler) {
    this.mList.push({target, name, handler});
    return this;
  }

  attachAll () {
    if (this.attached) {
      console.warn('EventListenerList already attached all events');
      return this;
    }

    this.mList.forEach(({target, name, handler}) => target.addEventListener(name, handler));
    this.attached = true;
    return this;
  }

  detachAll () {
    if (!this.attached) {
      console.warn('EventListenerList already detached all events');
      return this;
    }

    this.mList.forEach(({target, name, handler}) => target.removeEventListener(name, handler));
    this.attached = false;
    return this;
  }
}
