const fs = require("fs")

let max = 0;
let min = 0;
let avgContent = [];
let avg = null;
let count = 0;

let minBegan = 0;
let maxEnded = 0;

let outageLength = 0;

// loop through every json file in ./outages 
fs.readdir("./outages", (err, files)=>{
    files.forEach(file=>{
        if(!file.endsWith('.json'))return;
        let data = fs.readFileSync(`./outages/${file}`)
        let json = JSON.parse(data);
        avgContent.push(json.outageDuration);
        if(max < json.outageDuration)max = json.outageDuration;
        if(min > json.outageDuration || min == 0)min = json.outageDuration;
        if(minBegan > json.outageBegan || minBegan == 0)minBegan = json.outageBegan;
        if(maxEnded < json.outageEnded)maxEnded = json.outageEnded;
        count = count + 1;
        console.log(json.outageDuration)
        outageLength = outageLength + json.outageDuration;
    });

    avg = avgContent.reduce((a, b)=>a+b, 0) / avgContent.length;
    console.log(
        `Max: ${max}\n
        Min: ${min}\n
        Avg: ${avg}\n
        Count: ${count}\n
        Timespan: ${maxEnded - minBegan}\n
        Length: ${outageLength}`
    )
})

