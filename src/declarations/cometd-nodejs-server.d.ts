
interface CometDOptions {

}

interface CometDServerChannel {
  addListener: (eventName: string, callback: any) => void;
  removeListener: any;
  publish:        any;
  meta:           boolean;
  name:           string;
  service:        boolean;
  subscribers:    Array<any>;  
  wildNames:      Array<string>;
  broadcast:      boolean;
}

interface CometDServer {
  handle:               any;
  addListener:          any;
  removeListener:       any;
  listeners:            any;
  close:                any;
  options:              CometDOptions;
  createServerChannel:  (name: string) => CometDServerChannel;
  getServerChannel:     (name: string) => CometDServerChannel;
  getServerSession:     any;
}

interface CometDNodeJSServer {
  createCometDServer: () => CometDServer;
}

declare module 'cometd-nodejs-server' {
  let server: any;
  export = server;
}
