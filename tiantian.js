/**
 * Created by xiaobxia on 2018/1/26.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');

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
// request({
//   method: 'get',
//   url: `http://api.fund.eastmoney.com/f10/lsjz?callback=jQuery18306565218995177082_${Date.now()}&fundCode=519772&pageIndex=1&pageSize=700&startDate=&endDate=&_=${Date.now()}`,
//   encoding: 'utf-8',
//   headers: {
//     Referer: 'http://fund.eastmoney.com/f10/jjjz_519772.'
//   }
// }).then((body) => {
//   const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
//   const list = JSON.parse(jsonData).Data.LSJZList;
//   let list2 = [];
//   list.forEach(function (item) {
//     list2.push(parseFloat(item.JZZZL || 0))
//   });
//   let i = 0;
//   if (list2[list2.length - 1] === 0) {
//     for (let k = list2.length - 2; k > 0; k--) {
//       if (list2[k] !== 0) {
//         i = k;
//         break;
//       }
//     }
//   }
//
//   logData({
//     list: list2.slice(0, i)
//   });
// }).catch(function (err) {
//   console.log(err)
// });

function logData(fileData) {
  const fileName = './mock/fund.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}

const list = fs.readJsonSync('./mock/fund.json').list;

function getUpAndDownCount(list) {
  let up = 0;
  let down = 0;
  let equal = 0;
  for (let i = 0; i < list.length; i++) {
    let a = list[i];
    if (a > 0) {
      up++;
    } else if (a === 0) {
      equal++;
    } else {
      down++;
    }
  }
  return {
    up,
    equal,
    down
  }
}

// 获取单日最大跌涨幅
function getMaxUpAndDown(list) {
  let newList = [];
  for (let i = 0; i < list.length; i++) {
    newList.push(list[i])
  }
  newList.sort(function (a, b) {
    return parseFloat(a) - parseFloat(b)
  });
  return {
    maxUp: newList[0],
    maxDown: newList[newList.length - 1]
  }
}
// 连涨和连跌天数
function getMaxUpIntervalAndMaxDownInterval(list) {
  let newList = [];
  for (let i = list.length - 1; i > 0; i--) {
    newList.push(list[i])
  }

  let maxUpInterval = 0;
  let maxUpTemp = 0;
  let maxDownInterval = 0;
  let maxDownTemp = 0;
  let upInterval = {};
  let downInterval = {};
  // 涨
  for (let i = 0; i < newList.length; i++) {
    // 包括0
    if (newList[i] > 0 || newList[i] === 0) {
      maxUpTemp = 1;
      for (let j = i + 1; j < newList.length; j++) {
        if (newList[j] > 0 || newList[j] === 0) {
          maxUpTemp++;
        } else {
          break;
        }
      }
      if (upInterval[maxUpTemp]) {
        upInterval[maxUpTemp]++;
      } else {
        upInterval[maxUpTemp] = 1;
      }
      if (maxUpInterval < maxUpTemp) {
        maxUpInterval = maxUpTemp
      }
    }

    if (newList[i] < 0 || newList[i] === 0) {
      maxDownTemp = 1;
      for (let j = i + 1; j < newList.length; j++) {
        if (newList[j] < 0 || newList[j] === 0) {
          maxDownTemp++;
        } else {
          break;
        }
      }
      if (downInterval[maxDownTemp]) {
        downInterval[maxDownTemp]++;
      } else {
        downInterval[maxDownTemp] = 1;
      }
      if (maxDownInterval < maxDownTemp) {
        maxDownInterval = maxDownTemp
      }
    }
  }

  return {
    maxUpInterval,
    maxDownInterval,
    upInterval,
    downInterval
  }
}

console.log(getUpAndDownCount(list))
console.log(getMaxUpAndDown(list))
console.log(getMaxUpIntervalAndMaxDownInterval(list))


// logData({
//   list
// })
