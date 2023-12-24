const ping = require('ping');
let config = require("./config");
try{
const config2 = require("./config2");
if(config2)config = config2;
}catch(e){}
const prompt = require("prompt-sync")();
const chalk = require('chalk');
const achart = require("asciichart");
const windowsize = require("window-size");
const https = require("https")
const fs = require('fs');
const speedTestUrl = "https://eu.httpbin.org/stream-bytes/"
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
        name: 'nonoutageips',
        alias: 'n',
        type: String,
        multiple: true
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
        name: 'align',
        alias: 'a',
        type: Boolean,
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
    },
    {
        name: 'speedtestsize',
        alias: 's',
        type: Number
    },
    {
        name: 'speedtestfreq',
        alias: 'f',
        type: Number
    },
    {
        name: 'speedtestunit',
        alias: 'u',
        type: String
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
    align: 'alignLogs',
    graphmode: 'graphMode',
    graphmaxpings: 'graphModeMaxPings',
    speedtestsize: 'speedTestSize',
    speedtestfreq: 'speedTestFrequency',
    speedtestunit: 'speedTestUnit',
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

let speedTestUnitMult = {
    "GBps": 0.000125,
    "gbps": 0.001,
    "MBps": 0.125,
    "mbps": 1,
    "KBps": 125,
    "kbps": 1000
}

if(!speedTestUnitMult[config.speedTestUnit])throw Error("Configuration error: Invalid speed test unit. Options are GBps, gbps, MBps, mbps, KBps, kbps. Got " + config.speedTestUnit)

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
        'height': windowsize.height - 4,
        'min':0,
        'max':biggestArrLength,
    }))
    let infoBarString = "";
    let statusBarString = "";
    for(let [ip, pings] of Object.entries(pingArrs)){
        let color = graphIpColorCoor[config.ips.indexOf(ip) % graphIpColorCoor.length] || chalk.white;
        let delay = pings[pings.length - 1]
        let attach = color(`${ip}: ${!pingArrsTimedOut.includes(ip) ? `${delay}ms` : 'Timeout' } `);
        infoBarString = infoBarString + attach;
        let statusColor = pingArrsTimedOut.includes(ip) ? chalk.bgMagenta : (delay < 100 ? chalk.bgGreen : delay < 300 ? chalk.bgYellow : chalk.bgRed);
        for (let i = 0; i < attach.length; i++) {
            if(i < 5 || i > attach.length - 5)continue;
            if(i == attach.length - 6){
                statusBarString = statusBarString + " ";
                break;
            }
            statusBarString = statusBarString + (i != attach.length - 1 ? statusColor(' ') : ' ');
        }
    }
    if(currentOutageBegan != 0){
        statusBarString = statusBarString + chalk.bgRed(` OUTAGE | Duration: ${Math.floor((Date.now() - currentOutageBegan) / 1000)}s `)
    } else {
        if(config.speedTestSize != 0)statusBarString = statusBarString + ` ${speedTestLast != null ? speedTestLast : 'Waiting'} ${speedTestInProgress ? '...' : ''}`
    }
    console.log(infoBarString)
    console.log(statusBarString)
    pingArrsTimedOut = [];
}

let speedTestCount = 0;
let speedTestBatch = null;
let speedTestLast = null;
let speedTestInProgress = false;
let speedTestFirst = false;

function speed(){
    let batch;
    speedTestFirst = true;
    speedTestInProgress = true;
    let startTime;
    https.get(`${speedTestUrl}${config.speedTestSize}`, response => {
        response.once('data', () => {
            startTime = new Date().getTime();
        });

        response.once('end', () => {
            let endTime = new Date().getTime();
            let duration = (endTime - startTime) / 1000;
            let bitsLoaded = config.speedTestSize * 8;
            batch = `${speedTestUnitMult[config.speedTestUnit] * (((bitsLoaded / duration) / 1000000)).toFixed(3)}${config.speedTestUnit}`;
            speedTestBatch = batch;
            speedTestLast = batch;
            speedTestCount = 0;
            speedTestInProgress = false;
        });
    }).on('error', ()=>{
        batch = `0${config.speedTestUnit}`
        speedTestBatch = batch;
        speedTestLast = batch;
        speedTestCount = 0;
        speedTestInProgress = false;
    })
}


function check(){
    setTimeout(async ()=>{
        let pings = {};
        let timeoutCount = 0;
        let pingString = "";
        speedTestCount = speedTestCount + 1;
        if(config.speedTestSize != 0 && (speedTestCount == config.speedTestFrequency || !speedTestFirst) && currentOutageBegan == 0)speed();
        for(ip of config.ips){
            let pingResult = await ping.promise.probe(ip, { 'timeout': Math.floor(config.pingTimeout / 1000) });
            if(config.graphMode) pingArrAdd(ip, pingResult.time);
            pings[ip] = pingResult.time;
            if(pingResult.time == 'unknown' || config.nonOutageIps.includes(ip)){
                timeoutCount = timeoutCount + 1;
            }

            let pingStringAttach = "";
            let pingStringAttachSimple = "";
            if(pingResult.time == 'unknown') {
                pingStringAttach = chalk.magenta(`${ip}: Timeout  `);
                pingStringAttachSimple = `${ip}: Timeout`;
            } else {
                pingStringAttach = (pingResult.time < 100 ? chalk.green(`${ip}: ${pingResult.time}ms  `) : pingResult.time < 300 ? chalk.yellow(`${ip}: ${pingResult.time}ms  `) : chalk.red(`${ip}: ${pingResult.time}ms  `));
                pingStringAttachSimple = `${ip}: ${pingResult.time}ms`;
            }
            let psAttachMaxChars = `${ip}: Timeout  `.length;
            if(psAttachMaxChars > pingStringAttachSimple.length && config.alignLogs){
                for (let i = 0; i < psAttachMaxChars - pingStringAttachSimple.length; i++) {
                    pingStringAttach = pingStringAttach + " ";
                }
            }
            pingString = pingString + pingStringAttach;
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
        if(speedTestBatch != null && !config.graphMode){
            console.log(`Download Speed: ${speedTestBatch}`);
            speedTestBatch = null;
        };

        if(config.graphMode)graphRender()

        check()
    }, config.pingDelay)
}

check();