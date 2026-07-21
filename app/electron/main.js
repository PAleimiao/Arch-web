const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;

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
    frame: true,
  });

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);

  // Load the built app
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

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
