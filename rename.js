/**
 * Created by xiaobxia on 2018/1/26.
 */
const myFund = require('./myFund');
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');

let requestList = [];
myFund.forEach(function (item, index) {
  setTimeout(function () {
    // 天天
    requestList.push(request({
      method: 'get',
      url: `http://fundgz.1234567.com.cn/js/${item.code}.js?rt=1516930610497`,
      encoding: 'utf-8'
    }).then((body) => {
      const jsonData = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
      let data = JSON.parse(jsonData);
      item.name = data.name;
      rename();
    }).catch(function (err) {
      console.log(err)
    }));
  }, 1000 / 2 * index);
});

function rename() {
  if (requestList.length === myFund.length) {
    Promise.all(requestList).then(() => {
      logData({
        myFund
      });
    });
  }
}

function logData(fileData) {
  const fileName = './mock/rename.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}
