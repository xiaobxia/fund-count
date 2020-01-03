const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const Iconv = require('iconv-lite');

const keyWord = encodeURI('上证50')

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
    if (item.NAME.indexOf('B') === -1) {
      doList.push(queryBuySellRate(item.CODE, item.NAME))
    }
  })
  Promise.all(doList).then(()=>{
    let op = []
    list.forEach((item)=>{
      op.push(queryChange(item))
    })
    return Promise.all(op)
  }).then(()=>{
    list.sort((a, b)=>{
      return a.cost - b.cost
    })
    let newList = []
    for (let i=0;i<list.length;i++) {
      let item = list[i]
      if (item.sellRateOne === 1.5) {
        newList.push(item)
      }
    }
    logData({
      list: newList
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
    $('.txt_in .box').each(function () {
      const tableName = $(this).find('h4 .left').text()
      if (tableName.indexOf('赎回费率') !== -1) {
        const sellRateOneText = $(this).find('table tbody tr').eq(0).find('td').eq(2).text();
        if (sellRateOneText && sellRateOneText.indexOf('%') !== -1) {
          sellRateOne = parseFloat(sellRateOneText.split('%')[0]);
        }
        const sellRateTwoText = $(this).find('table tbody tr').eq(1).find('td').eq(2).text();
        if (sellRateTwoText && sellRateTwoText.indexOf('%') !== -1) {
          sellRateTwo = parseFloat(sellRateTwoText.split('%')[0]);
        }
      } else if (tableName.indexOf('申购费率') !== -1) {
        const buyRateOneText = $(this).find('table tbody tr').eq(0).find('td').eq(2).find('strike').text();
        if (buyRateOneText && buyRateOneText.indexOf('%') !== -1) {
          buyRateOne = parseFloat(buyRateOneText.split('%')[0]) /10;
        }
      }
    })
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

function queryChange(item) {
  console.log(1)
  return request({
    method: 'get',
    url: `http://fund.eastmoney.com/f10/FundArchivesDatas.aspx?type=jdzf&code=${item.code}&rt=0.1609120935955488`,
    encoding: 'utf-8',
    headers: {
      Referer: `http://fund.eastmoney.com/f10/jdzf_${item.code}.html`
    },
    transform: function (body) {
      console.log(2)
      let str = body.slice(body.indexOf('"') + 1, body.lastIndexOf('"'))
      return cheerio.load(str);
    }
  }).then(($) => {
    item.month1 = $('.jdzfnew').find('ul').eq(3).find('li').eq(1).text()
    item.month3 = $('.jdzfnew').find('ul').eq(4).find('li').eq(1).text()
    item.month6 = $('.jdzfnew').find('ul').eq(5).find('li').eq(1).text()
    item.month12 = $('.jdzfnew').find('ul').eq(6).find('li').eq(1).text()
  })
}
