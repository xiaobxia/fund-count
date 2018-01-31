/**
 * Created by xiaobxia on 2018/1/26.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');

// request({
//   method: 'get',
//   url: `https://www.howbuy.com/fund/ajax/gmfund/valuation/valuationnav.htm?jjdm=001703`,
//   encoding: 'utf-8',
//   transform: function (body) {
//     return cheerio.load(body);
//   }
// }).then(($) => {
//   // 预估涨跌幅
//   let gszzl = $('li span').eq(2).text();
//   //预估净值
//   const gsz = $('li span').eq(0).text();
//   gszzl = gszzl.slice(0, gszzl.indexOf('%'));
//   console.log({
//     gszzl,
//     gsz
//   })
// }).catch(function (err) {
//   console.log(err)
// });
request({
  method: 'get',
  url: `https://www.howbuy.com/fund/valuation/index.htm`,
  transform: function (body) {
    return cheerio.load(body);
  }
}).then(($) => {
  // 预估涨跌幅
  const items = $('#nTab2_Con1 tbody tr');
  let funds = [];
  items.each(function () {
    const cols = $(this).find('td');
    // 是可购的
    funds.push({
      code: cols.eq(2).text(),
      valuation: parseFloat(cols.eq(4).text())
    })
  });

  const items2 = $('#nTab2_Con1 textarea');
  items2.each(function () {
    const $2 = cheerio.load($(this).text().trim());
    console.log($(this).text().trim())
    const items3 = $2('tr');
    // 是可购的
    items3.each(function () {
      const cols = $(this).find('td');
      // 是可购的
      funds.push({
        code: cols.eq(2).text(),
        valuation: parseFloat(cols.eq(4).text())
      })
    });
  });
  console.log(funds.length);
  logData({
    funds
  })
}).catch(function (err) {
  console.log(err)
});

function logData(fileData) {
  const fileName = './mock/funds.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}
