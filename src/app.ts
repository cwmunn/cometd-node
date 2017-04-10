import * as bodyParser              from 'body-parser';
import * as express                 from 'express';
import * as http                    from 'http';
import * as session                 from 'express-session';
import * as uuid                    from 'uuid';

import * as controller              from './controller';

let port = 9989;

const app = express();
app.set('json spaces', 2);
app.set('port', port);
app.set('etag', false);
app.set('x-powered-by', false);
app.use(bodyParser.json({limit: '20mb'}));
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

app.use('/test', controller.test);

let server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
