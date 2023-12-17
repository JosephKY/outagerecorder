module.exports = {
    "ips": ["8.8.8.8", "104.244.42.193", "192.168.254.254"], // ipv4 addresses to ping
    "timeoutCountForOutage": 3, // number of consecutive timeouts before outage is logged
    "nonOutageIps": ["192.168.254.254"], // ipv4 addresses that are in the previous list that dont need to time out in order for an outage to be declared
    "outageFolder": "./outages", // directory to store outage logs in. leave blank for no outage logs
    "pingDelay": 1000, // in milliseconds
    "pingTimeout": 2000, // in milliseconds 
    "pingHistoryFolder": "./pingHistory", // the directory to store ping history in. leave blank for no ping history
    "maxPingChunkSize": 5, // number of pings to store in memory before exporting to ping history file
    "graphMode": true, // Show a graph of pings instead of constant logging
    "graphModeMaxPings": 125, // number of pings to show in graph. if this is greater than the width of the terminal, it will be set to the width of the terminal
}