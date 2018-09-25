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
  url: `http://fund.eastmoney.com/GP_fundguzhi3.html`,
  encoding: null,
  transform: function (body) {
    return cheerio.load(Iconv.decode(body, 'gb2312').toString());
  }
}).then(($) => {
  // 预估涨跌幅
  const items = $('#oTable tbody tr');
  let funds = [];
  items.each(function () {
    const cols = $(this).find('td');
    // 是可购的
    if (cols.eq(-1).hasClass('bi') && cols.eq(4).text() !== '---' && cols.eq(9).text() !== '---') {
      const name = cols.eq(3).find('a').eq(0).text();
      //不是金鹰的
      if (name.indexOf('金鹰') === -1) {
        funds.push({
          code: cols.eq(2).text(),
          name: cols.eq(3).find('a').eq(0).text(),
          valuation: parseFloat(cols.eq(4).text()),
          net_value: parseFloat(cols.eq(9).text())
        })
      }
    }
  });
  logData({
    list: funds
  });
}).catch(function (err) {
  console.log(err)
});
