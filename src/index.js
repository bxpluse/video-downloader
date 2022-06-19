const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() === 'true') : false;
if(isDev){
    require('electron-reload')(__dirname);
}

if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 850,
        height: 600,
        title: "Video Downloader",
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
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
