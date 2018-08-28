/*
 *
 *   Queue.js
 *
 *   Original code:
 *       Created by Kate Morley - http://code.iamkate.com/ - and released under the terms
 *       of the CC0 1.0 Universal legal code: http://creativecommons.org/publicdomain/zero/1.0/legalcode
 *
 *
 *   Changes made by @author github.com/7frank
 *       - Minor changes to support capacity limit. Supports dropping items on reaching limit or alternatively throwing errors.
 *       - Refactored into class notation. Same license applies.
 *
 *
 *
 *   Creates a new queue. A queue is a first-in-first-out (FIFO) data structure.
 *   Items are added to the end of the queue and removed from the front.
 *
 */

export class Queue {
  /**
     *
     * @param {number} capacity - The upper amount of elements that can be stored within the queue at any given time.
     * @param {boolean} errorOnCapacityLimit - Whether to raise an error if the limit is reached or drop an element to maintain capacity.
     */
  constructor (capacity = Infinity, errorOnCapacityLimit = false) {
    // initialise the queue and offset
    this.queue = [];
    this.offset = 0;
    this.capacity = capacity;
    this.errorOnCapacityLimit = errorOnCapacityLimit;
  }

  /**
     * @returns {number} - Returns the length of the queue.
     */
  getLength () {
    return (this.queue.length - this.offset);
  }

  /**
     *
     * @returns {boolean} -Returns true if the queue is empty, and false otherwise.
     */
  isEmpty () {
    return (this.queue.length == 0);
  }

  /**
     * Enqueues the specified item. The parameter is:
     *
     * @param  item - The item to enqueue.
     */

  enqueue (item) {
    // limit capacity
    if (this.hasReachedCapacity()) {
      if (this.errorOnCapacityLimit) {
        throw new Error('Queue reached capacity:' + this.capacity);
      } else {
        this.dequeue();
      } // drop one item
    }

    this.queue.push(item);
  }

  /**
     *
     * @returns {boolean} - Whether or not the queue has reached its capacity.
     */
  hasReachedCapacity () {
    return this.getLength() >= this.capacity;
  }

  /**
     *  De-queues an item and returns it. If the queue is empty, the value
     * 'undefined' is returned.
     */

  dequeue () {
    // if the queue is empty, return immediately
    if (this.queue.length == 0) return undefined;

    // store the item at the front of the queue
    var item = this.queue[this.offset];

    // increment the offset and remove the free space if necessary
    if (++this.offset * 2 >= this.queue.length) {
      this.queue = this.queue.slice(this.offset);
      this.offset = 0;
    }

    // return the de-queued item
    return item;
  }

  /**
     * Returns the item at the front of the queue (without de-queuing it). If the
     * queue is empty then undefined is returned.
     */

  peek () {
    return (this.queue.length > 0 ? this.queue[this.offset] : undefined);
  }
}
