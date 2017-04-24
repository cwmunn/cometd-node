import {Request, Response}          from 'express-serve-static-core';
import {userConnections}            from './user-connections';

function login(request: Request, response: Response): void {
  if (request.body.username && 
      request.body.password &&
      request.body.password === 'cometd') {
    request.session.data = { username: 'chrism' };
    response.status(200).end();
    console.log(`User [${request.body.username}] logged in!`);
  } else {
    console.log('Login failed.');
    response.status(403).end();
  }
}

function logout(request: Request, response: Response): void {
  console.log(`User ${request.body.username}] logged out!`);
  response.clearCookie('TEST_SESSIONID', { path: '/' });

  request.session.destroy(err => {
    if (err) {
      console.log('Error destroying session:', err);
    }
    response.status(200).end();
  });
}

function search(request: Request, response: Response): void {
  if (request.query.clientId) {
    console.log(`Publishing test message to client [${request.query.clientId}]...`);
    userConnections.publishMessageToClient(request.query.clientId, '/wwe/v3/voice', 
      { data: { test: 'publish to specific client', clientId: request.query.clientId}});
  }
  response.json({ sessionId: request.sessionID}).status(200);
}

function broadcast(request: Request, response: Response): void {
    console.log(`Publishing test message to username [${request.session.data.username}]...`);
    userConnections.publishMessage(request.session.data.username, request.sessionID, '/wwe/v3/voice', 
      { data: { test: 'publication to all user/session connections', username: request.session.data.username}});
  
  response.json({ sessionId: request.sessionID}).status(200); 
}

let controller = {
  login, logout, search, broadcast };

export = controller;
