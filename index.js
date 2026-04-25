import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const DATABASE_URL = process.env.DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

const PORT = process.env.PORT || 3000;

app.use(express.static(publicDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
	res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/about', (req, res) => {
	res.sendFile(path.join(publicDir, 'about.html'));
});

app.get('/contact', (req, res) => {
	res.sendFile(path.join(publicDir, 'contact.html'));
});

app.get('/createaccount', (req, res) => {
    res.sendFile(path.join(publicDir, 'createaccount.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(publicDir, 'signin.html'));
});

app.get('/login_to_account', (req, res) => {
    res.sendFile(path.join(publicDir, 'login_to_account.html'));
});




app.post('/api/createaccount', async (req, res) => {
	const { username, password, first_name, last_name, phone_number, country } = req.body;
	const requiredFields = [username, password, first_name, last_name, phone_number, country];

    // Validate that all required fields are present and not just whitespace
	if (requiredFields.some((value) => !String(value || '').trim())) {
		return res.status(400).json({ error: 'All fields are required.' });
	}


	if (!sql) {
		return res.status(500).json({
			error: 'Database is not configured'
		});
	}

	const normalized = {
		password: password.trim(),
		first_name: first_name.trim(),
		last_name: last_name.trim(),
		phone_number: phone_number.trim(),
		country: country.trim(),
        username: username.trim()
	};

	try {

		await sql`
			INSERT INTO users (first_name, last_name, phone_number, country, password, username)
			VALUES (
				${normalized.first_name},
                ${normalized.last_name},
                ${normalized.phone_number},
                ${normalized.country},
                ${normalized.password},
                ${normalized.username}
			)
		`;

		res.status(201).json({ message: 'Account created successfully' });
	} catch (error) {
		if (error && error.code === '23505') {
			return res.status(409).json({ error: 'Username already exists.' });
		}

		console.error('Database error during account creation:', error);
		res.status(500).json({ error: 'Failed to create account.' });
	}
});

app.post('/api/login-to-account', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || !String(username).trim() || !String(password).trim()) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }
    if (!sql) {
        return res.status(500).json({ error: 'Database is not configured' });
    }

    try {
        const user = await sql`
            SELECT * FROM users WHERE username = ${String(username).trim()} AND password = ${String(password).trim()}
        `;
        if (user.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }
        res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
        console.error('Database error during login:', error);
        res.status(500).json({ error: 'Failed to log in.' });
    }   
});

app.use((req, res) => {
	res.status(404).sendFile(path.join(publicDir, '404.html'));
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
