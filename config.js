module.exports = {
    "timeoutCountForOutage": 3, // number of consecutive timeouts before outage is logged
    //"ips": ["8.8.8.8"], // ipv4 addresses to ping
    "outageFolder": "./outages", // directory to store outage logs in. leave blank for no outage logs
    "pingDelay": 1000, // in milliseconds
    "pingTimeout": 2000, // in milliseconds
    
    "pingHistoryFolder": "./pingHistory", // the directory to store ping history in. leave blank for no ping history
    "maxPingChunkSize": 5 // number of pings to store in memory before exporting to ping history file
}