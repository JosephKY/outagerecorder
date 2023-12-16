## Outage Recorder
Outage Recorder is a lightweight ping utility made entirely in JavaScript.

### Abilities
1. Ping multiple IP addresses at the same time
2. Automatically record outages with configurable outage thresholds
3. Automatically record all-time ping history

### Usage
Easy way: double click `run.bat`. It will install the required packages and run `index.js` for you.

Long way:  Run `npm i` to install the required packages, then run `node index.js`. 

Take a look inside of `config.js` if you wish to change some settings, such as the IPs being pinged, the timeout duration, and the outage threshold. 