const fs = require('fs-extra');
const axios = require('axios');
const indexList = require('./indexList')
let list = indexList.list

function logData(file, fileData) {
  const fileName = `./mock/${file}.json`;
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}

let index = 0
let timer = setInterval(() => {
  if (index < list.length) {
    axios.get(`http://47.98.140.76:3020/fundServer/webData/getStockAllDongfang?code=${list[index].code}&days=200`).then((res) => {
      logData(list[index].key, res.data.data)
      console.log('ok')
      index++
      console.log(index)
    }).catch(() => {
      clearInterval(timer)
    })
  } else {
    clearInterval(timer)
  }
}, 1000 * 10)
