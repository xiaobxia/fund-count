/**
 * Created by xiaobxia on 2018/5/31.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const Iconv = require('iconv-lite');

const baseRate = 0.5;

function logData(fileData) {
  const fileName = './mock/lowFund.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}

let funds = fs.readJsonSync('./mock/fund.json').list;
// 800左右
funds = funds.slice(500, 600)

let resultList = [];

/**
 * 没查完提前结束的话，可以分段查
 */
(async function () {
  for (let i = 0; i < funds.length; i++) {
    const fund = funds[i];
    await request({
      method: 'get',
      url: `http://fund.eastmoney.com/f10/jjfl_${fund.code}.html`,
      encoding: 'utf-8',
      transform: function (body) {
        return cheerio.load(body);
      }
    }).then(($) => {
      const item = $('.txt_in .box').eq(6).find('table tbody tr').eq(1).find('td').eq(2).text();
      if (item && item.indexOf('%') !== -1) {
        const rate = parseFloat(item.split('%')[0]);
        if (rate <= baseRate) {
          console.log(JSON.stringify({
              code: fund.code,
              rate: rate
            }) + ',');
          resultList.push({
            code: fund.code,
            rate: rate
          });
        }
      }
    })
  }
})();
logData({
  list: resultList
});

// request({
//   method: 'get',
//   url: `http://fund.eastmoney.com/f10/jjfl_160222.html`,
//   encoding: 'utf-8',
//   transform: function (body) {
//     return cheerio.load(body);
//   }
// }).then(($) => {
//   const item = $('.txt_in .box').eq(6).find('table tbody tr').eq(1).find('td').eq(2).text();
//   if (item && item.indexOf('%') !== -1) {
//     const rate = parseFloat(item.split('%')[0]);
//     // 费率小于1的
//     console.log(rate)
//   }
// })
