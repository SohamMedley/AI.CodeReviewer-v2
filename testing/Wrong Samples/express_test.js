const express = require('express');
const app = express();

const mockDatabaseQuery = (id) => new Promise((resolve, reject) => {
    if(!id) reject("No ID provided");
    setTimeout(() => resolve({ id, name: "Data" }), 500);
});

app.get('/api/data', async (req, res) => {
    // ERROR: No try-catch block. If no ID is provided, the app will crash from unhandled rejection
    const data = await mockDatabaseQuery(req.query.id);
    
    if (data) {
        res.status(200).json(data);
    }
    
    // ERROR: Cannot set headers after they are sent to the client
    res.send("Request finished processing.");
});

app.listen(3000, () => console.log('Server running'));