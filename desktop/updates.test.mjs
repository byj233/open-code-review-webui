// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { configureUpdates } from './updates.mjs';

function fixture(responses = []) {
  const updater = new EventEmitter();
  const messages = [];
  const actions = [];
  updater.checkForUpdates = async () => ({ isUpdateAvailable: true, updateInfo: { version: '0.2.0' } });
  updater.downloadUpdate = async () => { actions.push('download'); updater.emit('update-downloaded'); };
  updater.quitAndInstall = () => actions.push('install');
  const updates = configureUpdates({ updater,
    app: { isPackaged: true, getVersion: () => '0.1.1' }, getWindow: () => null,
    dialog: { showMessageBox: async options => { messages.push(options); return { response: responses.shift() ?? 1 }; } },
    beforeInstall: async () => { actions.push('stop'); },
  });
  return { updater, messages, actions, updates };
}

test('declining an update never downloads or installs it', async () => {
  const f = fixture([1]);
  await f.updates.check();
  assert.deepEqual(f.actions, []);
  assert.equal(f.updater.autoInstallOnAppQuit, false);
});

test('deferred installation can resume without another download and stops workers first', async () => {
  const f = fixture([0, 1, 0]);
  await f.updates.check();
  assert.deepEqual(f.actions, ['download']);
  await f.updates.check(true);
  assert.deepEqual(f.actions, ['download', 'stop', 'install']);
});

test('an emitted and rejected failure is shown once and a later check can retry', async () => {
  const f = fixture();
  f.updater.checkForUpdates = async () => {
    const error = new Error('Offline');
    f.updater.emit('error', error);
    throw error;
  };
  await f.updates.check(true);
  assert.equal(f.messages.length, 1);
  f.updater.checkForUpdates = async () => ({ isUpdateAvailable: false });
  await f.updates.check(true);
  assert.equal(f.messages.at(-1).message, 'You are up to date.');
});

test('background network failures do not interrupt the user', async () => {
  const f = fixture();
  f.updater.checkForUpdates = async () => { throw new Error('Offline'); };
  await f.updates.check();
  assert.equal(f.messages.length, 0);
});

test('overlapping checks do not start duplicate network requests', async () => {
  const f = fixture();
  let finish;
  let calls = 0;
  f.updater.checkForUpdates = () => { calls++; return new Promise(resolve => { finish = resolve; }); };
  const pending = f.updates.check();
  await f.updates.check(true);
  assert.equal(calls, 1);
  finish({ isUpdateAvailable: false });
  await pending;
});
