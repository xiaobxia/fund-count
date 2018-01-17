/**
 * Created by xiaobxia on 2018/1/15.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const myFund = require('./myFund');

const rule = fs.readJsonSync('./mock/resultRatio.json').rule;
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
    // 新浪
    requestList.push(request({
      method: 'get',
      url: `http://hq.sinajs.cn/list=fu_${item.code}`,
      encoding: 'utf-8'
    }).then((body) => {
      let temp = body.split(',');
      item.preRateChange2 = temp[temp.length - 2];
    }).catch(function (err) {
      console.log(err)
    }));
  }, index * 300);
});

function count() {
  if ((requestList.length === myFund.length * 3) && !isInCount) {
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
        // 新浪
        item.preValueChange2 = parseFloat(item.preRateChange2) * item.price / 100;
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
      // 计算新浪
      let totalCount2 = 0;
      myFund.forEach(function (item) {
        if (!item.preValueChange2 && item.preValueChange2 !== 0) {
          totalCount2 += item.preValueChange;
          console.log(`新浪基金缺少${item.name}的数据,用天天基金数据代替`);
        } else {
          totalCount2 += item.preValueChange2;
        }
      });
      totalCount2 = parseInt(totalCount2);
      console.log('天天基金预估:', totalCount);
      console.log('好买基金预估:', totalCount1);
      console.log('新浪基金预估', totalCount2);
      let temp =
        rule[0] * (totalCount / Math.abs(totalCount)) * Math.pow(totalCount, 2)
        +
        rule[1] * (totalCount1 / Math.abs(totalCount1)) * Math.pow(totalCount1, 2)
        +
        rule[2] * (totalCount2 / Math.abs(totalCount2)) * Math.pow(totalCount2, 2);
      const averageCount = parseInt(Math.sqrt(Math.abs(temp))) * (temp / Math.abs(temp));
      console.log(`均值:${averageCount}`);
      console.log(`用时:${Date.now() - startTime}ms`);
      // 打印到文件
      const now = (new Date()).toLocaleString();
      logData({
        now,
        totalCount,
        totalCount1,
        totalCount2,
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
