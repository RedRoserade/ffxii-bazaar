declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare module "workerize-loader!*" {
  function worker<T>(): Worker & T;

  export default worker;
}
