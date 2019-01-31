const fs = require('fs-extra');
const indexList = require('./indexList')
let list = indexList.list

function logData(fileData) {
  const fileName = './mock/upDown.json';
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}
let all = {
}

list.map((item)=>{
  let list = fs.readJsonSync(`./mock/${item.key}.json`).list;
  all[item.key] = list
})

let upDown = []
for (let i=0;i<200;i++) {
  let up = 0
  let down = 0
  let date = ''
  for (let key in all) {
    if (!date) {
      date = all[key][i].date
    }
    let netChangeRatio = all[key][i].kline.netChangeRatio
    if (netChangeRatio > 0) {
      up++
    }
    if (netChangeRatio < 0) {
      down++
    }
  }
  upDown.push({
    date,
    up,
    down
  })
}

logData({
  list: upDown
})

