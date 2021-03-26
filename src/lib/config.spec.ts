import fs from 'fs';

import test from 'ava';
import sinon from 'sinon';

import { TConfig } from '../types';

import { createConfig } from './config';

test.afterEach.always(() => {
  sinon.restore();
});

test('createConfig() creates config from object', (t) => {
  const input = ({
    APP_ID: 'APP_ID',
    foo: 'foo',
  } as unknown) as TConfig;

  const config = createConfig(input);

  t.is(config.APP_ID, input.APP_ID);
  t.is((config as any).foo, undefined);
});

test('createConfig() creates config from path', (t) => {
  const input = '/path/to/config.json';

  const json = { APP_ID: 'APP_ID', foo: 'foo' };
  sinon.stub(fs, 'readFileSync').returns(JSON.stringify(json));

  const config = createConfig(input);

  t.is(config.APP_ID, json.APP_ID);
  t.is((config as any).foo, undefined);
});
