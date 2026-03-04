import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
        page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
        page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure()?.errorText));

        console.log("Navigating to localhost...");
        await page.goto('http://localhost:3000/#/news', { waitUntil: 'networkidle0' });

        await new Promise(r => setTimeout(r, 2000));

        await browser.close();
        console.log("Done checking.");
    } catch (e) {
        console.error("Puppeteer Script Error:", e);
    }
})();
