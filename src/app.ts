import * as bodyParser              from 'body-parser';
import * as express                 from 'express';
import * as http                    from 'http';
import * as session                 from 'express-session';
import * as uuid                    from 'uuid';
import * as cometd                  from 'cometd-nodejs-server';
import * as path                    from 'path';
import * as controller              from './controller';

let port = 9989;

/*
 Notes:
 - bodyparser needs to be added AFTER cometd.

 TODO:
 - Reject cometd when there is no authenticated session (try this as middleware ahead of the cometd handler to start)
### - Get notification of disconnect and remove connections 
 - Introduce http session / auth and track cometd connections against the user/http session and 
   identify when the last connection is closed
### - get notification of new connections
### - publish message to all connections in a session
### - publish message to a particular connection in a session

*/

const app = express();
app.set('json spaces', 2);
app.set('port', port);
app.set('etag', false);
app.set('x-powered-by', false);
app.locals.protocol = 'http';

const options = {
  secret: 'test-secret',
  name: 'TEST_SESSIONID',
  genid: () => uuid.v4(),
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true
    }
};

let sessionMiddleware = session(options);
app.use(sessionMiddleware);

let cometdServer = cometd.createCometDServer({
 // logLevel: 'debug'
});

let sessions = new Map();
cometdServer.getServerChannel('/meta/subscribe')
.addListener('message', (session, channel, message, cb) => {
  if (!sessions.has(session.id)) {
    console.log(`Found new session [${session.id}]...`);
    sessions.set(session.id, session);
  }

  cb();
});

cometdServer.getServerChannel('/meta/disconnect')
.addListener('message', (session, channel, message) => {
  console.log('disconnect...', message);
  if (sessions.has(session.id)) {
    console.log(`Removing session ${session.id}...`);
    sessions.delete(session.id);
  }
});

setInterval(() => {
  if (sessions.size !== 0) {
    let idx = Math.floor(Math.random() * sessions.size);
    console.log(`Publishing to lucky number ${idx}...`);
    let values = [ ...sessions.values() ];
    let s = values[idx];
    console.log(`Publishing to ${s.id}...`);
    let channel = cometdServer.getServerChannel(`/wwe/v3/voice/username/${s.id}`);
    if (channel) {
      channel.publish(null, { type: 'specific-user', clientId: s.id, data: uuid.v4() });
    }
  } else {
    console.log('No sessions to publish to...');
  }
}, 10000);

setInterval(() => {
    console.log('Publishing to user channel...');
    let channel = cometdServer.getServerChannel(`/wwe/v3/voice/username`);
    if (channel) {
      channel.publish(null, { type: 'all-user-clients', data: uuid.v4() });
    }
}, 13000);

app.use('/cometd/*', cometdServer.handle);
app.use(bodyParser.json({limit: '20mb'}));
app.use('/test', express.static(path.resolve(__dirname, './testapp')));
app.use('/api/test', controller.test);

let server = http.createServer();
server.on('request', app);

server.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
