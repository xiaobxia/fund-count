/**
 * Created by xiaobxia on 2018/1/15.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const myFund = [
  {
    code: '167301',
    name: '方正富邦保险主题指数分级',
    price: 6000
  },
  {
    code: '001600',
    name: '天弘高端装备制造指数',
    price: 3929
  }
];
let requestList = [];
myFund.forEach(function (item) {
  /**
   * 天天基金
   */
  requestList.push(request({
    method: 'get',
    url: `http://fund.eastmoney.com/${item.code}.html?spm=search`,
    encoding: 'utf-8',
    transform: function (body) {
      return cheerio.load(body);
    }
  }).then(($) => {
    item.preValue1 = $('#gz_gszzl').text();
  }).catch(function (err) {
    console.log(err)
  }));
});

Promise.all(requestList).then(() => {
  logData({myFund});
});

function logData(fileData) {
  const fileName = './mock/last.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}
