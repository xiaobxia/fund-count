/**
 * Created by xiaobxia on 2018/1/15.
 */
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

request(
  {
    method: 'get',
    url: 'http://fund.eastmoney.com/fundguzhi.html'
  },
  function (err, response, body) {
    if (!err && response.statusCode === 200) {
      let html = iconv.decode(body, 'utf-8');
      console.log(html)
      let $ = cheerio.load(html);
      let mainData = [];
    }
  }
);
