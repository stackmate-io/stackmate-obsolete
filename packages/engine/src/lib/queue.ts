class PriorityQueue<T> {
  /**
   * @var {Array} items the items in the priority queue
   */
  items: [T, number][] = [];

  /**
   * Inserts an item to the queue
   *
   * @param {T} item the item to insert to the queue
   * @param {Number} priority the priority to add the item with
   * @void
   */
  insert(item: T, priority: number): void {
    if (this.isEmpty) {
      this.items.push([item, priority]);
      return;
    }

    for (let index = 0; index < this.size; index++) {
      if (index == this.size - 1) {
        this.items.push([item, priority]);
        return;
      }

      if (this.items[index][1] > priority) {
        this.items.splice(index, 0, [item, priority]);
        return;
      }
    }
  }

  /**
   * @returns {Number} the size for the queue
   */
  get size(): number {
    return this.items.length;
  }

  /**
   * @returns {Boolean} whether the queue is empty
   */
  get isEmpty(): boolean {
    return this.items.length == 0;
  }

  /**
   * @returns {T[]} all of the items in the queue
   */
  get all(): T[] {
    return this.items.map(([item]) => item);
  }

  /**
   * Peeks the queue
   *
   * @returns {T|null} the first item of the queue
   */
  peek(): T | null {
    if (this.isEmpty) {
      return null;
    }

    const [[item]] = this.items;
    return item;
  }

  /**
   * Pops an item from the queue
   *
   * @returns {T|null} the item popped
   */
  pop(): T | null {
    if (this.isEmpty) {
      return null;
    }

    const head = this.items.pop();
    if (!head) {
      return null;
    }

    const [item] = head;
    return item;
  }
}

export default PriorityQueue;
