const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() === 'true') : false;
const Store = require('electron-store');
const store = new Store();

if(isDev){
    require('electron-reload')(__dirname);
}

if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {

    const windowWidthKey = 'windowWidth';
    const windowHeightKey = 'windowHeight';

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: store.get(windowWidthKey) || 850,
        height: store.get(windowHeightKey) || 630,
        title: 'Video Downloader',
        resizable: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Persist changes to window sizes across sessions
    mainWindow.on('resize', function () {
        const size = mainWindow.getSize();
        const width = size[0];
        const height = size[1];
        store.set(windowWidthKey, width);
        store.set(windowHeightKey, height);
    });

    if(!isDev){
        mainWindow.removeMenu()
    }
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
