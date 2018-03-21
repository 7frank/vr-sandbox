import {Queue} from './Queue';
import {mean} from 'lodash';

/**
 * a Queue only containing numbers.
 */

export class NumberQueue extends Queue {
  /**
     *
     * @param {number} item - A number to enqueue.
     */
  enqueue (item) {
    if (typeof item != 'number') throw new Error('NumberQueue only accepts numbers');

    super.enqueue(item);
  }

  /**
     *
     * @returns {number} - Will return the average or zero if queue is empty.
     */
  getAverage () {
    return !this.queue ? 0 : mean(this.queue); // TODO only count relevant entries
  }
}
