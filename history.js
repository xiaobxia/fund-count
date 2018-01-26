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
  },
  {
    tiantian: -604,
    haomai: -991,
    xinlang: -1356,
    reality: -914
  },
  {
    tiantian: -415,
    haomai: -648,
    xinlang: -224,
    reality: -565
  },
  {
    tiantian: 2511,
    haomai: 2699,
    xinlang: 2893,
    reality: 2518
  },
  {
    "tiantian": 439,
    "haomai": 646,
    "xinlang": 631,
    reality: 716
  },
  {
    "tiantian": -146,
    "haomai": 97,
    "xinlang": 121,
    reality: 305
  },
  {
    "tiantian": -629,
    "haomai": -714,
    "xinlang": -392,
    reality: -890
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
    const standard = 30;
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
let max= 150;
let step = 5;
let ratioTiantian = max;
for (ratioTiantian; ratioTiantian > 0; ratioTiantian -= step) {
  let ratioHaomai = max;
  for (ratioHaomai; ratioHaomai > 0; ratioHaomai -= step) {
    let ratioXinlang = max;
    for(ratioXinlang; ratioXinlang > 0; ratioXinlang -= step) {
      let temp = ratioHaomai + ratioTiantian + ratioXinlang;
      if(0 < temp && temp < max) {
        getRatio(history, [ratioTiantian / 100, ratioHaomai / 100, ratioXinlang / 100])
      }
    }
  }
}
let rule = [0, 0, 0];
let len = 0;
let resultRatioMapFake = {};
for (let key in resultRatioMap) {
  if (resultRatioMap[key].times > 2) {
    len++;
    resultRatioMapFake[key] = resultRatioMap[key];
    rule[0] += resultRatioMap[key].list[0];
    rule[1] += resultRatioMap[key].list[1];
    rule[2] += resultRatioMap[key].list[2];
  }
}
rule = [rule[0] / len, rule[1] / len, rule[2] / len];
logData({
  resultRatioMapFake,
  rule
});

function logData(fileData) {
  const fileName = './mock/resultRatio.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}
