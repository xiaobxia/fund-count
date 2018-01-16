/**
 * Created by xiaobxia on 2018/1/15.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const myFund = require('./myFund');

let requestList = [];
let priceCount = 0;
myFund.forEach(function (item) {
  priceCount += item.price;
});
console.log('持仓金额', priceCount);
const startTime = Date.now();
myFund.forEach(function (item, index) {
  /**
   * 天天基金
   */
  // 延时发送，防止被禁ip
  setTimeout(function () {
    requestList.push(request({
      method: 'get',
      url: `http://fund.eastmoney.com/${item.code}.html?spm=search`,
      encoding: 'utf-8',
      transform: function (body) {
        return cheerio.load(body);
      }
    }).then(($) => {
      item.preRateChange = $('#gz_gszzl').text();
      if (index + 1 === myFund.length) {
        // 所有的请求都被添加
        Promise.all(requestList).then(() => {
          // 计算每笔基金的收益
          myFund.forEach(function (item) {
            const change = parseFloat(item.preRateChange.slice(0, item.preRateChange.indexOf('%')));
            item.preValueChange = change * item.price / 100;
          });
          // 计算总收益
          let totalCount = 0;
          myFund.forEach(function (item) {
            totalCount += item.preValueChange;
          });
          totalCount = parseInt(totalCount);
          console.log('天天基金预估:', totalCount);
          console.log(`用时:${Date.now()-startTime}ms`);
          // 打印到文件
          const now = (new Date()).toLocaleString();
          logData({
            now,
            totalCount,
            myFund
          });
        });
      }
    }).catch(function (err) {
      console.log(err)
    }));
  }, index * 300);
});

function logData(fileData) {
  const fileName = './mock/last.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}
