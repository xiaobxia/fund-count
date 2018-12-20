const axios = require('axios')
const fs = require('fs-extra');
const codeMap = {
  'chuangye': {
    code: 'sz399006',
    name: '创业'
  },
  'gangtie': {
    code: 'sz399440',
    name: '钢铁'
  },
  'jungong': {
    code: 'sz399959',
    name: '军工'
  },
  'yiyao': {
    code: 'sh000037',
    name: '医药'
  },
  'meitan': {
    code: 'sz399998',
    name: '煤炭'
  },
  'youse': {
    code: 'sh000823',
    name: '有色'
  },
  'jisuanji': {
    code: 'sz399363',
    name: '计算机'
  },
  'baijiu': {
    code: 'sz399997',
    name: '白酒'
  },
  'xinxi': {
    code: 'sh000993',
    name: '信息'
  },
  'xiaofei': {
    code: 'sh000990',
    name: '消费'
  },
  'baoxian': {
    code: 'sz399809',
    name: '保险'
  },
  'wulin': {
    code: 'sh000016',
    name: '50'
  },
  'chuanmei': {
    code: 'sz399971',
    name: '传媒'
  },
  'dianzi': {
    code: 'sz399811',
    name: '电子'
  },
  'yiliao': {
    code: 'sz399989',
    name: '医疗'
  },
  'shengwu': {
    code: 'sz399441',
    name: '生物'
  },
  'sanbai': {
    code: 'sh000300',
    name: '300'
  },
  'wubai': {
    code: 'sh000905',
    name: '500'
  },
  'zhengquan': {
    code: 'sz399437',
    name: '证券'
  },
  'yinhang': {
    code: 'sz399986',
    name: '银行'
  },
  'dichan': {
    code: 'sz399393',
    name: '地产'
  },
  'jijian': {
    code: 'sz399995',
    name: '基建'
  },
  'huanbao': {
    code: 'sh000827',
    name: '环保'
  },
  'qiche': {
    code: 'sz399432',
    name: '汽车'
  }
}
const key = 'qiche'

function logData(fileData) {
  const fileName = `./mock/${key}.json`;
  fs.ensureFile(fileName).then(() => {
    fs.writeJson(fileName, fileData, {spaces: 2})
  });
}

axios.get(
  `http://47.98.140.76:3002/myService/webData/getWebStockdaybarAllZhongjin?code=${codeMap[key].code}&days=265`
).then((data) => {
  const list = data.data.data.list
  logData({
    list
  })
});
