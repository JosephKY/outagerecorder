## Outage Recorder
Outage Recorder is a lightweight ping utility made entirely in JavaScript.

### Abilities
1. Ping multiple IP addresses at the same time
2. Automatically record outages with configurable outage thresholds
3. Automatically record all-time ping history
4. View your all-time ping history as a visual line graph (currently a work in progress)

### Usage
Easy way: double click `run.bat`. It will install the required packages and run `index.js` for you.

Long way:  Run `npm i` to install the required packages, then run `node index.js`. 

Take a look inside of `config.js` if you wish to change some settings, such as the IPs being pinged, the timeout duration, and the outage threshold. 

### Configuration
These are the options you can find in `config.js`:
`ips`: array(string): The IP addresses you want to ping
`timeoutCountForOutage`: integer: The number of times all the IP addresses being pinged must time out in order for an outage to be declared.
`outageFolder`: string: The folder directory where you want to store outage logs. Leave blank to disable outage logs
`pingDelay`: int: The amount of time, in milliseconds, spent between ping batches. All IPs are pinged at the same time.
`pingTimeout`: int: The maximum amount of time, in milliseconds, that a ping has to return before it's considered a timeout.
`pingHistoryFolder`: string: The folder directory where all-time ping logs are stored. Leave blank to disable ping logs
`maxPingChunkSize`: int: The maximum amount of ping data, for each IP, that is stored in memory before it is written to all-time ping logs