import test from 'ava';
import axios, { AxiosInstance } from 'axios';
import sinon from 'sinon';

import * as Agent from './agent';
import { awaitAidbox, createAgent, TAgentConfig } from './agent';

test.afterEach.always(() => {
  sinon.restore();
});

test('createAgent() creates agent & applies retry plugin', (t) => {
  const agentConfig = {} as TAgentConfig;
  const axiosInstance = {} as AxiosInstance;

  sinon.stub(axios, 'create').returns(axiosInstance);
  const applyRetryStub = sinon.stub(Agent, 'applyRetry');

  const agent = createAgent(agentConfig);
  sinon.assert.calledWith(applyRetryStub, axiosInstance);

  t.assert(agent);
});

test('awaitAidbox() awaits aidbox server', async (t) => {
  const agent = createAgent({});
  const agentRequestStub = sinon.stub(agent, 'request');
  await awaitAidbox(agent);

  sinon.assert.calledWith(agentRequestStub, {
    url: '/__healthcheck',
    responseType: 'text',
  });

  t.pass();
});
