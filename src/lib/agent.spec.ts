import test from 'ava';
import axios, { AxiosInstance } from 'axios';
import sinon from 'sinon';

import * as Agent from './agent';
import { TAgentConfig } from './agent';

test.afterEach.always(() => {
  sinon.restore();
});

test.serial('createAgent() creates agent & applies retry plugin', (t) => {
  const agentConfig = {} as TAgentConfig;
  const axiosInstance = {} as AxiosInstance;

  sinon.stub(axios, 'create').returns(axiosInstance);
  const applyRetryStub = sinon.stub(Agent, 'applyRetry');

  const agent = Agent.createAgent(agentConfig);
  sinon.assert.calledWith(applyRetryStub, axiosInstance);

  t.assert(agent);
});
