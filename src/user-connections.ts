import * as cometd                  from 'cometd-nodejs-server';

export class UserConnections {
  _cometdServer:                    CometDServer; 
  _cometdSessionsByClientId:        Map<string, any>;
  _cometdSessionsByUserHTTPSession: Map<string, Set<any>>;

  constructor() {
    this._cometdSessionsByClientId        = new Map();
    this._cometdSessionsByUserHTTPSession = new Map();
  }

  private _makeKey(username: string, sessionId: string): string {
    return `${username}:${sessionId}`;
  }

  private _hasData(req: any): boolean {
    return (req && req.session && req.session.data && req.session.data.username && req.sessionID);
  }

  private _onMetaSubscribe(session: any, channel: any, message: any, cb: any): void {
    if (!this._cometdSessionsByClientId.has(session.id)) {
      console.log(`Found new session [${session.id}]...`);
      this._cometdSessionsByClientId.set(session.id, session);

      let req = this._cometdServer.context.request;
      if (this._hasData(req)) {
        let username = req.session.data.username;
        let key = this._makeKey(username, req.sessionID);
        let connectionsForHTTPSession = this._cometdSessionsByUserHTTPSession.get(key);
        
        if (!connectionsForHTTPSession) {
          connectionsForHTTPSession = new Set();
          this._cometdSessionsByUserHTTPSession.set(key, connectionsForHTTPSession);
        }
        
        connectionsForHTTPSession.add(session);
      }
    }

    cb();
  }

  private _onMetaDisconnect(session: any, channel: any, message: any): void {
    console.log('disconnect...', message);
    if (this._cometdSessionsByClientId.has(session.id)) {
      console.log(`Removing session ${session.id}...`);
      this._cometdSessionsByClientId.delete(session.id);
    }

    let req = this._cometdServer.context.request;
    if (this._hasData(req)) {
      let key = this._makeKey(req.session.data.username, req.sessionID);
      if (this._cometdSessionsByUserHTTPSession.has(key)) {
        let connectionsForHTTPSession = this._cometdSessionsByUserHTTPSession.get(key);

        connectionsForHTTPSession.delete(session);
        if (connectionsForHTTPSession.size === 0) {
          console.log(`Last connection closed for user [${req.session.data.username}] session [${req.sessionID}]...`);
          this._cometdSessionsByUserHTTPSession.delete(key);
        }
      }
    }
  }

  public initialize(): void {
    this._cometdServer = cometd.createCometDServer({
      // logLevel: 'debug'
    });

    this._cometdServer.getServerChannel('/meta/subscribe')
      .addListener('message', (session, channel, message, cb) => {
        this._onMetaSubscribe(session, channel, message, cb);
      });
    this._cometdServer.getServerChannel('/meta/disconnect')
      .addListener('message', (session, channel, message) => {
        this._onMetaDisconnect(session, channel, message);
      });
  } 

  public getCometdServer(): CometDServer {
    return this._cometdServer;
  }

  public publishMessage(username: string, sessionId: string, channelName: string, message: any): void {
    let key = this._makeKey(username, sessionId);
    let sessions = this._cometdSessionsByUserHTTPSession.get(key);
 
    // Publish message to all connections for this user/session
    sessions.forEach(s => {
      s.deliver(null, channelName, message);
    });
  }

  public publishMessageToClient(clientId: string, channelName: string, message: any): void {
    let session = this._cometdSessionsByClientId.get(clientId);
    if (session) {
      session.deliver(null, channelName, message);
    }
  }
}

export let userConnections = new UserConnections();
