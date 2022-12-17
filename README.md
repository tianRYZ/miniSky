
# <font color="pink">miniSky</font>

###   	<font color="green"> 个人diy的cli-自定义微爬</font>

###  1.什么是CLI  

command Line interface命令行交互界面
快速生成应用模板，，创建一个module模块文件

- 为了快速的从url中获取到想要得到的图片资料 可以使用该cli去快速爬取  

###  2.如何实现CLI

自定义开发所需的库为：

- commander (提供命令行接入方案)
- inquirer(提供交互的GUI)

### 3.初始化项目

#### 3.1项目依赖 

- npm i -S  superagent cheerio
- npm i cli-progress
- "inquirer":"^7.0.0", (windows该版本较友好)
- "commander":"^9.3.0"

#### 3.2初始化项目 

1.npm init 
2.安装superagent cheerio依赖
3.可根据自我习惯修改自定义入口设置 

```js 
npm  init  
// 安装superagent cheerio依赖
npm i -S  superagent cheerio
// 修改入口设置  
"start":"node index.js"
//润起来  
npm run start
```

#### 3.3测试使用

> ##### 1.测试获取url，方法是否生效
>
> ```js
> const superagent=require('superagent');
> const cherrio=require('cherrio');
> superagnet.get('http://www.baidu.com').end((err,res)=>{
> if(err){
> console.log('访问失败，错误为：',err);
> return;
> }
> console.log(res);
> })
> ```
>
> 2. ##### 解析获取html
>
>    ```js
>    const superagent=require('superagent');
>    const cherrio=require('cherrio');
>    superagnet.get('http://www.baidu.com').end((err,res)=>{
>        if(err){
>        console.log('访问失败，错误为：',err);
>        return;
>        }
>        const htmlText=res.text;
>        const $=cherrio.load(htmlText);
>        $('meta').each((index,ele)=>{
>    	console.log(`${index}:${$(ele).attr('content')}`);
>        })
>      console.log(res);
>    })
>    ```
>
>    ##### 3.解析获取html，抓取图片资料
>
>    获取有效的url 并提取出对应的objUrl,,使用正则表达式进行 objUrl的地址处理，
>
>    ```js
>    superagent.get(`http://image.baidu.com/search/index?tn=baiduimage&ct=201326592&lm=-1&cl=2&ie=gb18030&word=${encodeURIComponent(
>      word
>      )}`)
>    .end((err,res)=>{
>        if(err){
>    	console.log('访问错误，原因是：',err);
>            return;
>        }
>        const htmlText=res.text;
>        const $=cheerio.load(htmlText);
>        console.log(htmlText);
>    })
>    ```
>
>    此时出现了安全验证  ，也就是普通的防反扒  
>
>    一段时间内大量的访问图片资料 
>
>    没有携带header会被阻止，因此需要添加header 
>
>    ```js
>    const superagent = require('superagent');
>    const cheerio = require('cheerio');
>    const word = '柯基';
>    const header = {
>    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,applicati
>    'Accept-Encoding': 'gzip, deflate, br',
>    'Accept-Language': 'zh-CN,zh;q=0.9',
>    'Cache-Control': 'max-age=0',
>    Connection: 'keep-alive',
>    'User-Agent':
>    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
>    'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
>    };
>    superagent
>    .get(
>    `http://image.baidu.com/search/index?tn=baiduimage&ie=utf-8&word=${encodeURIComponent(
>    word
>    )}`
>    )
>    .set('Accept', header['Accept'])
>    .set('Accept-Encoding', header['Accept-Encoding'])
>    .set('Accept-Language', header['Accept-Language'])
>    .set('Cache-Control', header['Cache-Control'])
>    .set('Connection', header['Connection'])
>    .set('User-Agent', header['User-Agent'])
>    .end((err, res) => {
>    if (err) {
>    console.err('访问失败，原因: ', err);
>    return;
>    }
>    const htmlText = res.text;
>    const $ = cheerio.load(htmlText);
>    console.log(htmlText);
>    });
>    ```
>
>    ##### 4.获取图片链接列表
>
>    ```js
>    superagent
>    .get(
>    `http://image.baidu.com/search/index?tn=baiduimage&ie=utf-8&word=${encodeURIComponent(
>    word
>    )}`
>    )
>    .set('Accept', header['Accept'])
>    .set('Accept-Encoding', header['Accept-Encoding'])
>    .set('Accept-Language', header['Accept-Language'])
>    .set('Cache-Control', header['Cache-Control'])
>    .set('Connection', header['Connection'])
>    .set('User-Agent', header['User-Agent'])
>    .end((err, res) => {
>    if (err) {
>    console.err('访问失败，原因: ', err);
>    return;
>    }
>    const htmlText = res.text;
>    const imageMatches = htmlText.match(/"objURL":"(.*?)",/g);
>    // '"objURL":"https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg9.51tietu.net%2Fpic%2F2019-091304%2Fv451j2
>    const imageUrlList = imageMatches.map(item => {
>    const imageUrl = item.match(/:"(.*?)"/g);
>    return RegExp.$1;
>    });
>    console.log(imageUrlList);
>    });
>    ```
>
>    ##### 5.. 获取图片的标题 
>
>    根据页面source获取图片名称，为：fromPageTitle
>
>    ```js
>    superagent
>    .get(
>    `http://image.baidu.com/search/index?tn=baiduimage&ie=utf-8&word=${encodeURIComponent(
>    word
>    )}`
>    )
>    .set('Accept', header['Accept'])
>    .set('Accept-Encoding', header['Accept-Encoding'])
>    .set('Accept-Language', header['Accept-Language'])
>    .set('Cache-Control', header['Cache-Control'])
>    .set('Connection', header['Connection'])
>    .set('User-Agent', header['User-Agent'])
>    .end((err, res) => {
>    if (err) {
>    console.err('访问失败，原因: ', err);
>    return;
>    }
>    const htmlText = res.text;
>    const imageMatches = htmlText.match(/"objURL":"(.*?)",/g);
>    // '"objURL":"https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg9.51tietu.net%2Fpic%2F2019-091304%2Fv451j2
>    const imageUrlList = imageMatches.map(item => {
>    const imageUrl = item.match(/:"(.*?)"/g);
>    return RegExp.$1;
>    });
>    const titleMatches = htmlText.match(/"fromPageTitle":"(.*?)",/g);
>    const titleList = titleMatches.map(item => {
>    const title = item.match(/:"(.*?)"/g);
>    return RegExp.$1;
>    });
>    console.log(imageUrlList, titleList);
>    });
>    ```
>
>    对相同的方法进行封装 
>
>    ```js
>    function getValueListByReg(str, key) {
>    const reg = new RegExp(`"${key}":"(.*?)"`, 'g');
>    const matchResult = str.match(reg);
>    const resultList = matchResult.map(item => {
>    const result = item.match(/:"(.*?)"/g);
>    return RegExp.$1;
>    });
>    return resultList;
>    }
>    ```
>
>    ##### 6.创建目录&&&图片存储
>
>    ```js
>    function mkImageDir(pathname) {
>    const fullPath = path.resolve(__dirname, pathname);
>    if (fs.existsSync(fullPath)) {
>    console.log(`${pathname}已存在，跳过此步骤`);
>    return;
>    }
>    fs.mkdirSync(fullPath);
>    console.log(`目录创建成功！目录为：${pathname}`);
>    }
>    superagent
>    .get(
>    `http://image.baidu.com/search/index?tn=baiduimage&ie=utf-8&word=${encodeURIComponent(
>    word
>    )}`
>    )
>    .set('Accept', header['Accept'])
>    .set('Accept-Encoding', header['Accept-Encoding'])
>    .set('Accept-Language', header['Accept-Language'])
>    .set('Cache-Control', header['Cache-Control'])
>    .set('Connection', header['Connection'])
>    .set('User-Agent', header['User-Agent'])
>    .end((err, res) => {
>    if (err) {
>    console.err('访问失败，原因: ', err);
>    return;
>    }
>    const htmlText = res.text;
>    const imageUrlList = getValueListByReg(htmlText, 'objURL');
>    const titleList = getValueListByReg(htmlText, 'fromPageTitle').map(item =>
>    item.replace('<strong>', '').replace('<\\/strong>', '')
>    );
>    mkImageDir('images');
>    });
>    ```
>
>    ##### 7.图片资料的下载
>
>    ```js
>    function downloadImage(url, name, index) {
>    const fullPath = path.join(__dirname, 'images', `${index + 1}.${name.replace('?', '')}.png`);
>    if (fs.existsSync(fullPath)) {
>    console.log(`已存在，${fullPath}`);
>    return;
>    }
>    superagent.get(url).end((err, res) => {
>    if (err) {
>    console.log(err, `获取链接出错，内容为：${res}`);
>    return;
>    }
>    if (JSON.stringify(res.body) === '{}') {
>    console.log(`第${index + 1}图片内容为空`);
>    return;
>    }
>    fs.writeFile(fullPath, res.body, 'binary', err => {
>    if (err) {
>    console.log(`第${index + 1}张图片下载失败: ${err}`);
>    return;
>    }
>    console.log(`第${index + 1}张图片下载成功: ${url}`);
>    });
>    });
>    }
>    superagent
>    .get(
>    `http://image.baidu.com/search/index?tn=baiduimage&ie=utf-8&word=${encodeURIComponent(
>    word
>    )}`
>    )
>    .set('Accept', header['Accept'])
>    .set('Accept-Encoding', header['Accept-Encoding'])
>    .set('Accept-Language', header['Accept-Language'])
>    .set('Cache-Control', header['Cache-Control'])
>    .set('Connection', header['Connection'])
>    .set('User-Agent', header['User-Agent'])
>    .end(async (err, res) => {
>    if (err) {
>    console.err('访问失败，原因: ', err);
>    return;
>    }
>    const htmlText = res.text;
>    const imageUrlList = getValueListByReg(htmlText, 'objURL');
>    const titleList = getValueListByReg(htmlText, 'fromPageTitle').map(item =>
>    item.replace('<strong>', '').replace('<\\/strong>', '')
>    );
>    await mkImageDir('images');
>    imageUrlList.forEach((url, index) => {
>    downloadImage(url, titleList[index], index);
>    });
>    });
>    ```
>
>    ##### 8.优化进度条
>
>    安装依赖 创建文件、下载图片及转为promise，改为链式调用
>
>    ```js
>    const cliProgress = require('cli-progress');
>    const bar = new cliProgress.SingleBar(
>    {
>    clearOnComplete: false,
>    },
>    cliProgress.Presets.shades_classic
>    );
>    superagent
>    .get(
>    `http://image.baidu.com/search/index?tn=baiduimage&ie=utf-8&word=${encodeURIComponent(
>    word
>    )}`
>    )
>    .set('Accept', header['Accept'])
>    .set('Accept-Encoding', header['Accept-Encoding'])
>    .set('Accept-Language', header['Accept-Language'])
>    .set('Cache-Control', header['Cache-Control'])
>    .set('Connection', header['Connection'])
>    .set('User-Agent', header['User-Agent'])
>    .end(async (err, res) => {
>    if (err) {
>    console.err('访问失败，原因: ', err);
>    return;
>    }
>    const htmlText = res.text;
>    const imageUrlList = getValueListByReg(htmlText, 'objURL');
>    const titleList = getValueListByReg(htmlText, 'fromPageTitle').map(item =>
>    item.replace('<strong>', '').replace('<\\/strong>', '')
>    );
>    try {
>    await mkImageDir('images');
>    bar.start(imageUrlList.length, 0);
>    imageUrlList.forEach((url, index) => {
>    downloadImage(url, titleList[index], index)
>    .then(() => {
>    finished++;
>    bar.update(finished);
>    })
>    .then(() => {
>    if (finished === imageUrlList.length) {
>    bar.stop();
>    console.log('恭喜，图片下载完成！');
>    }
>    });
>    });
>    } catch (e) {
>    console.log(e);
>    }
>    });
>    ```
>
>    ##### 9.删除文件
>
>    ```js
>    // 创建图片 
>    function mkImageDir(pathname){
>      return new Promise((reslove,reject)=>{
>          const fullpath=path.resolve(__dirname,pathname);
>          if(fs.existsSync(fullpath)){
>            // console.log(`此目录${pathname}已经存在,跳过此步骤`);
>            // return;
>            removeDir(pathname);
>          }
>          fs.mkdirSync(fullpath);
>          console.log(`目录创建成功！目录为:${pathname}`);
>          return reslove();
>      })
>    }
>    
>    // 删除图片
>    function removeDir(pathname){
>      const fullpath=path.resolve(__dirname,pathname);
>      console.log(`${pathname}目录已经存在，准备执行删除!`);
>      fs.rmdirSync(fullpath,{
>        force:true,
>        recursive:true
>      });
>    
>      console.log(`目录${pathname}已经删除!`);
>       // const procress=require('child_procress');
>      // procress.execSync(`rm-rf${fullpath}`)
>    }
>    ```
>
>    ##### 10.cli封装 
>
>    ```js
>    #!/usr/bin/env node
>    
>    const inquirer=require('inquirer');
>    const commander=require('commander');
>    const {runImg} =require('./img.handler');
>    
>    const question=[
>      {
>        type:'checkbox',
>        name:'channels',
>        message:'请选择要搜索的渠道',
>        choices:[
>          {
>            name:'百度图片',
>            value:'images'
>          }
>        ]
>      },
>      {
>        type:'input',
>        name:'keyword',
>        message:'请输入想要搜索的关键词'
>      },
>    ];
>    ```
>
>    ##### 11.自定义图片资料张数设置
>
>    ```js
>    {
>        type:'number',
>        name:'counts',
>        message:'请输入要下载的图片张数(最少为30张)'
>    }
>    
>    inquirer.prompt(question).then(result=>{
>        const {channels,keyword,counts}=result;
>        for(let channel of channels){
>        switch(channel){
>          case  'images':
>          runImg(keyword,counts);
>          break;
>        }
>      } 
>    }).catch((err) => {
>      console.log(err);
>    });
>    ```
>
>    ****
>
>    
>
>    
