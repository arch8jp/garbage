const client = require('cheerio-httpcli');
const http = require('http');
const ejs = require('ejs');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', "utf8");
const index_area_page = fs.readFileSync("index_area.ejs", "utf8");

var server = http.createServer(getFormClient);
server.listen(3000);
console.log('Server Start!');

/////////////////////////////////////////////////ここまでがメインプログラム
function getFormClient(request, response) {
  var url_parts = url.parse(request.url, true);
  switch (url_parts.pathname) {
    case "/":
      var content = ejs.render(index_page);
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(content);
      response.end();
      break;

    case "/index_area":
      response_index_area(request, response);
      break;

    default:
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.end();
  }
}

function response_index_area(request, response) {
  if (request.method == "POST") {
    var body = "";
    request.on("data", (data) => {
      body += data;
    });

    request.on("end", (end) => {
      city_data = qs.parse(body);
      getcity(request, response);
    });
  } else {
    write_index_area(request, response);
  }

}

//入力されたものをいったん保存。
var city_data = { msg: "no data" };


//選択された市・区　からさらに詳しいゴミ収集エリアを取得
function getcity(request, response) {

  client.fetch("http://www.53cal.jp/area/?a_code=" + city_data.msg, function (err, $, res, body) {
    var area_count = 0;
    var data_area  = {};
    var data = $('div [id=list_area] li a');


    for (var key in data) {
      if (key == "options") {
        break;
      }
      area_count += 1;
      data_area[data[key]["attribs"]["href"].split("=")[2]] = data[key]["children"]["0"]["data"];
    }

    console.log(area_count + "個のエリアがあるよ！");
    console.log(data_area);
    write_index_area(request, response,data_area);
  });
  
  
}

function write_index_area(request,response,data_area){
  
  var content = ejs.render(index_area_page,{
    
    data : data_area,
    title : "other",
  });
  response.writeHead(200,{"Content-Type":"text/html"});
  response.write(content);
  response.end();
}


// function getDay(request, response,city) {
//   client.fetch('http://www.53cal.jp/areacalendar/?city=1130116&area=1130116101', function (err, $, res, body) {

//     //なんのゴミの日か取得
//     var theday = $('div[id=cal_bg] .theday').text().split("\n");
//     theday.shift();
//     //ゴミの日を取得
//     var img_name = $('div[id=cal_bg]  .theday img').url();
//     console.log(theday);
//     console.log(img_name);

//   });
// }









