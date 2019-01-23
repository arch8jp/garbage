var client = require('cheerio-httpcli');
 
// Google grocodingで「東京」について検索する。
var word = '東京';
 
client.fetch('http://www.53cal.jp/areacalendar/?city=1130116&area=1130116101', { q: word }, function (err, $, res, body) {

  //なんのゴミの日か取得
  var theday = $('div[id=cal_bg] .theday').text().split("\n");
  theday.shift();
  //ゴミの日を取得
  var img_name =$('div[id=cal_bg]  .theday img').url(); 
  console.log(theday);
  console.log(img_name);


});
