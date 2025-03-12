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
        // Define the file path for Tweet.txt
        const filePath = "C:\\Users\\ahlem\\OneDrive\\Bureau\\Valex-JS\\backend\\Tweet.txt";

        // Read file content asynchronously
        const data = await fs.promises.readFile(filePath, 'utf8');
        console.log("File content read successfully:", data);

        // Navigate to the page
        await page.goto('https://x.com', { waitUntil: 'domcontentloaded' });

        // Replace waitForTimeout with a Promise-based delay (e.g., 60 seconds)
        await new Promise(resolve => setTimeout(resolve, 6000));

        // Split the file content into tweets (each non-empty line is treated as a tweet)
        const tweets = data.split(/\r?\n/).filter(line => line.trim() !== "");

        // Another delay before typing (10 seconds)
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Type the tweets into the tweet box.
        // Using a more robust selector targeting a contenteditable textbox.
        // You may need to adjust this selector by inspecting the page's element.
        await page.type('div[role="textbox"]', tweets.join("\n"), { delay: 400 });

        // Define the tweet button selector
        const btntweet = 'button[data-testid="tweetButtonInline"]';

        // Wait for the tweet button to be visible
        await page.waitForSelector(btntweet, { visible: true, timeout: 10000 });

        // Click the tweet button to post the tweet(s)
        await page.click(btntweet);

        // Final delay (100 seconds) to observe the result or allow for network latency
        await new Promise(resolve => setTimeout(resolve, 100000));
        await browser.disconnect();
    } catch (error) {
        console.error('Error in likeScript:', error);
        throw error;
    }
};
