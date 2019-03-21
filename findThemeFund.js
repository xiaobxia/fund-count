const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const Iconv = require('iconv-lite');

const keyWord = encodeURI('传媒')

/**
 * 得到基金
 */

const list = []

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
  url: `http://fundsuggest.eastmoney.com/FundSearch/api/FundSearchPageAPI.ashx?callback=jQuery183016214041987784644_1553141735758&m=1&key=${keyWord}&pageindex=0&pagesize=44&_=1553141961270`,
  encoding: 'utf-8',
}).then((body) => {
  let str = body.slice(body.indexOf('(') + 1, body.lastIndexOf(')'))
  const data = JSON.parse(str).Datas
  let doList = []
  data.map((item)=>{
    doList.push(queryBuySellRate(item.CODE, item.NAME))
  })
  Promise.all(doList).then(()=>{
    list.sort((a, b)=>{
      return a.cost - b.cost
    })
    logData({
      list
    })
  })
}).catch(function (err) {
  console.log(err)
});

function queryBuySellRate(code, name) {
  return request({
    method: 'get',
    url: `http://fund.eastmoney.com/f10/jjfl_${code}.html`,
    encoding: 'utf-8',
    transform: function (body) {
      return cheerio.load(body);
    }
  }).then(($) => {
    let buyRateOne = 0
    let sellRateOne = 0
    let sellRateTwo = 0
    const sellRateOneText = $('.txt_in .box').eq(6).find('table tbody tr').eq(0).find('td').eq(2).text();
    if (sellRateOneText && sellRateOneText.indexOf('%') !== -1) {
      sellRateOne = parseFloat(sellRateOneText.split('%')[0]);
    }
    const sellRateTwoText = $('.txt_in .box').eq(6).find('table tbody tr').eq(1).find('td').eq(2).text();
    if (sellRateTwoText && sellRateTwoText.indexOf('%') !== -1) {
      sellRateTwo = parseFloat(sellRateTwoText.split('%')[0]);
    }
    const buyRateOneText = $('.txt_in .box').eq(5).find('table tbody tr').eq(0).find('td').eq(2).find('strike').text();
    if (buyRateOneText && buyRateOneText.indexOf('%') !== -1) {
      buyRateOne = parseFloat(buyRateOneText.split('%')[0]) /10;
    }
    return list.push({
      code,
      name,
      buyRateOne,
      sellRateOne,
      sellRateTwo,
      cost: buyRateOne + sellRateTwo
    })
  })
}
