import test from 'ava';
import sinon from 'sinon';
import { TConfig } from '../types';
import { TAgent } from './agent';
import { createContext } from './context';

test.afterEach.always(() => {
    sinon.restore();
});

test('request()', async (t) => {
    const requestSpy = sinon.spy();
    const agent = ({ request: requestSpy } as unknown) as TAgent;

    const context = await createContext(agent, {} as TConfig, {});
    const requestConfig = {};

    await context.request(requestConfig);

    sinon.assert.calledWith(requestSpy, sinon.match(requestConfig));

    t.pass();
});

test('log()', async (t) => {
    const requestSpy = sinon.spy();
    const agent = ({ request: requestSpy } as unknown) as TAgent;

    const context = await createContext(agent, { APP_DEBUG: 'true' } as TConfig, {});
    const logData = { message: { foo: 'foo' }, fx: 'fx', type: 'type', v: 'v' };
    const consoleLogStub = sinon.stub(console, 'log');

    await context.log(logData);

    sinon.assert.calledWith(requestSpy, {
        url: '/$loggy',
        method: 'post',
        data: logData,
    });

    sinon.assert.calledOnce(consoleLogStub);

    t.pass();
});

test('log() handles cyclic objects', async (t) => {
    const requestSpy = sinon.stub().throws(RangeError);
    const agent = ({ request: requestSpy } as unknown) as TAgent;

    const context = await createContext(agent, {} as TConfig, {});
    const logData = { message: { foo: 'foo' }, fx: 'fx', type: 'type', v: 'v' };
    sinon.stub(console, 'log');
    const consoleErrorStub = sinon.stub(console, 'error');

    await context.log(logData);

    sinon.assert.calledWith(consoleErrorStub, 'Logging error');

    t.pass();
});
test('psql()', async (t) => {
    const requestSpy = sinon.stub().resolves({ data: [{ result: 'foo' }] });
    const agent = ({ request: requestSpy } as unknown) as TAgent;
    const query = 'SELECT NOW()';

    const context = await createContext(agent, {} as TConfig, {});

    await context.psql(query);

    sinon.assert.calledWith(
        requestSpy,
        sinon.match({
            url: '/$psql',
            method: 'post',
            data: { query },
        })
    );

    t.pass();
});
