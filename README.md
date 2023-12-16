## Outage Recorder
Outage Recorder is a lightweight ping utility made entirely in JavaScript.

### Abilities
1. Ping multiple IP addresses at the same time
2. Automatically record outages with configurable outage thresholds
3. Automatically record all-time ping history
4. View your all-time ping history as a visual line graph (currently a work in progress)
5. Colorful ping logs based on the ping's performance

### Usage
Easy way: double click `run.bat`. It will install the required packages and run `index.js` for you.

Long way:  Run `npm i` to install the required packages, then run `node index.js`. 

Take a look inside of `config.js` if you wish to change some settings, such as the IPs being pinged, the timeout duration, and the outage threshold. 

### Configuration
These are the options you can find in `config.js`:

<table class="tg">
<thead>
  <tr>
    <th class="tg-0lax"><span style="font-weight:bold">Configuration Key</span></th>
    <th class="tg-0lax"><span style="font-weight:bold">Data Type</span></th>
    <th class="tg-0lax"><span style="font-weight:bold">Description</span></th>
    <th class="tg-0lax"><span style="font-weight:bold">Example</span></th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-0lax">ips</td>
    <td class="tg-0lax">array (string)</td>
    <td class="tg-0lax">The IP addresses you want to ping. Leave blank to be prompted for IP addresses on startup</td>
    <td class="tg-0lax">[ "8.8.8.8", "1.1.1.1" ]</td>
  </tr>
  <tr>
    <td class="tg-0lax">timeoutCountForOutage</td>
    <td class="tg-0lax">integer</td>
    <td class="tg-0lax">The number of times all the IP addresses being pinged must time out in order for an outage to be declared.</td>
    <td class="tg-0lax">5</td>
  </tr>
  <tr>
    <td class="tg-0lax">outageFolder</td>
    <td class="tg-0lax">string</td>
    <td class="tg-0lax">The folder directory where you want to store outage logs. Leave blank to disable outage logs.</td>
    <td class="tg-0lax">"C:\Users\John Doe\Documents\Outage Logs"</td>
  </tr>
  <tr>
    <td class="tg-0lax">pingDelay</td>
    <td class="tg-0lax">integer</td>
    <td class="tg-0lax">The amount of time, in milliseconds, spent between ping batches. All IPs are pinged at the same time.</td>
    <td class="tg-0lax">1000</td>
  </tr>
  <tr>
    <td class="tg-0lax">pingTimeout</td>
    <td class="tg-0lax">integer</td>
    <td class="tg-0lax">The maximum amount of time, in milliseconds, that a ping has to return before it's considered a timeout.</td>
    <td class="tg-0lax">3000</td>
  </tr>
  <tr>
    <td class="tg-0lax">pingHistoryFolder</td>
    <td class="tg-0lax">string</td>
    <td class="tg-0lax">The folder directory where all-time ping logs are stored. Leave blank to disable ping logs.</td>
    <td class="tg-0lax">"C:\Users\John Doe\Documents\Ping Logs"</td>
  </tr>
  <tr>
    <td class="tg-0lax">maxPingChunkSize</td>
    <td class="tg-0lax">integer</td>
    <td class="tg-0lax">The maximum amount of ping data, for each IP, that is stored in memory before it is written to all-time ping logs.</td>
    <td class="tg-0lax">10</td>
  </tr>
</tbody>
</table>