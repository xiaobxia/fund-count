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

let resultRatioList = [];
function getRatio(history, ratioList) {
  let ifError = false;
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
    if (-standard < offset && offset < standard && ifError === false) {
      resultRatioList.push(ratioList);
    } else {
      ifError = true;
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

logData({
  resultRatioList
});

function logData(fileData) {
  const fileName = './mock/resultRatio.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}

