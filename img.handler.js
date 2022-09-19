const superagent=require('superagent');
const cheerio=require('cheerio'); 
const path=require('path');
const fs=require('fs');
const cliProgress=require('cli-progress');
const bar=new cliProgress.SingleBar(
    {
    clearOnComplete:true,
    },cliProgress.Presets.shades_classic
);


let total=0;
let finished=0;

// const word='柯基';
// 由于防反扒 需要添加header 
const header={
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
'Accept-Encoding':' gzip, deflate, br',
Accept2: 'text/plain, */*; q=0.01',
'Accept-Language':' zh-CN,zh;q=0.9',
'Cache-Control':' max-age=0',
'Connection':' keep-alive',
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"'
};

// 获取图片url和title方法相同故整合为统一方法调用 
function getvalueListByReg (str,key){
  const reg= new RegExp(`"${key}":"(.*?)"`,'g');
  const matchResult=str.match(reg);
  
  const resultList= matchResult.map(item=>{
    const result=item.match(/:"(.*?)"/g);
    return RegExp.$1;
  });
  return resultList;
}

// 创建图片 
function mkImageDir(pathname){
  return new Promise((reslove,reject)=>{
      const fullpath=path.resolve(__dirname,pathname);
      if(fs.existsSync(fullpath)){
        // console.log(`此目录${pathname}已经存在,跳过此步骤`);
        // return;
        removeDir(pathname);
      }
      fs.mkdirSync(fullpath);
      console.log(`目录创建成功！目录为:${pathname}`);
      return reslove();
  })
}

// 下载图片到本地 
function downloadImage(url,name,index){
  return new Promise((reslove,reject)=>{
      const fullpath=path.join(__dirname,'images',`${index+1}.${name.replace('?','')}.png`);
      if(fs.existsSync(fullpath)){
        return reject(`已存在， ${fullpath}`)
      }
      superagent.get(url).end((err,res)=>{  
        // 图片内容为res.body
        if(err){
          return reject(`获取链接失败,错误内容为:${err}`)
        }

        if(JSON.stringify(res.body)==='{}'){
          return  reslove(`第${index+1}张图片为空`)
        }

        fs.writeFile(fullpath,res.body,'binary',err=>{
          if(err){
            return reslove(`第${index+1}张图片下载失败，出错内容为:${err}`)
          }
          return reslove(`第${index+1}张图片下载成功，地址为：${url}`);
        })
      })
  })
}

// 删除图片
function removeDir(pathname){
  const fullpath=path.resolve(__dirname,pathname);
  console.log(`${pathname}目录已经存在，准备执行删除!`);
  fs.rmdirSync(fullpath,{
    force:true,
    recursive:true
  });

  console.log(`目录${pathname}已经删除!`);
   // const procress=require('child_procress');
  // procress.execSync(`rm-rf${fullpath}`)
}


// 将其封装为接口 
function request(url,acceptKey = 'Accept'){
  return new Promise((reslove,reject)=>{
      superagent.get(url)
     .set('Accept',header[acceptKey])
     .set('Accept-Encoding',header['Accept-Encoding'])
     .set('Accept-Language',header['Accept-Language'])
     .set('Cache-Control',header['Cache-Control'])
     .set('Connection',header['Connection'])
     .set('User-Agent',header['User-Agent'])
     .set('sec-ch-ua',header['sec-ch-ua'])
     .end(async (err,res)=>{
       if(err){
        reject('访问错误，原因是:',err);
         return;
       }
       reslove(res);
     })
  })
}

  async function getImageByPage(start,total,word){
    let allImages=[];
    while(start<total){
      const size=Math.min(60,total-start);
      const res = await request(  
    `https://image.baidu.com/search/acjson?tn=resultjson_com&word=${encodeURIComponent(
    word
    )}&queryWord=${encodeURIComponent(
    word
    )}&ie=utf-8&oe=utf-8&pn=${start}&rm=${size}&${Date.now()}=`,
    'Accept2'
    );
    allImages = allImages.concat(JSON.parse(res.text).data);
    start += size;
    }
  return allImages;
}

function runImg(keyword,counts){
  // request(`http://image.baidu.com/search/index?tn=baiduimage&ie=utf-8&word=${encodeURIComponent(
  // keyword
  // )}`
    request(`http://image.baidu.com/search/index?tn=baiduimage&ct=201326592&lm=-1&cl=2&ie=gb18030&word=${encodeURIComponent(
  keyword
  )}`
  ).then(async res=>{
    const htmlTest=res.text;
    const imageUrlList=getvalueListByReg(htmlTest,'objURL');
    const titleList=getvalueListByReg(htmlTest,'fromPageTitle')
    // .map(item=>{
    //   item.replace('<strong>','').replace('<\\/strong>','');
    // });

      let allImageUrls=imageUrlList.map((imageUrl,index)=>{
        return {
          imageUrl,
          title:titleList[index]
        }
      })

      const firstPageCount=allImageUrls.length;

          if(counts>firstPageCount){
        const restImgUrls=await getImageByPage(firstPageCount,counts,keyword);
        const formatImgUrls=restImgUrls.filter(item=>item.middleURL).map(item=>{
          return {
            imageUrl:item.middleURL,
            title: item.fromPageTitle.replace('<strong>', '').replace('</strong>', ''),
          }
        });
        allImageUrls=allImageUrls.concat(formatImgUrls);
       }
  


    total=allImageUrls.length;
    try {
      await mkImageDir('images');
      bar.start(total,0);
      allImageUrls.forEach((item,index)=>{
        downloadImage(item.imageUrl,item.title,index).then(()=>{
          finished++;
          bar.update(finished);
        }).then(()=>{
          if(finished===total){
            bar.stop();
            console.log(`恭喜您,图片下载成功!`);
          }
        })
      })
    } catch (error) {
      console.log(error);
    }
  })
}


module.exports ={
  runImg
}