// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 alibaba/open-code-review Contributors

export function configureUpdates({ updater, app, dialog, getWindow, beforeInstall }) {
  updater.autoDownload = false;
  updater.autoInstallOnAppQuit = false;
  updater.allowPrerelease = false;
  updater.allowDowngrade = false;
  let busy = false;
  let manual = false;
  let downloaded = false;
  let failureShown = false;

  const show = options => {
    const parent = getWindow();
    return parent && !parent.isDestroyed()
      ? dialog.showMessageBox(parent, options)
      : dialog.showMessageBox(options);
  };
  const reportError = async error => {
    if (failureShown) return;
    failureShown = true;
    if (manual) await show({ type: 'error', message: 'Could not update Open Code Review',
      detail: error.message, buttons: ['OK'] });
  };
  const install = async () => {
    const answer = await show({ type: 'info', message: 'Update ready to install',
      detail: 'Save your work and wait for active reviews to finish before restarting.',
      buttons: ['Restart and install', 'Later'], defaultId: 1, cancelId: 1 });
    if (answer.response === 0) {
      await beforeInstall();
      updater.quitAndInstall(false, true);
    }
  };

  updater.on('error', error => { void reportError(error); });
  updater.on('update-downloaded', () => { downloaded = true; });

  async function check(interactive = false) {
    if (!app.isPackaged) {
      if (interactive) await show({ type: 'info', message: 'Updates are available in installed builds.', buttons: ['OK'] });
      return;
    }
    if (busy) {
      if (interactive) await show({ type: 'info', message: 'An update check or download is already in progress.', buttons: ['OK'] });
      return;
    }
    busy = true;
    manual = interactive;
    failureShown = false;
    try {
      if (downloaded) { await install(); return; }
      const result = await updater.checkForUpdates();
      if (!result?.isUpdateAvailable) {
        if (interactive) await show({ type: 'info', message: 'You are up to date.', detail: `Current version: ${app.getVersion()}`, buttons: ['OK'] });
        return;
      }
      const answer = await show({ type: 'info', message: `Version ${result.updateInfo.version} is available`,
        detail: 'Download the update in the background? You can continue using the app.',
        buttons: ['Download update', 'Later'], defaultId: 0, cancelId: 1 });
      if (answer.response !== 0) return;
      manual = true;
      await updater.downloadUpdate();
      downloaded = true;
      await install();
    } catch (error) {
      await reportError(error);
    } finally {
      busy = false;
      manual = false;
    }
  }
  return { check };
}
