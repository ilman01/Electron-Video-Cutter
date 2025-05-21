const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
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

  return win
}

function saveData(filename, data) {
    const filePath = path.resolve(__dirname, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Data saved to ${filePath}`);
}

function loadData(filename) {
    const filePath = path.resolve(__dirname, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
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
    win = createWindow({
      width: 800,
      height: 600,
      htmlFile: 'index.html'
    });

    // Handles when the program is closing...
    win.on('close', (event) => {
      // Prevent the default close behavior
      event.preventDefault();
      
      // Call the frontend
      win.webContents.send('program-is-closing')

      // Delay the close
      setTimeout(() => {
        win.removeAllListeners('close');
        win.close();
      }, 100);
    });

    ipcMain.handle('prompt-save-file-backend', async (_) => {
      const saveDialogReturnPath = await dialog.showSaveDialogSync({title: "Save File", filters: [{name:'MP4 Video', extensions: ['mp4']}]})
      return saveDialogReturnPath
    })

    ipcMain.handle('execute-command-backend', async (_, {cmd}) => {
      return await executeCommand(cmd);
    })

    ipcMain.handle('save-data-backend', async (_, {fileName, data}) => {
      saveData(fileName, data)
    })
  });
}

main();
