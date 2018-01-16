/**
 * Created by xiaobxia on 2018/1/15.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const myFund = require('./myFund');

let requestList = [];
let priceCount = 0;
let isInCount = false;
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
      count();
    }).catch(function (err) {
      console.log(err)
    }));
    // 好买基金
    requestList.push(request({
      method: 'post',
      url: `https://www.howbuy.com/fund/ajax/gmfund/valuation/valuationnav.htm?jjdm=${item.code}`,
      encoding: 'utf-8',
      transform: function (body) {
        return cheerio.load(body);
      }
    }).then(($) => {
      item.preRateChange1 = $('li span').eq(2).text();
      count();
    }).catch(function (err) {
      console.log(err)
    }));
  }, index * 300);
});

function count() {
  if ((requestList.length === myFund.length * 2) && !isInCount) {
    isInCount = true;
    // 所有的请求都被添加
    Promise.all(requestList).then(() => {
      // 计算每笔基金的收益
      myFund.forEach(function (item) {
        // 天天
        const change = parseFloat(item.preRateChange.slice(0, item.preRateChange.indexOf('%')));
        item.preValueChange = change * item.price / 100;
        // 好买
        const change1 = parseFloat(item.preRateChange1.slice(0, item.preRateChange1.indexOf('%')));
        item.preValueChange1 = change1 * item.price / 100;
      });
      // 计算天天总收益
      let totalCount = 0;
      myFund.forEach(function (item) {
        totalCount += item.preValueChange;
      });
      totalCount = parseInt(totalCount);
      // 计算好买总收益
      let totalCount1 = 0;
      myFund.forEach(function (item) {
        if (!item.preValueChange1 && item.preValueChange1 !== 0) {
          totalCount1 += item.preValueChange;
          console.log(`好买基金缺少${item.name}的数据,用天天基金数据代替`);
        } else {
          totalCount1 += item.preValueChange1;
        }
      });
      totalCount1 = parseInt(totalCount1);
      const averageCount = parseInt(Math.sqrt((Math.pow(totalCount, 2) + Math.pow(totalCount1, 2)) / 2));
      console.log('天天基金预估:', totalCount);
      console.log('好买基金预估:', totalCount1);
      console.log('均值:', averageCount);
      console.log(`用时:${Date.now() - startTime}ms`);
      // 打印到文件
      const now = (new Date()).toLocaleString();
      logData({
        now,
        totalCount,
        totalCount1,
        averageCount,
        myFund
      });
    });
  }
}

function logData(fileData) {
  const fileName = './mock/last.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}
