const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir));

app.get('/', (req, res) => {
	res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/about', (req, res) => {
	res.sendFile(path.join(publicDir, 'about.html'));
});

app.get('/contact', (req, res) => {
	res.sendFile(path.join(publicDir, 'contact.html'));
});

app.use((req, res) => {
	res.status(404).sendFile(path.join(publicDir, '404.html'));
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
