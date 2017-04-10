import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';

import {UserConnections} from '../../src/user-connections';

const assert = chai.assert;

describe('UserConnections', () => {
  let sandbox;
/*
  before(() => {
  });

  after(() => {
  });
*/
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('UserConnections', () => {
    it('UserConnections::ctor - ', () => {   
      let connections = new UserConnections();
      assert(connections != null);
    });
  });
});
