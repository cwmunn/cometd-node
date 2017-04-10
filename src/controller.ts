import {Request, Response}  from 'express-serve-static-core';

function test(request: Request, response: Response): void {
  console.log('test!');
  response.json({ sessionId: request.sessionID}).status(200);
}

export { test };
