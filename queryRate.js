/**
 * Created by xiaobxia on 2018/5/31.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const Iconv = require('iconv-lite');

/**
 * 找出费率小于1的基金
 */

function logData(fileData) {
  const fileName = './mock/lowFund.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}

const funds = fs.readJsonSync('./mock/fund.json').list;

let resultList = [];

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
      const item = $('.txt_in .box').eq(6).find('table tbody tr').eq(0).find('td').eq(2).text();
      if (item && item.indexOf('%') !== -1) {
        const rate = parseFloat(item.split('%')[0]);
        // 费率小于1的
        if (rate < 1) {
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
