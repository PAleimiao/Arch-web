import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';

// Vite dev server URL or production build path
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1366, width),
    height: Math.min(768, height),
    minWidth: 800,
    minHeight: 600,
    title: 'Arch Linux Web Simulator',
    icon: path.join(__dirname, '../dist/icons/arch-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    show: false,
    backgroundColor: '#000000',
    titleBarStyle: 'hidden',
    frame: true,
  });

  // Load the app
  if (isDev) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
