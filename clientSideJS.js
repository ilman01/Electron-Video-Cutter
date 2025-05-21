const { webUtils } = require('electron')
const { ipcRenderer } = require('electron');

const videoPlayer = document.getElementById('video')

const gainInput = document.getElementById('gain')
const QPInput = document.getElementById('quality')
const encoderInput = document.getElementById('useEncoder')

gainInput.value = 0
QPInput.value = 28
encoderInput.value = "libx264"


const startTimeInput = document.getElementById('startTime')
const endTimeInput = document.getElementById('endTime')
const setToPlayerTimeStart = document.getElementById('setToPlayerTimeStart')
const setToPlayerTimeEnd = document.getElementById('setToPlayerTimeEnd')


const openFileBtn = document.getElementById('openFileBtn');
const inputFileText = document.getElementById('inputFile');

const saveFileBtn = document.getElementById('saveFileBtn');
const outputFileText = document.getElementById('outputFile');

const fileInputDialog = document.getElementById('fileInputDialog')


function displayVideo(videoFilePath) {
    videoPlayer.src = videoFilePath;
    videoPlayer.play()
}

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    const pad = (num, size) => num.toString().padStart(size, '0');

    return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)}.${pad(ms, 3)}`;
}


openFileBtn.addEventListener('click', () => {
    fileInputDialog.click();
});

fileInputDialog.addEventListener('change', () => {
    const file = fileInputDialog.files[0];
    const filePath = webUtils.getPathForFile(file)
    if (filePath) {
        inputFileText.value = filePath;
        displayVideo(filePath)
    }
});

saveFileBtn.addEventListener('click', async () => {
    const filePath = await ipcRenderer.invoke('prompt-save-file-backend'); // html doesn't have a native save file
    if (filePath) {
        outputFileText.value = filePath;
    }
});

inputFileText.addEventListener('input', (e) => {
    displayVideo(inputFileText.value)
})

// Attach drag-and-drop handlers to input elements
inputFileText.addEventListener('drop', (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0]
    const filePath = webUtils.getPathForFile(file)
    if (filePath) {
        inputFileText.value = filePath;
        displayVideo(inputFileText.value)
    }
});

outputFileText.addEventListener('drop', (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0]
    const filePath = webUtils.getPathForFile(file)
    if (filePath) {
        outputFileText.value = filePath;
    }
});


setToPlayerTimeStart.addEventListener("click", () => {
    startTimeInput.value = formatTime(videoPlayer.currentTime)
})

setToPlayerTimeEnd.addEventListener("click", () => {
    endTimeInput.value = formatTime(videoPlayer.currentTime)
})

function getFormValues() {
    return {
    inputFile: document.getElementById('inputFile').value,
    outputFile: document.getElementById('outputFile').value,
    startTime: document.getElementById('startTime').value,
    endTime: document.getElementById('endTime').value,
    gain: document.getElementById('gain').value,
    quality: document.getElementById('quality').value,
    useEncoder: document.getElementById('useEncoder').value
    };
}



document.getElementById('runBtn').addEventListener('click', async () => {
    const args = getFormValues();
    console.log("RUNNING!!!!")
    await ipcRenderer.invoke('run-ffmpeg', args);
    console.log("It's done!")
});



