/**
 * Created by xiaobxia on 2018/3/4.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const Iconv = require('iconv-lite');

function logData(fileData) {
  const fileName = './mock/lookfor.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}


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
      funds.push({
        code: cols.eq(2).text(),
        name: cols.eq(3).find('a').eq(0).text(),
        valuation: parseFloat(cols.eq(4).text()),
        net_value: parseFloat(cols.eq(9).text())
      })
    }
  });

  let resultList = [];
  let opList = [];

  funds.forEach(function (fund) {
    opList.push(request({
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
        if (rate < 1) {
          console.log({
            code: fund.code,
            rate: rate
          },);
          resultList.push({
            code: fund.code,
            rate: rate
          });
        }
      }
    }))
  });
  Promise.all(opList).then(()=>{
    logData({
      list: resultList
    });
  });
}).catch(function (err) {
  console.log(err)
});
