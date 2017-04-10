
interface Connection {
  id: string;
  publish: (topic: string, msg: any) => void;
}

export class UserConnections {
  _connectionMap:   Map<string, Set<Connection>>;
  _connectionsById: Map<string, Connection>;

  constructor() {
    this._connectionMap   = new Map();
    this._connectionsById = new Map();
  }

  private _makeKey(username: string, sessionId: string): string {
    return `${username}:${sessionId}`;
  }

  public _onConnectionOpened(connection: Connection): void {
    // Check that the connection has a valid session
    let username;  // Figure out the username
    let sessionId; // Figure out the sessionId

    let key = this._makeKey(username, sessionId);
    let connections = this._connectionMap.get(key);
    if (!connections) {
      connections = new Set();
      this._connectionMap.set(key, connections);
    }

    connections.add(connection);
    this._connectionsById.set(connection.id, connection);

    // Emit user.connection-opened event
  }

  public _onConnectionClosed(connection: Connection): void {
    let username;  // Figure out the username
    let sessionId; // Figure out the sessionId

    let key = this._makeKey(username, sessionId);
    let connections = this._connectionMap.get(key);
    if (connections) {
      connections.delete(connection);
      if (connections.size === 0) {
        this._connectionMap.delete(key);
      }
    } 

    this._connectionsById.delete(connection.id);

    // Emit user.connection-closed event
  }

  public publishMessage(username: string, sessionId: string, topic: string, message: any): void {
    let key = this._makeKey(username, sessionId);
    let connections = this._connectionMap.get(key);
 
    // Publish message to all connections for this user/session
    connections.forEach(c => {
      c.publish(topic, message);
    });
  }

  public publishMessageToConnection(connectionId: string, topic: string, message: any): void {
    let connection = this._connectionsById.get(connectionId);

    // Publish to specific connection by id (ex. one specific tab the user has open out of serveral for the same session)
    connection.publish(topic, message);
  }
}
