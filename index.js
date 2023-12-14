const ping = require('ping');
const config = require("./config")
const prompt = require("prompt-sync")();
const fs = require('fs');

let timeoutConsecutive = 0;
let currentOutageBegan = 0;

let pingChunk = [];

function writeToPingHistory(){
    if(config.pingHistoryFolder == '')return;
    let pingHistory = JSON.parse(fs.readFileSync(pingHistoryFile));
    pingChunk.forEach(ping => {pingHistory.push(ping)})
    fs.writeFileSync(pingHistoryFile, JSON.stringify(pingHistory));
    pingChunk = [];
}

if(!config.ip){
    config.ip = prompt("Please enter the IP address you wish to ping: ");
}
let pingHistoryFile = `${config.pingHistoryFolder}/${config.ip}.json`;

if(!fs.existsSync(pingHistoryFile) && config.pingHistoryFolder != ''){
    fs.writeFileSync(pingHistoryFile, JSON.stringify([]));
}

function check(){
    setTimeout(async () => {
        let pingResult = await ping.promise.probe(config.ip, { 'timeout': Math.floor(config.pingTimeout / 1000) });

        if(pingResult.time == 'unknown'){
            
            timeoutConsecutive = timeoutConsecutive + 1;
            if(timeoutConsecutive == config.timeoutCountForOutage){
                console.log('\x1b[31m%s\x1b[0m', `Outage detected!`)
                currentOutageBegan = Date.now();
            }

            if(timeoutConsecutive >= config.timeoutCountForOutage) console.log(`Outage duration: ${Math.floor((Date.now() - currentOutageBegan) / 1000)}s`)
        
            if(timeoutConsecutive < config.timeoutCountForOutage)console.log('\x1b[33m%s\x1b[0m', `Timeout`);
        } else {
            if(timeoutConsecutive >= config.timeoutCountForOutage){
                if(config.outageFolder == ''){
                    console.log(`Outage resolved`);
                } else {
                    let filenameDate = new Date(0);
                    filenameDate.setUTCSeconds(Math.floor(currentOutageBegan / 1000));
                    let filename = `${filenameDate.getMonth()}-${filenameDate.getDate()}-${filenameDate.getFullYear()}_${filenameDate.getHours()}-${filenameDate.getMinutes()}-${filenameDate.getSeconds()}.json`;
                    fs.writeFile(`${config.outageFolder}/${filename}`, JSON.stringify({
                        outageBegan: currentOutageBegan,
                        outageEnded: Date.now(),
                        outageDuration: Date.now() - currentOutageBegan,
                        ip: config.ip,
                        timeoutDuration: config.pingTimeout,
                    }), function (err) {
                        if (err) return console.log(err);
                        console.log(`Outage resolved. Logged to ${config.outageFolder}/${filename}`);
                    }); 
                }
                currentOutageBegan = 0;
            }
            
            console.log(pingResult.time < 100 ? '\x1b[32m%s\x1b[0m' : pingResult.time < 300 ? '\x1b[33m%s\x1b[0m' : '\x1b[31m%s\x1b[0m', `${config.ip}: ${pingResult.time}ms`)
            timeoutConsecutive = 0;
        }

        if(config.pingHistoryFolder != '') pingChunk.push({
            delay: pingResult.time,
            time: Date.now(),
        });
        if(pingChunk.length >= config.maxPingChunkSize) writeToPingHistory();

        check();
    }, config.pingDelay); 
}

check();