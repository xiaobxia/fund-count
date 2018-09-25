/**
 * Created by xiaobxia on 2018/3/4.
 */
const fs = require('fs-extra');
const all = require('./rateFund');

const rate = 0.25;
/**
 * 找出低费率的基金
 */

let listU5 = [];
all.forEach(function (item) {
  if (item.rate <= rate) {
    console.log(JSON.stringify(item));
    listU5.push(
      item.code
    );
  }
});

function logData(fileData) {
  const fileName = './mock/lowerFund.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}
console.log(listU5.length);
logData({
  funds: listU5
});


