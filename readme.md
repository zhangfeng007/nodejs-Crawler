##初始化
合适目录下，新建文件夹nodejs-webcrawler 打开命令行终端，进入当前目录执行npm init，初始化package.json文件

##安装依赖
express用来搭建简单的服务器，superagent用来请求页面,cheerio形如jquery处理页面元素

npm install express -S
npm install superagent -S
npm install cheerio -S

##使用express启动服务器
在nodejs-webcrawler目录下新建index.js文件 index.js

```
const express = require('express');
const app = express();

let server = app.listen(3000, function() {
    let { adress, port } = server.address();
    console.log(`App is running at http://${adress}:${port}`); 
})

app.get('/', async (req, res, next) => {
    res.send('hello World!'); // 输出到浏览器
})
```

保存！

打开命令行终端，进入当前目录， node index.js

成功启动服务器

浏览器打开http://localhost:3000/ 成功输出到浏览器

访问页面数据
爬取百度新闻页面(http://news.baidu.com/)

```
const accessPage = (url, callback) => {
    // 访问页面
    const superagent = require('superagent');

    superagent.get(url).retry(3).end((err, res) => {
        if(err) {
            console.log(`访问页面失败${err}`);
        } else {
            callback && callback(res);
        }
    })

}

抓取数据
const getPageInfo = (res) => {
    // 抓取页面信息
    const cheerio = require('cheerio');
    let hostNews = [];
    // 使用cheerio模块的load()方法，将htmldocument作为参数传入函数，就可以使用类似Jquery的$(selector)的方式获取页面元素
    let $ = cheerio.load(res.text);

    $('div#pane-news ul li a').each((idx, ele) => {
        let news = {
            title: $(ele).text(),
            href: $(ele).attr('href'), 
        };
        hostNews.push(news);
    })
    
    return hostNews;
}
```

保存数据到EXCEl
保存数据到excel

```
const saveToExcel = (ws_data, fileName) => {
    const XLSX = require('xlsx');
    // 保存到excel
    const ws = XLSX.utils.aoa_to_sheet(ws_data);  // sheet data
    let wb = XLSX.utils.book_new();  // 空workbook
    XLSX.utils.book_append_sheet(wb, ws, 'sheet1');  // 将sheet写入workbook
    XLSX.writeFile(wb, fileName);
}
```

保存到excel的数据需要特定的格式，接下来格式化数据

```
// 原始json数据
const origin_data = [
{
   'name' :  'xqq',
   'age':  '20',
},
{
   'name' :  'ht',
   'age':  '21',
},
];
// 保存到excele需要的数据
const ws_data = [
['name','age'],
['xqq', '20'],
['ht', '22'],
];

// 数据格式化的转换函数
const formatData = (arr) => {
    if(arr.length === 0) {
        return [];
    } 
    let sheetData = [];
    let fields = [];
    Object.keys(arr[0]).forEach(field => {
        fields.push(field);
    })
    arr.forEach(itm => {
        let ele = [];
        fields.forEach(field => {
            ele.push(itm[field]);
        })
        sheetData.push(ele);
    })
    sheetData.unshift(fields);   // 表头放在数组第一位
    return sheetData;
}

声明多个module
将可公用函数放到统一的地方，声明多个module util.js

const accessPage = (url, callback) => {
    // 访问页面
    const superagent = require('superagent');

    superagent.get(url).retry(3).end((err, res) => {
        if(err) {
            console.log(`访问页面失败${err}`);
        } else {
            callback && callback(res);
        }
    })

}

const formatData = (arr) => {
    if(arr.length === 0) {
        return [];
    } 
    let sheetData = [];
    let fields = [];
    Object.keys(arr[0]).forEach(field => {
        fields.push(field);
    })
    arr.forEach(itm => {
        let ele = [];
        fields.forEach(field => {
            ele.push(itm[field]);
        })
        sheetData.push(ele);
    })
    sheetData.unshift(fields);
    return sheetData;
}

const saveToExcel = (ws_data, fileName) => {
    const XLSX = require('xlsx');
    // 保存到excel
    const ws = XLSX.utils.aoa_to_sheet(ws_data);  // sheet data
    let wb = XLSX.utils.book_new();  // 空workbook
    XLSX.utils.book_append_sheet(wb, ws, 'sheet1');  // 将sheet写入workbook
    XLSX.writeFile(wb, fileName);
}
module.exports = {
    accessPage,
    formatData,
    saveToExcel,
}

```

主文件index.js
```
const express = require('express');
const app = express();
const util = require('./util.js');

let server = app.listen(3000, function() {
    let { adress, port } = server.address();
    console.log(`App is running at http://${adress}:${port}`); 
})

app.get('/', async (req, res, next) => {
    const handleSuccess = (resdom) => {
        let hostNews = getPageInfo(resdom);
        if (hostNews && hostNews.length > 0 ){
            util.saveToExcel(util.formatData(hostNews), 'out.xlsx');
        }
        res.send(hostNews);  // 输出到浏览器中
    }
    util.accessPage('http://news.baidu.com/', handleSuccess);

})

const getPageInfo = (res) => {
    // 抓取页面信息
    const cheerio = require('cheerio');
    let hostNews = [];
    // 使用cheerio模块的load()方法，将htmldocument作为参数传入函数，就可以使用类似Jquery的$(selector)的方式获取页面元素
    let $ = cheerio.load(res.text);

    $('div#pane-news ul li a').each((idx, ele) => {
        let news = {
            title: $(ele).text(),
            href: $(ele).attr('href'), 
        };
        hostNews.push(news);
    })
    
    return hostNews;
}
```