import * as bodyParser              from 'body-parser';
import * as express                 from 'express';
import * as http                    from 'http';
import * as session                 from 'express-session';
import * as uuid                    from 'uuid';
import * as path                    from 'path';
import * as controller              from './controller';
import {Request, Response}          from 'express-serve-static-core';
import {userConnections}            from './user-connections';

let port = 9989;

/*
 Notes:
 - bodyparser needs to be added AFTER cometd.
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

// Require all routes other than /login to have a valid session
app.use('*', (request: Request, response: Response, next: (err?: any) => void) => {
  let baseUrl = request.baseUrl;
  if (baseUrl.startsWith('/api/login') || baseUrl.startsWith('/test')) {
    next();
  } else {
    if (!request.session.data || !request.session.data.username) {
      response.status(403).end();
      return;
    }

    next();
  }
});

userConnections.initialize();

app.use('/cometd/*', userConnections.getCometdServer().handle);
app.use(bodyParser.json({limit: '20mb'}));
app.use('/test', express.static(path.resolve(__dirname, './testapp')));
app.post('/api/login', controller.login);
app.post('/api/logout', controller.logout);
app.post('/api/search', controller.search);
app.post('/api/broadcast', controller.broadcast);

let server = http.createServer();
server.on('request', app);

server.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
