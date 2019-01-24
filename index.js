const client = require('cheerio-httpcli');
const http = require('http');
const ejs = require('ejs');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', "utf8");
const index_area_page = fs.readFileSync("index_area.ejs", "utf8");
 const result_page = fs.readFileSync("./result.ejs", "utf8");

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

    case "/result":
      response_result(request, response);
      break;

    default:
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.end("no data");
  }
}

function response_index_area(request, response) {
  if (request.method == "POST") {

    var body = "";
    request.on("data", (data) => {
      body += data;
    });

    request.on("end", (end) => {
      var city_data = qs.parse(body);
      console.log(city_data);
      getcity(request, response, city_data);
    });

  } else {

    write_index_area(request, response,city_data);

  }
}



//選択された市・区　からさらに詳しいゴミ収集エリアを取得 
function getcity(request, response,city_data) {

  client.fetch( "http://www.53cal.jp/area/?a_code=" + city_data.msg.split(",")[0], function (err, $, res, body) {
    var area_count = 0;
    var data_area = {};

    var data = $('div [id=list_area] li a');

    for (var key in data) {
      if (key == "options") {
        break;
      }
      area_count += 1;
      //jqueryのデータ階層どうりに要素を選択
      data_area[data[key]["attribs"]["href"].split("=")[2]] = data[key]["children"]["0"]["data"];
    }

    console.log(area_count + "個のエリアがあるよ！");
 
    write_index_area(request, response, data_area,city_data);
  });


}

function write_index_area(request, response, data_area, city_data) {

  var content = ejs.render(index_area_page, {
    city :city_data.msg.split(",")[1],
    data: data_area,
    city_hidden:city_data.msg.split(",")[0],
  });
  response.writeHead(200, { "Content-Type": "text/html" });
  response.write(content);
  response.end();
}

function response_result(request, response) {
  if (request.method == "POST") {
    var body = "";
    request.on("data", (data) => {
      body += data;
    });

    request.on("end", (end) => {
      city_data = qs.parse(body);

      getDay(request, response,city_data);
    });
  } else {
    write_index_area(request, response);
  }
}


function getDay(request, response,city_data) {
  client.fetch('http://www.53cal.jp/areacalendar/?city=' +  city_data.info + '&area='+ city_data.msg.split(",")[0], function (err, $, res, body) {

    var area_count = 0;
    var data_area = {};

    //なんのゴミの日か取得
    var garbage = $('div[id=cal_bg] .theday').text().split("\n");
    garbage.shift();
 
    //ゴミの日を取得
    var img_name = $('div[id=cal_bg]  .theday img');
    for (var key in img_name) {
      if (key == "options") {
        break;
      }
      //jqueryのデータ階層どうりに要素を選択
      data_area[area_count] = img_name[key]["attribs"]["src"].split("/")[2].split(".")[0];
      area_count += 1;
    }

    console.log(area_count + "個あるよ！");

    var content = ejs.render(result_page,{
      title:"result",
      data:data_area,
      garbage:garbage,

    });
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(content);
    response.end();

  });
}









