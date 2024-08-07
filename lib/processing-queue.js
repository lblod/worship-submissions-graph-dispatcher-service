export class ProcessingQueue {
  constructor(name = 'Default') {
    this.name = name;
    this.queue = [];
    this.executing = false; //To avoid subtle race conditions TODO: is this required?
    this.run();
  }

  get length() {
    return this.queue.length;
  }

  async run() {
    if (this.queue.length > 0 && !this.executing) {
      const job = this.queue.shift();
      try {
        this.executing = true;
        console.log(`${this.name}: Executing oldest task on queue`);
        await job.task();
        console.log(`${this.name}: Remaining number of tasks ${this.queue.length}`);
      }
      catch (error) {
        await job.onError(error);
      }
      finally {
        this.executing = false;
        this.run();
      }
    }
    else {
      setTimeout(() => { this.run(); }, (process.env.QUEUE_POLL_INTERVAL || 100));
    }
  }

  addJob(origin, onError = async (error) => { console.error(`${this.name}: Error while processing task`, error); }) {
    this.queue.push({
      task: origin,
      onError: onError
    });
  }
}

/**
 * Distributes and schedules a job among a pool of queues, selecting the queue with the fewest tasks.
 * @param {ProcessingQueue[]} queuePool - The pool of ProcessingQueue instances to choose from.
 * @param {Function} job - The job to be added to the smallest queue.
 */
export async function distributeAndSchedule(queuePool, job) {
  const smallestQueue = queuePool.reduce(
    (smallestQueueSoFar, currentQueue) => {
      if(currentQueue.length < smallestQueueSoFar.length) {
        return currentQueue;
      }
      return smallestQueueSoFar;
    }, queuePool[0]);

  smallestQueue.addJob(job);
}
