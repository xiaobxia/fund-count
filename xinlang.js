/**
 * Created by xiaobxia on 2018/1/26.
 */
const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs-extra');
// 新浪数据太不准
// request({
//   method: 'get',
//   url: `http://hq.sinajs.cn/list=fu_001703`,
//   encoding: 'utf-8'
// }).then((body) => {
//   let temp = body.split(',');
//   const gsz =  temp[2];
//   const gszzl = temp[temp.length - 2];
//   console.log({
//     gszzl,
//     gsz
//   })
// }).catch(function (err) {
//   console.log(err)
// });

