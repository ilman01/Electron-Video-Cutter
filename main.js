const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const { dialog } = require('electron');
const { title } = require('process');

function createWindow({ width, height, htmlFile}) {
  const win = new BrowserWindow({
    width,
    height,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(htmlFile);
}

function executeCommand(command) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stderr });
      } else {
        resolve({ success: true, output: stderr || stdout });
      }
    });
  });
}

function main() {
  app.whenReady().then(() => {
    createWindow({
      width: 800,
      height: 600,
      htmlFile: 'index.html'
    });

    ipcMain.handle('prompt-save-file-backend', async (_) => {
      const saveDialogReturnPath = await dialog.showSaveDialogSync({title: "Save File", filters: [{name:'MP4 Video', extensions: ['mp4']}]})
      return saveDialogReturnPath
    })

    ipcMain.handle('execute-command-backend', async (_, {cmd}) => {
      return await executeCommand(cmd);
    })
  });
}

main();
