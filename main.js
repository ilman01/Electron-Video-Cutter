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

function buildFFmpegCommand({
  inputFile,
  outputFile,
  startTime,
  endTime,
  gain,
  quality,
  useEncoder
}) {
  return [
    'ffmpeg',
    '-y',
    '-ss', startTime,
    '-to', endTime,
    '-i', `"${inputFile}"`,
    '-map', '0:v',
    '-map', '0:a',
    '-map_chapters', '-1',
    '-shortest',
    '-c:v', useEncoder,
    '-b:a', '320k',
    '-ac', '2',
    '-qp', quality,
    '-filter:a', `"volume=${gain}dB"`,
    `"${outputFile}"`
  ].join(' ');
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

    ipcMain.handle('run-ffmpeg', async (_, {
      inputFile,
      outputFile,
      startTime,
      endTime,
      gain,
      quality,
      useEncoder
    }) => {

      const command = buildFFmpegCommand({
        inputFile,
        outputFile,
        startTime,
        endTime,
        gain,
        quality,
        useEncoder
      });

      const result = await executeCommand(command);
      return result;
    });
  });
}

main();
