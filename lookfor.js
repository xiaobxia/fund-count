/**
 * Created by xiaobxia on 2018/3/4.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const Iconv = require('iconv-lite');

/**
 * 得到基金
 */

function logData(fileData) {
  const fileName = './mock/fund.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}

/**
 * 需要在10点以后才找得出数据
 */
request({
  method: 'get',
  url: `http://api.fund.eastmoney.com/FundGuZhi/GetFundGZList?type=2&sort=3&orderType=desc&canbuy=1&pageIndex=1&pageSize=7000&callback=jQuery18308875682296234204_1545794364195&_=1545794408778`,
  encoding: 'utf-8',
  headers: {
    Referer: 'http://fund.eastmoney.com/fundguzhi.html'
  }
}).then((body) => {
  //console.log(body)
  let str = body.slice(body.indexOf('(') + 1, body.lastIndexOf(')'))
  const data = JSON.parse(str).Data
  let funds = [];
  data.list.map(function (item) {
    if(item.jjjc.indexOf('金鹰') === -1 && item.gsz !== '---') {
      funds.push({
        code: item.bzdm,
        name: item.jjjc,
        valuation: parseFloat(item.gsz),
        net_value: parseFloat(item.dwjz),
        sell: item.isbuy === '1'
      });
    }
  });
  logData({
    list: funds
  });
}).catch(function (err) {
  console.log(err)
});
