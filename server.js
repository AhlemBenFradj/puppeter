const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Function to start a profile using HideMyAcc API
async function startProfile(profileId) {
    try {
        const response = await axios.post(`http://localhost:2268/profiles/start/${profileId}`);
        // Validate the response format
        if (response.data.code !== 1 || !response.data.data.success) {
            throw new Error('Profile start failed');
        }
        return response.data.data; // Contains wsUrl, etc.
    } catch (error) {
        throw new Error(`Failed to start profile: ${error.message}`);
    }
}

// Endpoint to start a profile and then execute a script from the Scripts folder
app.post('/run/:profileId/:scriptName', async (req, res) => {
    const { profileId, scriptName } = req.params;
    const scriptPath = path.join(__dirname, 'Scripts', `${scriptName}.js`);

    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
        return res.status(404).send('Script not found.');
    }

    try {
        // Start the profile and retrieve its configuration (wsUrl, etc.)
        const profileData = await startProfile(profileId);
        console.log('Profile started:', profileData);

        // Require and execute the script, passing the profile configuration
        const scriptModule = require(scriptPath);
        await scriptModule(profileData);

        res.status(200).json({ message: 'Profile started and script executed successfully.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
