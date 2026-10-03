// Run with Node and Playwright available (PLAYWRIGHT_MODULE may be an absolute module path).
// Uses installed Chrome and serves this checkout over localhost, without mocking site APIs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const out = process.env.SCREENSHOT_DIR;
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer((req,res) => {
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file,(err,data)=>{ if(err) res.writeHead(404).end(); else {res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');res.end(data);} });
});
// Expected user-visible outcomes are authored independently of the production dictionary.
const expected = {
  en: ['AI interview practice you can actually inspect.', 'Privacy', 'Reports workspace — before the first practice', 'Open app'],
  fr: ['Découvrez l’entraînement aux entretiens avec l’IA.', 'Confidentialité', 'Espace de rapports — avant le premier entraînement', 'Ouvrir l’application'],
  'zh-Hant': ['親眼看看 AI 面試練習。', '隱私權', '報告工作區——首次練習之前', '開啟應用程式'],
  hi: ['AI इंटरव्यू अभ्यास की असली झलक देखें।', 'गोपनीयता', 'रिपोर्ट कार्यक्षेत्र — पहले अभ्यास से पहले', 'ऐप खोलें'],
};

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  let browser;
  try {
    browser = await chromium.launch({channel:'chrome',headless:true});
    console.log(`Chrome ${browser.version()} | ${url}`);
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url);
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    const originalLinks=await page.locator('a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
    assert.deepEqual(await page.locator('#language-select option').allTextContents(), ['English','Français','繁體中文','हिन्दी']);
    const readFields=()=>[...document.querySelectorAll('[data-i18n], [data-i18n-alt], [data-i18n-aria-label], [data-i18n-content]')].map(n=>n.hasAttribute('data-i18n') ? n.textContent.trim() : n.getAttribute(['alt','aria-label','content'].find(a=>n.hasAttribute('data-i18n-'+a))));
    const baselineFields=await page.evaluate(readFields);
    const unmarked=await page.evaluate(()=>{
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      const missing=[];
      while(walker.nextNode()) {
        const text=walker.currentNode.textContent.trim();
        const parent=walker.currentNode.parentElement;
        if(text && !['SD','SpeakUp SD'].includes(text) && !parent.closest('[data-i18n],option,script')) missing.push(text);
      }
      return missing;
    });
    assert.deepEqual(unmarked,[], 'all non-brand copy has a translation key');
    for(const [locale,copy] of Object.entries(expected)) {
      for(const width of [320,390,768,1440]) {
        await page.setViewportSize({width,height:1000});
        await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
        await page.locator('#language-select').selectOption(locale);
        assert.equal(await page.locator('html').getAttribute('lang'),locale);
        assert.equal(await page.locator('h1').textContent(),copy[0]);
        assert.equal(await page.locator('footer a').first().textContent(),copy[1]);
        assert.equal(await page.locator('.screen-card strong').last().textContent(),copy[2]);
        assert.equal(await page.locator('.header-action').textContent(),copy[3]);
        assert(await page.locator('.language-control').isVisible());
        const bounds=await page.locator('#language-select').boundingBox();
        assert(bounds.x>=0 && bounds.x+bounds.width<=width,`selector fits ${locale}/${width}`);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`no horizontal overflow ${locale}/${width}`);
        assert.equal(await page.locator('body').innerText().then(s=>s.includes('undefined')),false);
        assert.deepEqual(await page.locator('a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),originalLinks);
        assert(await page.locator('img').evaluateAll(nodes=>nodes.every(n=>n.complete&&n.naturalWidth>0)));
        if(out && [390,1440].includes(width)) {
          await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
          fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,`${locale}-${width}.png`),fullPage:true});
          await page.screenshot({path:path.join(out,`${locale}-${width}-top.png`)});
        }
      }
      if(locale!=='en') {
        const fields=await page.evaluate(readFields);
        assert.equal(fields.length,baselineFields.length);
        fields.forEach((value,i)=>{assert(value,`non-empty field ${i}`);assert.notEqual(value,baselineFields[i],`translated field ${i}/${locale}`);});
      }
      await page.reload();
      assert.equal(await page.locator('html').getAttribute('lang'),locale,`reload preserves ${locale}`);
      assert.equal(await page.locator('h1').textContent(),copy[0]);
      await page.locator('.hero .secondary-action').click();
      await page.waitForFunction(()=>location.hash==='#screens');
      await page.locator('.brand').click();
      await page.waitForFunction(()=>location.hash==='#top');
      console.log(`PASS ${locale}: translated copy/attributes, 4 viewport widths, assets, destinations, reload, anchor actions`);
    }
    // Native keyboard operation, not just programmatic selectOption.
    await page.locator('#language-select').focus();
    await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
    assert.equal(await page.locator('h1').textContent(),expected.fr[0]);
    for(const value of ['unknown','__proto__','constructor']) {
      await page.evaluate(value=>localStorage.setItem('speakup-showcase-language',value),value);
      await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),'en');
    }
    const denied=await browser.newContext();
    await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));
    const blocked=await denied.newPage();blocked.on('pageerror',e=>errors.push(e.message));await blocked.goto(url);
    await blocked.locator('#language-select').selectOption('hi');assert.equal(await blocked.locator('h1').textContent(),expected.hi[0]);
    await blocked.reload();assert.equal(await blocked.locator('html').getAttribute('lang'),'en');
    const nojs=await browser.newContext({javaScriptEnabled:false});
    const plain=await nojs.newPage();await plain.goto(url);
    assert.equal(await plain.locator('h1').textContent(),expected.en[0]);assert.equal(await plain.locator('.language-control').isVisible(),false);
    assert.deepEqual(await plain.locator('a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),originalLinks);
    assert.deepEqual(errors,[]);
    console.log('PASS keyboard, invalid preference, denied storage, no JavaScript, no runtime errors');
  } finally { if(browser) await browser.close();server.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
