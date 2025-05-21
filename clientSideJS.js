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

const setToMinStart = document.getElementById('setToMinStart')
const goToStart = document.getElementById('goToStart')

const setToMaxEnd = document.getElementById('setToMaxEnd')
const goToEnd = document.getElementById('goToEnd')

const runBtn = document.getElementById('runBtn')

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

function formatTimeReversed(timeStr) {
  const [hh, mm, rest] = timeStr.split(':');
  const [ss, ms = '0'] = rest.split('.');

  const hours = parseInt(hh, 10);
  const minutes = parseInt(mm, 10);
  const seconds = parseInt(ss, 10);
  const milliseconds = parseInt(ms.padEnd(3, '0'), 10); // pad to milliseconds if needed

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
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

setToMinStart.addEventListener("click", () => {
    startTimeInput.value = "00:00:00.000"
})

goToStart.addEventListener("click", () => {
    videoPlayer.currentTime = formatTimeReversed(startTimeInput.value)
})

setToMaxEnd.addEventListener("click", () => {
    videoDurationRoundedUp = Math.ceil(videoPlayer.duration)
    endTimeInput.value = formatTime(videoDurationRoundedUp)
})

goToEnd.addEventListener("click", () => {
    videoPlayer.currentTime = formatTimeReversed(endTimeInput.value)
})


runBtn.addEventListener('click', async () => {
    console.log("RUNNING!!!!")
    runBtn.classList.remove("btn-success");
    runBtn.classList.add("btn-warning");
    runBtn.textContent = "Processing..."

    var command = `ffmpeg -y -ss ${startTimeInput.value} -to ${endTimeInput.value} -i "${inputFileText.value}" -map 0:v -map 0:a -map_chapters -1 -shortest -c:v ${encoderInput.value} -c:a aac -b:a 320k -ac 2 -qp ${QPInput.value} -filter:a "volume=${gainInput.value}dB" "${outputFileText.value}"`
    console.log(command)
    await ipcRenderer.invoke('execute-command-backend', {cmd: command});

    console.log("It's done!")
    runBtn.classList.remove("btn-warning");
    runBtn.classList.add("btn-success");
    runBtn.textContent = "Run FFmpeg"
});


// When the program is closing
ipcRenderer.on('program-is-closing', async () => {
    await ipcRenderer.invoke('save-data-backend', {fileName: "data.json", data: {name: 'Alice', age: 30}});
});

