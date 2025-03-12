const puppeteer = require('puppeteer');

module.exports = async (profileData) => {
    try {
        // Connect Puppeteer to the running Chromium instance via wsUrl
        const browser = await puppeteer.connect({
            browserWSEndpoint: profileData.wsUrl
        });

        const page = await browser.newPage();
        await page.goto('https://x.com');
        console.log('Navigated to https://x.com');

        // Optional: wait a few seconds to see the page
        await page.waitForTimeout(5000);

        // Disconnect from the browser (do not close the external Chromium instance)
        await browser.disconnect();
    } catch (error) {
        console.error('Error in script execution:', error);
        throw error;
    }
};
