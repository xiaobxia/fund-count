/**
 * Created by xiaobxia on 2018/1/17.
 */
const fs = require('fs-extra');
const history = [
  {
    tiantian: 441,
    haomai: 582,
    xinlang: 947,
    reality: 800
  }
];

let resultRatioMap = {};
function getRatio(history, ratioList) {
  history.forEach(function (item, index) {
    let temp =
      ratioList[0] * (item.tiantian / Math.abs(item.tiantian)) * Math.pow(item.tiantian, 2)
      +
      ratioList[1] * (item.haomai / Math.abs(item.haomai)) * Math.pow(item.haomai, 2)
      +
      ratioList[2] * (item.xinlang / Math.abs(item.xinlang)) * Math.pow(item.xinlang, 2);
    const averageCount = parseInt(Math.sqrt(Math.abs(temp))) * (temp / Math.abs(temp));
    const offset = averageCount - item.reality;
    const standard = 10;
    if (-standard < offset && offset < standard) {
      if (resultRatioMap[ratioList.join(',')]) {
        resultRatioMap[ratioList.join(',')].times++;
      } else {
        resultRatioMap[ratioList.join(',')] = {
          list: ratioList,
          times: 1
        };
      }
    }
  });
}

let ratioTiantian = 10;
for (ratioTiantian; ratioTiantian > 0; ratioTiantian -= 1) {
  let ratioHaomai = 10;
  for (ratioHaomai; ratioHaomai > 0; ratioHaomai -= 1) {
    let temp = ratioHaomai + ratioTiantian;
    // 不能为0或1
    if (0 < temp && temp < 10) {
      let ratioXinlang = 10 - temp;
      getRatio(history, [ratioTiantian / 10, ratioHaomai / 10, ratioXinlang / 10])
    }
  }
}
let max = 0;
let rule = [];
for (let key in resultRatioMap) {
  if (resultRatioMap[key].times > max) {
    max = resultRatioMap[key].times;
    rule = resultRatioMap[key].list;
  }
}
logData({
  resultRatioMap,
  rule
});

function logData(fileData) {
  const fileName = './mock/resultRatio.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}

