/**
 * Created by xiaobxia on 2018/1/26.
 */
const request = require('request-promise');
const cheerio = require('cheerio');

request({
  method: 'get',
  url: `http://fundgz.1234567.com.cn/js/001703.js?rt=1516930610497`,
  encoding: 'utf-8'
}).then((body) => {
  const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
  console.log(JSON.parse(jsonData))
}).catch(function (err) {
  console.log(err)
});
