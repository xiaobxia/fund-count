/**
 * Created by xiaobxia on 2018/3/1.
 */
const schedule = require('node-schedule');
const request = require('request-promise');
/**
 * cron风格的
 *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    |
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, OPTIONAL)
 */
let rule = new schedule.RecurrenceRule();

rule.dayOfWeek = [new schedule.Range(1, 5)];
// 10-12,13-16
rule.hour = [10, 11, 13, 14, 15];
let minute = [];
for (let k = 0; k < 60; k += 3) {
  minute.push(k);
}
rule.minute = minute;

function updateValuation() {
  request({
    method: 'get',
    url: `http://39.108.114.91:3002/myService/analyze/updateValuation`
  }).then(()=>{
    console.log('结束');
  }).catch(function (err) {
    console.error(err);
  });
  console.log(`于${new Date().toLocaleString()}执行更新基金估值`);
}

const job = schedule.scheduleJob(rule, updateValuation);

