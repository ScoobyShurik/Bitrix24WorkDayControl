const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const axios = require('axios');
const path = require('path');
const { error } = require('console');

var startWorkDayUrl
var stopWorkDayUrl

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 650,
    autoHideMenuBar: true,
    icon: __dirname + 'icons/Bitrix24.svg',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
      backgroundThrottling: false
    }
  });


  mainWindow.loadFile('index.html');
}

app.on('ready', ()=>{
  createWindow()
  globalShortcut.register('F9', toggleWindow)
});

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

function sendRequest(url){
  return axios.get(url)
  .then(response => {
    return response.data
  })
  .catch(error => {
    return error
  })
}

ipcMain.on('loadSettings', (event, arg) => {
  startWorkDayUrl = arg.linkStartDay
  stopWorkDayUrl = arg.linkEndDay
  const statusWorkDayUrl = arg.linkStatus
  sendRequest(statusWorkDayUrl)
  .then(data => {
    console.log(data)
    event.reply('status', data.result.STATUS)
  })
  .catch(error =>{
    console.error(error)
    event.reply('error', error.message)
  })
})

ipcMain.on('startWorkDay', () => {
  sendRequest(startWorkDayUrl)
})

ipcMain.on('stopWorkDay', () => {
  sendRequest(stopWorkDayUrl)
})

function toggleWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});