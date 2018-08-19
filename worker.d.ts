declare module "worker-loader!*.js" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}
