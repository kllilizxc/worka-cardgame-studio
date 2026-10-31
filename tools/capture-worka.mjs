// Visual acceptance runs against the same isolated desktop imported by verify-worka.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

export async function captureWorkbench({app,host,desktopId,notes,output,bindGame}){
  const moduleAt=file=>import(pathToFileURL(join(host,file)).href);
  const {WorkbenchHttp}=await moduleAt('src/http.ts');
  const {chromium}=createRequire(join(host,'package.json'))('playwright-core');
  const http=new WorkbenchHttp(app,process.env.WORKA_QA_WEB_ROOT||join(host,'dist/web'),randomBytes(32).toString('hex'));
  const themes=await Promise.all(['light','dark'].map(t=>readFile(join(host,'design/themes',t,'theme.json'),'utf8').then(JSON.parse)));
  http.themes=()=>({revision:'visual-qa',themes});
  const server=createServer((req,res)=>http.handle(req,res));
  await new Promise((done,reject)=>server.once('error',reject).listen(0,'127.0.0.1',done));
  let browser;
  try {
    const theme=process.env.WORKA_QA_THEME||'dark';
    const picture=process.env.WORKA_QA_PICTURE==='1';
    browser=await chromium.launch({headless:true,executablePath:process.env.WORKA_QA_CHROMIUM,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',...(picture?['--enable-blink-features=CanvasDrawElement']:[])]});
    const page=await browser.newPage({viewport:{width:1300,height:940},locale:'zh-CN',colorScheme:theme});
    const saved=new Set();
    let allPictures;
    const snapshotsReady=new Promise(done=>{allPictures=done;});
    const errors=[];page.on('pageerror',err=>errors.push(err.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text().slice(0,220));});
    page.on('response',r=>{
      const address=new URL(r.url());
      if(r.status()>=400)errors.push(r.status()+' '+address.pathname);
      if(r.ok()&&r.request().method()==='PUT'&&address.pathname.endsWith('/note-pictures')){
        saved.add(address.searchParams.get('noteId'));
        if(notes.every(note=>saved.has(note.key)))allPictures();
      }
    });
    await page.addInitScript(theme=>{if(parent===window)localStorage.setItem('worka:theme',theme);},theme);
    const url=new URL('/workbench/','http://127.0.0.1:'+server.address().port);
    url.searchParams.set('desktop',desktopId);
    if(picture)url.searchParams.set('canvas','picture');
    await page.goto(url.href,{waitUntil:'domcontentloaded'});
    try{
      await Promise.all(notes.map(async note=>{
        const urlPath='/'+note.key+'/view/index.html';
        const body=page.frameLocator('iframe[src*="'+urlPath+'"]').locator('body');
        await body.filter({hasText:/\S/}).waitFor({state:'attached',timeout:45000});
        const frame=page.frames().find(f=>f.url().includes(urlPath));
        assert.ok(frame,'便笺已导航到其实际发布包');
        await frame.waitForFunction(()=>document.body.innerText.trim().length>0||document.querySelector('main,article,picture,img'),null,{timeout:30000});
        await frame.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
      }));
      const frames=page.frames().filter(f=>f.url().includes('/view/index.html'));
      assert.equal(frames.length,notes.length);
      // A larger host mask cuts through the border the compact note paints at each corner.
      const surfaces=page.locator('.note-frontend-host[data-mode="compact"] .note-frontend-content:has(.runtime-note-frame[data-compact-surface="transparent"])');
      await surfaces.nth(notes.length-1).waitFor({state:'attached'});
      assert.ok(await surfaces.evaluateAll(items=>items.every(item=>getComputedStyle(item).borderRadius==='0px')),'each authored compact outline must remain intact');
      const panel=name=>{
        const record=notes.find(note=>note.value.name===name);
        assert.ok(record,name);
        return page.frameLocator('iframe[src*="/'+record.key+'/view/index.html"]');
      };
      if(picture){
        await page.locator('canvas.desktop-canvas').waitFor({state:'visible',timeout:12000});
        let timeout;
        try{await Promise.race([snapshotsReady,new Promise((_done,reject)=>{timeout=setTimeout(()=>reject(Error('Canvas 已保存 '+saved.size+' / '+notes.length+' 张快照')),30000);})]);}
        finally{clearTimeout(timeout);}
        await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
        await page.screenshot({path:output,timeout:90000});
        if(bindGame)await bindGame();
        console.log('Worka WebGL2 picture canvas · '+saved.size+' 张原生快照 · '+output);
        return;
      }
      // Return through Worka's toolbar so the same desktop and its note frames stay resident.
      const returnToDesk=async()=>{
        await page.getByRole('button',{name:'关闭详情',exact:true}).click();
        await page.locator('.note-frontend-host[data-mode="expanded"]').waitFor({state:'hidden'});
      };
      const hand=panel('卡牌与牌组'),map=panel('秘境地图'),story=panel('剧情知识库');
      await hand.locator('.cr-card').nth(5).waitFor({state:'visible'});
      await map.locator('.atlas-pin').nth(1).waitFor({state:'visible'});
      await story.locator('.cr-step').nth(2).waitFor({state:'visible'});
      await panel('试玩').getByRole('link',{name:'打开试玩'}).waitFor({state:'visible'});
      await panel('怪物').getByRole('button',{name:/青云山灵狐/}).waitFor({state:'visible'});
      await page.screenshot({path:output,timeout:90000});
      console.log('Worka screenshot '+output+' · '+frames.length+' compact iframe(s)');
      await hand.getByRole('button',{name:'青云剑',exact:true}).click();
      await hand.getByRole('heading',{name:'青云剑',exact:true}).waitFor({state:'visible'});
      await returnToDesk();
      const room=map.locator('.atlas-pin').first(),roomName=await room.locator('b').innerText();
      await room.click();await map.getByRole('heading',{name:roomName,exact:true}).waitFor({state:'visible'});
      await returnToDesk();
      const branch=story.locator('.cr-choices button').first(),branchName=await branch.locator('b').innerText();
      await branch.click();await story.locator('[aria-current=page]').filter({hasText:branchName}).first().waitFor({state:'visible'});
      await returnToDesk();
      const battle=panel('战斗关卡'),milestones=battle.locator('.atlas-timeline button');
      await battle.locator('.atlas-battle-title').waitFor({state:'visible'});
      if(await milestones.count()){
        await milestones.last().click();
        await battle.locator('li[aria-current=location]').waitFor({state:'visible'});
        await returnToDesk();
      }
      for (const [name,role,label,expect] of [['剧情知识库','button','剧情知识库','章节文档'],['试玩','link','打开试玩','在 Worka 对话中说']]){
        if(name==='试玩')await returnToDesk();
        const note=panel(name);
        await note.getByRole(role,{name:label,exact:true}).click({timeout:25000});
        await note.getByText(expect,{exact:name==='剧情知识库'}).first().waitFor({state:'visible',timeout:25000});
        console.log(name+' compact → expanded');
      }
      // Keep the existing note open, as on a second device, while inspecting its setup entry.
      const setupPage=await browser.newPage({viewport:{width:1300,height:940},locale:'zh-CN'});
      try{
        await setupPage.goto(url.href,{waitUntil:'domcontentloaded'});
        const preview=notes.find(n=>n.value.name==='试玩');
        const frame=setupPage.frameLocator('iframe[src*="/'+preview.key+'/view/index.html"]');
        await frame.getByRole('button',{name:'连接游戏',exact:true}).click();
        const setup=setupPage.locator('.note-setup');
        await setup.getByRole('heading',{name:'开始使用'}).waitFor({state:'visible'});
        await setup.locator('.note-setup-actions button').first().waitFor({state:'visible'});
        console.log('连接游戏 → Worka 原生设置');
      }finally{await setupPage.close();}
      if(bindGame){
        const commit=await bindGame(),play=panel('试玩');
        await play.getByText(/在 Worka 对话中说「绑定我的 CardGame 仓库」/).waitFor({state:'hidden',timeout:15000});
        await returnToDesk();
        await play.locator('.preview-caption').filter({hasText:commit.slice(0,7)}).waitFor({state:'visible'});
        console.log('已打开的试玩收到项目绑定，返回桌面后显示 '+commit.slice(0,7));
      }
    }catch(e){
      console.error('Worka browser diagnostics',errors.slice(-15),await Promise.all(page.frames().filter(f=>f.url().includes('/view/index.html')).map(async f=>[notes.find(n=>f.url().includes(n.key))?.value.name,await f.evaluate(()=>[document.readyState,document.body?.innerText.slice(0,95),document.body?.innerHTML.slice(0,155)]).catch(()=>null)])),(await page.locator('body').innerText()).slice(0,650));
      await page.screenshot({path:output.replace(/\.png$/,'.diagnostic.png'),timeout:5000}).catch(()=>{});throw e;
    }
  }finally{await browser?.close();http.close();server.closeAllConnections();await new Promise(done=>server.close(done));}
}
