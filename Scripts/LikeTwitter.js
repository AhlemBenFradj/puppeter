const fs = require('fs');
const puppeteer = require('puppeteer');

module.exports = async (profileData) => {
    try {
        // Connect Puppeteer to the existing Chromium instance using wsUrl
        const browser = await puppeteer.connect({
            browserWSEndpoint: profileData.wsUrl
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Define the path to your file
        const filePath = "C:\\Users\\ahlem\\OneDrive\\Bureau\\Valex-JS\\backend\\Like.txt";

        // Read file content asynchronously
        const data = await fs.promises.readFile(filePath, 'utf8');
        console.log("File content read successfully:", data);

        // Extract URLs ending with a comma (adjust regex if necessary)
        const matches = data.match(/https?:\/\/[^,\s]+,/g);
        if (!matches || matches.length === 0) {
            console.log("No matching URLs found.");
            await browser.disconnect();
            return;
        }

        // Remove trailing commas and pick a random URL
        const urls = matches.map(url => url.slice(0, -1));
        const url = urls[Math.floor(Math.random() * urls.length)];
        console.log("Opening URL:", url);

        // Navigate to the selected URL
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('h1');

        // Replace page.waitForTimeout with a Promise-based delay
        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.evaluate(() => window.scrollTo(0, 4));

        // Wait for the like button and click it
        const buttonSelector = 'button[data-testid="like"]';
        await page.waitForSelector(buttonSelector, { visible: true, timeout: 10000 });
        await page.click(buttonSelector);

        console.log("Clicked the like button successfully.");

        // Optional: wait for a while to observe the action, then disconnect
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.disconnect();
    } catch (error) {
        console.error('Error in likeScript:', error);
        throw error;
    }
};
