const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());

// Serveur les fichiers statiques depuis le répertoire 'public'
app.use(express.static('json'));

// Endpoint pour lister les fichiers JSON
app.get('/json-files', (req, res) => {
    const jsonDirectory = path.join(__dirname, 'json');
    fs.readdir(jsonDirectory, (err, files) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Failed to list JSON files' });
        }
        res.json(files.filter(file => file.endsWith('.json')));
    });
});

// Endpoint pour trier les matrices de confusion
app.post('/sort-matrices', express.json(), (req, res) => {
    const filePath = path.join(__dirname, 'json', req.body.filePath);
    const sort = require('./interface/sort.js');
    try {
        const newFilePath = sort.sortConfusionMatrices(filePath);
        res.json({ filePath: newFilePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to sort matrices', details: error.message });
    }
});



const server = app.listen(0, () => {
    const port = server.address().port;
    console.log(`Server is running on http://localhost:${port}`);
    const configScript = `var serverPort = ${port};`;
    fs.writeFileSync(path.join(__dirname, 'config.js'), configScript);
});



