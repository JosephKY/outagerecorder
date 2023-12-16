const ping = require('ping');
const config = require("./config")
const prompt = require("prompt-sync")();
const chalk = require('chalk');
const fs = require('fs');

let timeoutConsecutive = 0;
let currentOutageBegan = 0;

let pingChunk = {};

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
});

function check(){
    setTimeout(async ()=>{
        let pings = {};
        let timeoutCount = 0;
        let pingString = "";
        let timeoutRecorded = false;
        for(ip of config.ips){
            let pingResult = await ping.promise.probe(ip, { 'timeout': Math.floor(config.pingTimeout / 1000) });
            pings[ip] = pingResult.time;
            if(pingResult.time == 'unknown' && timeoutRecorded == false){
                timeoutCount = timeoutCount + 1;
                timeoutRecorded = true;
            }
            if(timeoutConsecutive >= config.timeoutCountForOutage && pingResult.time != 'unknown'){
                timeoutConsecutive = 0;
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
                console.log('\x1b[32m%s\x1b[0m', `Outage resolved! Duration: ${Math.floor((Date.now() - currentOutageBegan) / 1000)}s${dirRecordUser}`)
            }

            if(pingResult.time == 'unknown') {
                pingString = pingString + chalk.yellow(`${ip}: Timeout  `);
            } else {
                pingString = pingString + (pingResult.time < 100 ? chalk.green(`${ip}: ${pingResult.time}ms  `) : pingResult.time < 300 ? chalk.yellow(`${ip}: ${pingResult.time}ms  `) : chalk.red(`${ip}: ${pingResult.time}ms  `));
            }
            recordPing(ip, pingResult.time)
        }

        if(timeoutCount == config.ips.length){
            timeoutConsecutive = timeoutConsecutive + 1;
            if(timeoutConsecutive == config.timeoutCountForOutage){
                console.log('\x1b[31m%s\x1b[0m', `Outage detected!`)
                currentOutageBegan = Date.now();
            }

            if(timeoutConsecutive > config.timeoutCountForOutage) console.log(`Outage duration: ${Math.floor((Date.now() - currentOutageBegan) / 1000)}s`)
        }

        if(timeoutConsecutive < config.timeoutCountForOutage) console.log(pingString);
    
        check()
    }, config.pingDelay)
}

check();