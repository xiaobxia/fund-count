/**
 * Created by xiaobxia on 2018/1/26.
 */
const request = require('request-promise');
const cheerio = require('cheerio');

request({
  method: 'get',
  url: `https://www.howbuy.com/fund/ajax/gmfund/valuation/valuationnav.htm?jjdm=001703`,
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
  console.log({
    gszzl,
    gsz
  })
}).catch(function (err) {
  console.log(err)
});
