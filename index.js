const ping = require('ping');
const config = require("./config");
const prompt = require("prompt-sync")();
const chalk = require('chalk');
const achart = require("asciichart");
const windowsize = require("window-size");
const fs = require('fs');
const cla = require('command-line-args');
const options = cla([
    {
        name: 'ips',
        alias: 'i',
        type: String,
        multiple: true
    },
    {
        name: 'maxtimeout',
        alias: 'm',
        type: Number,
    },
    {
        name: 'outagedir',
        alias: 'o',
        type: String
    },
    {
        name: 'delay',
        alias: 'd',
        type: Number
    },
    {
        name: 'timeout',
        alias: 't',
        type: Number
    },
    {
        name: 'historydir',
        alias: 'h',
        type: String
    },
    {
        name: 'maxhistory',
        alias: 'x',
        type: Number
    },
    {
        name: 'graphmode',
        alias: 'g',
        type: Boolean
    },
    {
        name: 'graphmaxpings',
        alias: 'p',
        type: Number
    }
]);

let optionConfigCoor = {
    ips: 'ips',
    maxtimeout: 'timeoutCountForOutage',
    outagedir: 'outageFolder',
    delay: 'pingDelay',
    timeout: 'pingTimeout',
    historydir: 'pingHistoryFolder',
    maxhistory: 'maxPingChunkSize',
    graphmode: 'graphMode',
    graphmaxpings: 'graphModeMaxPings'
}

for(let [key, value] of Object.entries(options)){
    if(optionConfigCoor[key]) config[optionConfigCoor[key]] = value;
}

let timeoutConsecutive = 0;
let currentOutageBegan = 0;

let pingChunk = {};

let pingArrs = {

}

let pingArrsTimedOut = [];

function pingArrAdd(ip, delay){
    if(!pingArrs[ip]) pingArrs[ip] = [];
    if(delay == 'unknown')pingArrsTimedOut.push(ip)
    pingArrs[ip].push(delay != 'unknown' ? delay : pingArrs[ip].length == 0 ? 1 : pingArrs[ip][pingArrs[ip].length - 1]);
    if(pingArrs[ip].length > (config.graphModeMaxPings > windowsize.width - 13 ? windowsize.width - 13 : config.graphModeMaxPings)) pingArrs[ip].shift();
}

let writeErrord = false;
function writePingHistory(ip){
    let pingHistoryFile = `${config.pingHistoryFolder}/${ip}.json`;
    try{
        if(config.pingHistoryFolder == '')return;
        let backupFile = `${pingHistoryFile}.backup`;
        let pingHistory = JSON.parse(fs.readFileSync(pingHistoryFile));
        fs.writeFileSync(backupFile, JSON.stringify(pingHistory));
        pingChunk[ip].forEach(ping => {pingHistory.push(ping)})
        fs.writeFileSync(pingHistoryFile, JSON.stringify(pingHistory));
        pingChunk[ip] = [];
        if(writeErrord) console.log(`Write to new file ${pingHistoryFile} succeeded`);
        writeErrord = false;
        fs.rmSync(backupFile);
    } catch(e){
        if(writeErrord){
            console.log(`Write to ${pingHistoryFile} failed again. Aborting`)
            return
        }
        console.log(`Write to ${pingHistoryFile} failed. Creating a new file and trying again`)
        fs.renameSync(pingHistoryFile, `${pingHistoryFile}.corrupt`);
        fs.writeFileSync(pingHistoryFile, JSON.stringify([]));
        writeErrord = true;
        writePingHistory(ip);
    }
}

function recordPing(ip, delay){
    if(!pingChunk[ip]) pingChunk[ip] = [];
    pingChunk[ip].push({
        time: Date.now(),
        delay: delay
    });
    if(pingChunk[ip].length > config.maxPingChunkSize){
        writePingHistory(ip);
        pingChunk[ip] = [];
    } 
}

if(!config.ips){
    config.ips = prompt("Please enter the IP addresses you wish to ping, separated by spaces: ");
    config.ips = config.ips.split(' ');
}

config.ips.forEach(ip=>{
    let pingHistoryFile = `${config.pingHistoryFolder}/${ip}.json`;
    if(!fs.existsSync(pingHistoryFile) && config.pingHistoryFolder != ''){
        fs.writeFileSync(pingHistoryFile, JSON.stringify([]));
    }
    pingArrs[ip] = []
});

let graphIpColorCoor = [
    chalk.cyan,
    chalk.green,
    chalk.yellow,
    chalk.red,
    chalk.magenta,
    chalk.blue,
    chalk.white,
    chalk.gray,
    chalk.greenBright,
    chalk.blueBright,
    chalk.cyanBright,
    chalk.magentaBright,
    chalk.redBright,
    chalk.yellowBright
];

function graphRender(){
    let pingsArrsRender = [];
    let biggestArrLength = 0;
    for(let [_, pings] of Object.entries(pingArrs)){
        pingsArrsRender.push(pings);
        if(pings.length > biggestArrLength) biggestArrLength = pings.length;
    }

    console.log(achart.plot(pingsArrsRender, {
        'colors': [
            achart.cyan,
            achart.green,
            achart.yellow,
            achart.red,
            achart.magenta,
            achart.blue,
            achart.white,
            achart.lightgray,
            achart.lightgreen,
            achart.lightblue,
            achart.lightcyan,
            achart.lightmagenta,
            achart.lightred,
            achart.lightyellow
        ],
        'height': windowsize.height - 3,
        'min':0,
        'max':biggestArrLength,
    }))
    let infoBarString = "";
    for(let [ip, pings] of Object.entries(pingArrs)){
        let color = graphIpColorCoor[config.ips.indexOf(ip) % graphIpColorCoor.length];
        let delay = pings[pings.length - 1]
        infoBarString = infoBarString + color(`${ip}: ${!pingArrsTimedOut.includes(ip) ? `${delay}ms` : 'Timeout' } `);
    }
    if(currentOutageBegan != 0) infoBarString = infoBarString + chalk.bgRed(` OUTAGE | Duration: ${Math.floor((Date.now() - currentOutageBegan) / 1000)}s `)
    console.log(infoBarString)
    pingArrsTimedOut = [];
}

function check(){
    setTimeout(async ()=>{
        let pings = {};
        let timeoutCount = 0;
        let pingString = "";
        for(ip of config.ips){
            let pingResult = await ping.promise.probe(ip, { 'timeout': Math.floor(config.pingTimeout / 1000) });
            if(config.graphMode) pingArrAdd(ip, pingResult.time);
            pings[ip] = pingResult.time;
            if(pingResult.time == 'unknown' || config.nonoutageIps.includes(ip)){
                timeoutCount = timeoutCount + 1;
            }

            if(pingResult.time == 'unknown') {
                pingString = pingString + chalk.yellow(`${ip}: Timeout  `);
            } else {
                pingString = pingString + (pingResult.time < 100 ? chalk.green(`${ip}: ${pingResult.time}ms  `) : pingResult.time < 300 ? chalk.yellow(`${ip}: ${pingResult.time}ms  `) : chalk.red(`${ip}: ${pingResult.time}ms  `));
            }
            recordPing(ip, pingResult.time)
        }

        if(timeoutCount >= config.ips.length){
            timeoutConsecutive = timeoutConsecutive + 1;
            if(timeoutConsecutive >= config.timeoutCountForOutage && currentOutageBegan == 0){
                if(!config.graphMode)console.log('\x1b[31m%s\x1b[0m', `Outage detected!`)
                currentOutageBegan = Date.now();
            }

            if(timeoutConsecutive > config.timeoutCountForOutage && !config.graphMode) console.log(`Outage duration: ${Math.floor((Date.now() - currentOutageBegan) / 1000)}s`)
        } else {
            if(timeoutConsecutive >= config.timeoutCountForOutage){
                let outageDate = new Date(0)
                outageDate.setUTCMilliseconds(currentOutageBegan);
                let dirRecordUser = ''
                if(config.outageFolder != ''){
                    fs.writeFileSync(`${config.outageFolder}/${outageDate.getMonth()}-${outageDate.getDate()}-${outageDate.getFullYear()}_${outageDate.getHours()}-${outageDate.getMinutes()}-${outageDate.getSeconds()}.json`, JSON.stringify({
                        outageBegan: currentOutageBegan,
                        outageEnded: Date.now(),
                        outageDuration: Date.now() - currentOutageBegan,
                        ips: config.ips,
                        timeoutDuration: config.pingTimeout,
                    }));
                    dirRecordUser = ". Outage log recorded in " + `${config.outageFolder}/${outageDate.getMonth()}-${outageDate.getDate()}-${outageDate.getFullYear()}_${outageDate.getHours()}-${outageDate.getMinutes()}-${outageDate.getSeconds()}.json`;
                }
                if(!config.graphMode)console.log('\x1b[32m%s\x1b[0m', `Outage resolved! Duration: ${Math.floor((Date.now() - currentOutageBegan) / 1000)}s${dirRecordUser}`)
            }
            timeoutConsecutive = 0;
            currentOutageBegan = 0;
        }

        if(timeoutConsecutive < config.timeoutCountForOutage && !config.graphMode) console.log(pingString);
    
        if(config.graphMode)graphRender()

        check()
    }, config.pingDelay)
}

check();