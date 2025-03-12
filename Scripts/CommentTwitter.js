const fs = require('fs');
const puppeteer = require('puppeteer');

module.exports = async (profileData) => {
    try {
        // Connect Puppeteer to the existing Chromium instance using wsUrl
        const browser = await puppeteer.connect({
            browserWSEndpoint: profileData.wsUrl
        });
        const page = await browser.newPage();

        // Set the viewport to 1920x1080
        await page.setViewport({ width: 1920, height: 1080 });

        const path = require('path');
        const filePath = path.join(process.env.FILE_PATH || '/var/www/valex-js/backend', 'Comment.txt');

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

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Split the file content by lines and extract comments (everything after the first comma)
        const lines = data.split('\n');
        const comments = lines
            .map(line => line.trim()) // Trim whitespace
            .filter(line => line.includes(',')) // Ensure the line contains a comma
            .map(line => {
                const parts = line.split(','); // Split at commas
                return parts.length > 1 ? parts.slice(1).join(',').trim() : null; // Extract everything after the first comma
            })
            .filter(comment => comment);

        // Wait for the page to load a header element
        await page.waitForSelector('h1');
        // Delay for 10 seconds using a Promise-based delay
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Click the reply button
        const replyButtonSelector = 'button[data-testid="reply"]';
        await page.waitForSelector(replyButtonSelector, { visible: true, timeout: 1000 });
        await page.click(replyButtonSelector);
        await page.click(replyButtonSelector);

        // Type the comments into the contenteditable reply field
        await page.type('div.DraftEditor-editorContainer div[contenteditable="true"]', comments.join("\n"), { delay: 800 });

        // Click the tweet button to submit the reply
        const tweetButtonSelector = 'button[data-testid="tweetButtonInline"]';
        await page.waitForSelector(tweetButtonSelector, { visible: true, timeout: 10000 });
        await page.click(tweetButtonSelector);

        // Wait 100 seconds to allow for network latency or page processing
        await new Promise(resolve => setTimeout(resolve, 100000));

        console.log("Replied successfully.");

        // Optional: Wait a bit longer, then disconnect
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.disconnect();
    } catch (error) {
        console.error('Error in reply script:', error);
        throw error;
    }
};
