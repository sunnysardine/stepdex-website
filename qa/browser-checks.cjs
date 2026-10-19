const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'results');
fs.mkdirSync(out, {recursive:true});
const rewrites = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'))).rewrites;
const types = {'.html':'text/html','.png':'image/png','.webp':'image/webp','.js':'text/javascript','.css':'text/css'};
const server = http.createServer((req,res)=>{
  if(req.method !== 'GET' && req.method !== 'HEAD'){res.writeHead(405).end();return;}
  const pathname = new URL(req.url,'http://localhost').pathname;
  const mapped = rewrites.find(r=>r.source===pathname)?.destination || (pathname==='/'?'/index.html':pathname);
  const file = path.resolve(root, '.'+mapped);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
    res.end(req.method==='HEAD'?undefined:data);
  });
});
const results=[];
(async()=>{
 await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));
 const browser = await chromium.launch();
 try {
  for(const width of [360,390,768,1440]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   // Chatbase is an unrelated third-party widget; test the site's own UI.
   await context.route('**/*chatbase.co/**',route=>route.abort());
   for(const route of ['/','/programs','/step-up-your-performance','/contact']){
    const slug=route==='/'?'home':route.slice(1);
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try {
     const response=await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'networkidle'});
     assert.equal(response.status(),200,'page must load');
     await page.evaluate(()=>document.fonts.ready);
     const overflow=await page.evaluate(()=>({width:innerWidth,content:document.documentElement.scrollWidth}));
     assert(overflow.content<=overflow.width+1,'horizontal overflow: '+JSON.stringify(overflow));
     const title=page.locator('h1');
     assert.equal(await title.count(),1,'one main heading');
     const headingBox=await title.boundingBox();
     assert(headingBox && headingBox.x>=-1 && headingBox.x+headingBox.width<=width+1,'main heading extends beyond viewport');
     const menu=page.locator('.nav-hamburger');
     const links=page.locator('.nav-links');
     const mobile=await menu.isVisible();
     if(mobile){
      assert.equal(await links.isVisible(),false,'mobile menu initially closed');
      await menu.click();
      assert.equal(await links.isVisible(),true,'menu opens');
      await page.screenshot({path:path.join(out,slug+'-'+width+'-menu.png')});
      await menu.click();
      assert.equal(await links.isVisible(),false,'menu closes');
      await menu.click();
      await links.locator('a[href="/programs"]').click();
      await page.waitForURL('**/programs');
      assert.equal(await page.locator('.nav-links').isVisible(),false,'navigation closes mobile menu on destination');
      await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'networkidle'});
     } else {
      assert.equal(await links.isVisible(),true,'desktop navigation visible');
     }
     if(route==='/step-up-your-performance'){
      const images=page.locator('.v-gallery img');
      assert.equal(await images.count(),3);
      for(const image of await images.all()){
       await image.scrollIntoViewIfNeeded();
       await image.evaluate(el=>el.decode());
       assert(await image.evaluate(el=>el.naturalWidth>0),'gallery image loaded');
       const box=await image.boundingBox();
       assert(box.x>=-1 && box.x+box.width<=width+1,'gallery stays inside viewport');
      }
      await page.locator('.v-gallery').screenshot({path:path.join(out,'gallery-'+width+'.png')});
      for(const label of ['Enquire about this session','Discuss a session with us']){
       await page.getByRole('link',{name:label,exact:true}).click();
       await page.waitForURL('**/contact');
       assert(await page.locator('form[name="contact"]').isVisible(),'enquiry link reaches contact form');
       await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'networkidle'});
      }
     }
     if(route==='/contact'){
      assert(await page.locator('form[name="contact"]').isVisible());
      for(const id of ['name','email','consent']){
       assert(await page.locator('#'+id).getAttribute('required')!==null,'required field '+id);
      }
      assert.equal(await page.locator('a[href="mailto:hello@stepdex.my"]').count()>0,true,'email enquiry link');
     }
     await page.evaluate(()=>scrollTo(0,0));
     await page.screenshot({path:path.join(out,slug+'-'+width+'.png')});
     assert.equal(errors.length,0,'JavaScript errors: '+errors.join('; '));
     results.push({route,width,status:'PASS',menu:mobile?'mobile':'desktop'});
    } catch(error){
     results.push({route,width,status:'FAIL',error:error.message});
     await page.screenshot({path:path.join(out,slug+'-'+width+'-failure.png')}).catch(()=>{});
    } finally {await page.close();}
   }
   await context.close();
  }
 } finally {await browser.close();}
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(results,null,2));
 const report=['# STEPDEX browser checks','', '| Page | Width | Result | Detail |','|---|---:|---|---|',
 ...results.map(r=>'| '+r.route+' | '+r.width+' | '+r.status+' | '+(r.error||r.menu).replaceAll('|','/')+' |')].join('\n');
 fs.writeFileSync(path.join(out,'summary.md'),report+'\n');
 console.log(report);
 if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
