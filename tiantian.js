/**
 * Created by xiaobxia on 2018/1/26.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');

// 天天估值数据
// request({
//   method: 'get',
//   url: `http://fundgz.1234567.com.cn/js/001703.js?rt=1516930610497`,
//   encoding: 'utf-8'
// }).then((body) => {
//   const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
//   console.log(JSON.parse(jsonData))
// }).catch(function (err) {
//   console.log(err)
// });

// 获取基金的净值变化表

function getUpDown(code, days) {

  request({
    method: 'get',
    url: `http://api.fund.eastmoney.com/f10/lsjz?callback=jQuery18306565218995177082_${Date.now()}&fundCode=${code}&pageIndex=1&pageSize=${days}&startDate=&endDate=&_=${Date.now()}`,
    encoding: 'utf-8',
    headers: {
      Referer: `http://fund.eastmoney.com/f10/jjjz_${code}.`
    }
  }).then((body) => {
    const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
    const list = JSON.parse(jsonData).Data.LSJZList;
    let list2 = [];
    list.forEach(function (item) {
      list2.push({
        // 净值增长率
        JZZZL: parseFloat(item.JZZZL || 0),
        // 日期
        FSRQ: item.FSRQ,
        DWJZ: parseFloat(item.DWJZ || 0),
      })
    });
    // 剔除早期的几个无效数据
    if (list2[list2.length - 1]['JZZZL'] === 0) {
      let i = 0;
      for (let k = list2.length - 2; k > 0; k--) {
        if (list2[k]['JZZZL'] !== 0) {
          i = k;
          break;
        }
      }
      list2 = list2.slice(0, i);
    }

    logData({
      list: list2
    });
    return list2;
  }).catch(function (err) {
    console.log(err)
  });
}


function logData(fileData) {
  const fileName = './mock/fund.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}

getUpDown('020026', 120);


// logData({
//   list
// })
