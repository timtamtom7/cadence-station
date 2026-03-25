/**
 * Cadence Station — macOS Menu Bar App
 * Runs as a menu bar agent (no dock icon) for quick focus session access.
 *
 * Install deps: npm install
 * Run dev:      npm start
 * Build:        npm run build
 */

const { app, Menu, Tray, BrowserWindow, nativeImage, Notification, ipcMain } = require('electron');
const path = require('path');

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let tray = null;
let mainWindow = null;
let activeSession = null;
let sessionTimer = null;

const WEBAPP_URL = 'http://localhost:5173';
const WEBAPP_DEV = true; // set to false in production

function getAssetPath(...segments) {
  return path.join(__dirname, ...segments);
}

function createTrayIcon() {
  // Generate a simple 18x18 colored dot icon programmatically
  const size = 18;
  const canvas = nativeImage.createEmpty();

  // Use the favicon SVG via data URL
  const iconPath = getAssetPath('../../public/icon-192.png');
  try {
    return nativeImage.createFromPath(iconPath).resize({ width: size, height: size });
  } catch {
    // Fallback: return an empty 18x18 icon
    return nativeImage.createEmpty();
  }
}

function buildContextMenu() {
  const sessionMenu = activeSession
    ? [
        {
          label: `Session: ${activeSession.duration}m remaining`,
          enabled: false,
        },
        { type: 'separator' },
        {
          label: 'Open Session',
          click: () => openMainWindow(),
        },
        {
          label: 'End Session',
          click: () => endSession(),
        },
      ]
    : [
        { label: 'No active session', enabled: false },
        { type: 'separator' },
        {
          label: 'Start 25m Session',
          click: () => startSession(25),
        },
        {
          label: 'Start 50m Session',
          click: () => startSession(50),
        },
        {
          label: 'Start 90m Session',
          click: () => startSession(90),
        },
      ];

  const template = [
    ...sessionMenu,
    { type: 'separator' },
    {
      label: 'Open Cadence Station',
      click: () => openMainWindow(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
        process.exit(0);
      },
    },
  ];

  return Menu.buildFromTemplate(template);
}

function createTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('Cadence Station');
  tray.setContextMenu(buildContextMenu());

  tray.on('click', () => {
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      openMainWindow();
    }
  });
}

function openMainWindow() {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      width: 900,
      height: 700,
      show: false,
      frame: true,
      titleBarStyle: 'default',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    const url = WEBAPP_DEV ? `${WEBAPP_URL}/#/app` : `file://${path.join(__dirname, '../../dist/index.html')}`;
    mainWindow.loadURL(url);

    mainWindow.on('close', (e) => {
      if (!app.isQuitting) {
        e.preventDefault();
        mainWindow.hide();
      }
    });

    mainWindow.on('ready-to-show', () => {
      mainWindow.show();
    });
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function startSession(durationMins) {
  endSession(); // clear any existing

  activeSession = {
    startedAt: Date.now(),
    duration: durationMins,
    endsAt: Date.now() + durationMins * 60 * 1000,
  };

  // Update menu bar tooltip
  if (tray) {
    tray.setToolTip(`Cadence Station — ${durationMmin}m session active`);
    tray.setContextMenu(buildContextMenu());
  }

  // Set a timer to show notification when done
  const delayMs = durationMins * 60 * 1000;
  sessionTimer = setTimeout(() => {
    showSessionCompleteNotification(durationMins);
    activeSession = null;
    if (tray) {
      tray.setToolTip('Cadence Station');
      tray.setContextMenu(buildContextMenu());
    }
  }, delayMs);

  // Notify the web app
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('session-started', activeSession);
  }

  // macOS native notification
  if (Notification.isSupported()) {
    new Notification({
      title: 'Focus session started',
      body: `Timer set for ${durationMins} minutes. Stay focused!`,
      silent: false,
    }).show();
  }
}

function endSession() {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
    sessionTimer = null;
  }
  activeSession = null;
  if (tray) {
    tray.setToolTip('Cadence Station');
    tray.setContextMenu(buildContextMenu());
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('session-ended');
  }
}

function showSessionCompleteNotification(durationMins) {
  if (Notification.isSupported()) {
    new Notification({
      title: 'Session complete! 🎉',
      body: `You just completed a ${durationMins}-minute focus session.`,
      silent: false,
    }).show();
  }
}

// IPC handlers (for renderer → main communication)
ipcMain.handle('start-session', (_, { duration }) => {
  startSession(duration);
  return { ok: true };
});

ipcMain.handle('end-session', () => {
  endSession();
  return { ok: true };
});

ipcMain.handle('get-active-session', () => {
  return activeSession;
});

// App lifecycle
app.on('ready', () => {
  // Don't show dock icon (LSUIElement = true in build config)
  createTray();
});

app.on('window-all-closed', () => {
  // Don't quit on window close — we run in the menu bar
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('second-instance', () => {
  openMainWindow();
});

// Optional: launch at login
const loginItemSettings = app.getLoginItemSettings();
if (!loginItemSettings.openAtLogin) {
  // Uncomment to enable auto-launch:
  // app.setLoginItemSettings({ openAtLogin: true, path: process.execPath });
}
