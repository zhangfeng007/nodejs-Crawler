const express = require('express');
const app = express();
const util = require('./util.js');
const mongoose = require('mongoose')
const conf = require('./mongoConfig')

const DB_URL = `mongodb://${conf.username}:${conf.pwd}@${conf.address}/${conf.db}`; // 账号登陆
console.log(DB_URL);


mongoose.connect(DB_URL);
mongoose.connection.on('connected', () => {
	console.log('mongodb connect success')
	
})
//连接失败
mongoose.connection.on('error',(err)=>{
    console.log('connect error,'+err);
})
//连接断开
mongoose.connection.on('disconnected',()=>{
    console.log('connect disconnected');
})

//创建模型
const Schema = mongoose.Schema;
const User = mongoose.model('news', new Schema({
	title: {type: String, require: true},
	href: {type: String, require: true}
}, {versionKey: false}))
// {versionKey: false} 该字段是为了去除插入数据库是带的版本号 "__V" 字段


let server = app.listen(3000, function() {
	let { adress, port } = server.address();
	console.log(`App is running at http://${adress}:${port}`); 
})

app.get('/', async (req, res, next) => {
	const handleSuccess = (resdom) => {
		let hostNews = getPageInfo(resdom);
		if (hostNews && hostNews.length > 0 ){

			//讲结果集插入数据
			User.insertMany(hostNews,(err,doc)=>{
				if (!err) {
					console.log('数据插入成功:',doc)
				} else {
					console.log("数据插入失败:",err)
				}
			});

			
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
		
		//一条一条插入数据
		// User.create(news, (err, doc) => {
		// 	if (!err) {
		// 		console.log('数据插入成功:',doc)
		// 	} else {
		// 		console.log("数据插入失败:",err)
		// 	}
		// })

		// console.log(news);
		hostNews.push(news);
	})
	
	return hostNews;
}
