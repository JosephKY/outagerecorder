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

<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;}
.tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
  overflow:hidden;padding:10px 5px;word-break:normal;}
.tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
  font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg .tg-0lax{text-align:left;vertical-align:top}
</style>
<table class="tg">
<thead>
  <tr>
    <th class="tg-0lax"><span style="font-weight:bold">Configuration Key</span></th>
    <th class="tg-0lax"><span style="font-weight:bold">Data Type</span></th>
    <th class="tg-0lax"><span style="font-weight:bold">Description</span></th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-0lax">ips</td>
    <td class="tg-0lax">array (string)</td>
    <td class="tg-0lax">The IP addresses you want to ping</td>
  </tr>
  <tr>
    <td class="tg-0lax">timeoutCountForOutage</td>
    <td class="tg-0lax">integer</td>
    <td class="tg-0lax">The number of times all the IP addresses being pinged must time out in order for an outage to be declared.</td>
  </tr>
  <tr>
    <td class="tg-0lax">outageFolder</td>
    <td class="tg-0lax">string</td>
    <td class="tg-0lax">The folder directory where you want to store outage logs. Leave blank to disable outage logs.</td>
  </tr>
  <tr>
    <td class="tg-0lax">pingDelay</td>
    <td class="tg-0lax">integer</td>
    <td class="tg-0lax">The amount of time, in milliseconds, spent between ping batches. All IPs are pinged at the same time.</td>
  </tr>
  <tr>
    <td class="tg-0lax">pingTimeout</td>
    <td class="tg-0lax">integer</td>
    <td class="tg-0lax">The maximum amount of time, in milliseconds, that a ping has to return before it's considered a timeout.</td>
  </tr>
  <tr>
    <td class="tg-0lax">pingHistoryFolder</td>
    <td class="tg-0lax">string</td>
    <td class="tg-0lax">The folder directory where all-time ping logs are stored. Leave blank to disable ping logs.</td>
  </tr>
  <tr>
    <td class="tg-0lax">maxPingChunkSize</td>
    <td class="tg-0lax">integer</td>
    <td class="tg-0lax">The maximum amount of ping data, for each IP, that is stored in memory before it is written to all-time ping logs.</td>
  </tr>
</tbody>
</table>