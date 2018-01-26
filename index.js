/**
 * Created by xiaobxia on 2018/1/15.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const myFund = require('./myFund');

const rule = fs.readJsonSync('./mock/resultRatio.json').rule;
let requestList = [];
let isInCount = false;
const startTime = Date.now();
const dataSourceCount = 3;

myFund.forEach(function (item, index) {
  setTimeout(function () {
    // 天天
    requestList.push(request({
      method: 'get',
      url: `http://fundgz.1234567.com.cn/js/${item.code}.js?rt=1516930610497`,
      encoding: 'utf-8'
    }).then((body) => {
      const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
      let data = JSON.parse(jsonData);
      item.name = data.name;
      item.dwjz = parseFloat(data.dwjz);
      // 估值
      item.tiantianGsz = parseFloat(data.gsz);
      // 估幅
      item.tiantianGszzl = parseFloat(data.gszzl);
      count();
    }).catch(function (err) {
      console.log(err)
    }));
    // 好买
    requestList.push(request({
      method: 'get',
      url: `https://www.howbuy.com/fund/ajax/gmfund/valuation/valuationnav.htm?jjdm=${item.code}`,
      encoding: 'utf-8',
      transform: function (body) {
        return cheerio.load(body);
      }
    }).then(($) => {
      // 预估涨跌幅
      let gszzl = $('li span').eq(2).text();
      //预估净值
      const gsz = $('li span').eq(0).text();
      gszzl = gszzl.slice(0, gszzl.indexOf('%'));
      // 估值
      item.haomaiGsz = parseFloat(gsz);
      // 估幅
      item.haomaiGszzl = parseFloat(gszzl);
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
      // 估值
      item.xinlangGsz = parseFloat(temp[2]);
      // 估幅
      item.xinlangGszzl = parseFloat(temp[temp.length - 2]);
    }).catch(function (err) {
      console.log(err)
    }));
  }, 1000 / 2 * index);
});

function count() {
  if ((requestList.length === myFund.length * dataSourceCount) && !isInCount) {
    isInCount = true;
    // 所有的请求都结束
    Promise.all(requestList).then(() => {
      let totalCount = 0;
      // 计算每只基金的持仓金额price
      myFund.forEach(function (item) {
        item.price = item.dwjz * item.count;
        totalCount += item.price;
      });
      totalCount = parseInt(totalCount);
      // 计算每笔基金的收益
      myFund.forEach(function (item) {
        // 天天
        item.tiantianPreValueChange = item.tiantianGsz * item.count - item.price;
        // 好买
        item.haomaiPreValueChange = item.haomaiGsz * item.count - item.price;
        // 新浪
        item.xinlangPreValueChange = item.xinlangGsz * item.count - item.price;
      });
      // 计算天天总收益
      let tiantianCount = 0;
      myFund.forEach(function (item) {
        tiantianCount += item.tiantianPreValueChange;
      });
      tiantianCount = parseInt(tiantianCount);
      // 计算好买总收益
      let haomaiCount = 0;
      myFund.forEach(function (item) {
        if (!item.haomaiPreValueChange && item.haomaiPreValueChange !== 0) {
          haomaiCount += item.tiantianPreValueChange;
          console.log(`好买基金缺少${item.name}的数据,用天天基金数据代替`);
        } else {
          haomaiCount += item.haomaiPreValueChange;
        }
      });
      haomaiCount = parseInt(haomaiCount);
      // 计算新浪
      let xinlangCount = 0;
      myFund.forEach(function (item) {
        if (!item.xinlangPreValueChange && item.xinlangPreValueChange !== 0) {
          xinlangCount += item.tiantianPreValueChange;
          console.log(`新浪基金缺少${item.name}的数据,用天天基金数据代替`);
        } else {
          xinlangCount += item.xinlangPreValueChange;
        }
      });
      xinlangCount = parseInt(xinlangCount);
      console.log('我的持仓:',totalCount);
      console.log('天天基金预估:', tiantianCount);
      console.log('好买基金预估:', haomaiCount);
      console.log('新浪基金预估:', xinlangCount);
      let temp =
        rule[0] * (tiantianCount / Math.abs(tiantianCount)) * Math.pow(tiantianCount, 2)
        +
        rule[1] * (haomaiCount / Math.abs(haomaiCount)) * Math.pow(haomaiCount, 2)
        +
        rule[2] * (xinlangCount / Math.abs(xinlangCount)) * Math.pow(xinlangCount, 2);
      const averageCount = parseInt(Math.sqrt(Math.abs(temp))) * (temp / Math.abs(temp));
      console.log(`均值:${averageCount}`);
      console.log(`用时:${Date.now() - startTime}ms`);
      // 打印到文件
      const now = (new Date()).toLocaleString();
      console.log(now);
      logData({
        now,
        totalCount,
        tiantian: tiantianCount,
        haomai: haomaiCount,
        xinlang: xinlangCount,
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
