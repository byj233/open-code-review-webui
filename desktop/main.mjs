// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

import { app, BrowserWindow, dialog, Menu, shell } from 'electron';
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readyURL, isLocalNavigation } from './runtime.mjs';
import electronUpdater from 'electron-updater';
import { configureUpdates } from './updates.mjs';

const root = dirname(fileURLToPath(import.meta.url));
let backend;
let window;
let quitting = false;
let updateTimer;

async function stopBackend() {
  if (!backend?.pid || backend.exitCode !== null) return;
  // The console launches CLI workers; terminate the whole tree on Windows.
  if (process.platform === 'win32') {
    await new Promise(resolve => {
      const killer = spawn('taskkill', ['/pid', String(backend.pid), '/T', '/F'], { windowsHide: true });
      killer.once('error', resolve);
      killer.once('exit', resolve);
    });
  } else {
    backend.kill();
  }
}

function startBackend() {
  const executable = join(app.isPackaged ? process.resourcesPath : root, 'bin', 'opencodereview.exe');
  return new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error('The local service did not start within 30 seconds.')), 30_000);
    backend = spawn(executable, ['web', '--addr', '127.0.0.1:0', '--open=never', '--repo', app.getPath('home')], {
      cwd: app.getPath('userData'), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    backend.once('error', error => { clearTimeout(timer); reject(error); });
    backend.stdout.on('data', chunk => {
      output = (output + chunk.toString()).slice(-8192);
      const url = readyURL(output);
      if (url) { clearTimeout(timer); resolve(url); }
    });
    backend.stderr.on('data', chunk => { output = (output + chunk.toString()).slice(-8192); });
    backend.once('exit', code => {
      clearTimeout(timer);
      reject(new Error(`The local service stopped (${code}).\n${output}`));
      if (!quitting && window) {
        dialog.showErrorBox('Open Code Review', 'The local service stopped. Please restart the application.');
        app.quit();
      }
    });
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (window?.isMinimized()) window.restore();
    window?.show();
    window?.focus();
  });
  app.whenReady().then(async () => {
    const url = await startBackend();
    window = new BrowserWindow({
      width: 1440, height: 940, minWidth: 1000, minHeight: 680,
      title: 'Open Code Review', backgroundColor: '#faf9f5', show: false,
      icon: join(root, 'resources', 'icon.ico'),
      webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true },
    });
    window.webContents.on('will-navigate', (event, target) => {
      if (!isLocalNavigation(target, url)) event.preventDefault();
    });
    window.webContents.setWindowOpenHandler(({ url: target }) => {
      if (['https:', 'http:'].includes(new URL(target).protocol)) shell.openExternal(target);
      return { action: 'deny' };
    });
    window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    window.once('ready-to-show', () => window.show());
    await window.loadURL(url);
    const updates = configureUpdates({
      updater: electronUpdater.autoUpdater, app, dialog, getWindow: () => window,
      beforeInstall: async () => { quitting = true; await stopBackend(); },
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { label: 'Application', submenu: [
        { label: 'Check for updates...', click: () => { void updates.check(true); } },
        { type: 'separator' },
        { role: 'quit' },
      ] },
      { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
      { label: 'View', submenu: [{ role: 'reload' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] },
    ]));
    if (app.isPackaged && process.env.OCR_DESKTOP_SMOKE !== '1') {
      updateTimer = setTimeout(() => { void updates.check(); }, 15_000);
      updateTimer.unref();
    }
    if (process.env.OCR_DESKTOP_SMOKE === '1') {
      const health = await window.webContents.executeJavaScript("fetch('/api/health').then(r => r.ok)");
      if (!health) throw new Error('Desktop health check failed');
      console.log('Desktop smoke test passed');
      app.quit();
    }
  }).catch(error => {
    dialog.showErrorBox('Open Code Review could not start', error.message);
    app.quit();
  });
}

app.on('window-all-closed', () => app.quit());
app.on('before-quit', () => { quitting = true; clearTimeout(updateTimer); void stopBackend(); });
