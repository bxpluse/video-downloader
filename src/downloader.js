const exec = require('child_process').exec;
const app = require('electron').remote.app
const path = require('path')


function download(url){

    // Options to pass into command
    const options = {
        '-o' : getPath() + '/%(title)s'
    }

    let command = 'youtube-dl ';

    for (const [key, value] of Object.entries(options)) {
        command += key + " " + value + " ";
    }
    command += url

    const process = exec(command, {cwd: './libs'}) // Send command to cmd

    // Stream output to textarea viewable in html
    process.stdout.on('data', function(data) {
        console.log(data);
    });

}

function getPath(){
    // Put downloaded video on desktop
    // TODO Allow user to select path
    return path.join(require('os').homedir(), 'Desktop').replace(/\\/g, "/");
}
