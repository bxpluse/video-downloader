const {shell} = require('electron')
const { dialog } = require('electron').remote
const exec = require('child_process').exec;
const path = require('path')
const Store = require('electron-store');
const log = require('electron-log');

const store = new Store();
let settingsOpened = false;

log.transports.console.level = false;

function openSettings(){
    /* Open settings window */

    if(settingsOpened){
        return
    }
    settingsOpened = true;
    const BrowserWindow = require('electron').remote.BrowserWindow;
    const win = new BrowserWindow({
        width: 600,
        height: 200,
        title: "Video Downloader Settings",
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.removeMenu()

    // Allow only one instance of settings window at a time
    win.on('close', function() {
        settingsOpened = false;
        setDestination();
    });

    // Load saved paths as GET parameters
    let params = "?"
    const keys = ["ffmpeg", "youtube-dl", "destination"]
    for (const [, key] of Object.entries(keys)) {
        const value = store.get(key)
        if(value != null){
            params += key + "=" + value + "&"
        }
    }

    win.loadURL('file://' + __dirname + '/settings.html' + params).then((res) => {

    });
}


function selectPath(id) {
    /* Opens file explorer to select a file. Save path into store. */
    let props = []
    if(id === "destination"){
        props.push('openDirectory')
    } else {
        props.push('openFile')
    }
    dialog.showOpenDialog({properties: props}).then((res) => {
        const file_path = resolvePath(res.filePaths);
        store.set(id, file_path);
        onset(id, file_path);
    });
}


function download(url, isMp3, quality, args){
    /* Attempts to download a video, and streams progress to logger */

    // Options to pass into command
    const youtubedl_path = path.dirname(store.get("youtube-dl")).split(path.sep).pop();
    const options = {
        '-o' : getPath() + '/%(title)s-%(id)s.%(ext)s',
        '--ffmpeg-location' : store.get("ffmpeg")
    }

    if(isMp3){
        options['-x'] = null;
        options['--audio-format'] = 'mp3'
    } else {
        if(quality === 'best'){
            options['-f'] = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4'
        }
    }

    let command = 'youtube-dl ';

    for (const [key, value] of Object.entries(options)) {
        if(value == null){
            command += key + " ";
        } else {
            command += key + " " + value + " ";
        }
    }

    // Add in optional arguments if provided
    const formattedArgs = args.trim();
    if (formattedArgs !== '') {
        command += formattedArgs + ' ';
    }

    // Add url to command
    command += url

    log.info(url); // Save downloaded url history to logs

    const process = exec(command, {cwd: youtubedl_path}) // Send command to cmd
    console.log("Passing in the following parameters to youtube-dl:");
    console.log("---------------------------------");
    console.log(command);
    console.log("---------------------------------");
    // Stream output to textarea viewable in html
    process.stdout.on('data', function(data) {
        console.log(data);
    });
}


function getPath(){
    /* Gets destination path from saved settings, or set default as Desktop. */
    if(store.get("destination") != null){
        return store.get("destination");
    }
    const defaultPath = resolvePath(path.join(require('os').homedir(), 'Desktop'))
    store.set("destination", defaultPath);
    return defaultPath;
}


function resolvePath(file_path) {
    /* Changes all '\' to '/' to make paths consistent on different OS's*/
    return file_path.toString().replace(/\\/g, "/");
}


function openExplorer(){
    shell.openPath(getPath()).then(() =>
        console.log("Opening file explorer: " + getPath())
    )
}

function openLogs(){
    const path = log.transports.file.getFile().toString();
    shell.openPath(path).then(() =>
        console.log("Opening download history: " + path)
    )
}
