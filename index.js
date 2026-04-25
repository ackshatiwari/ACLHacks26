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

app.get('/registerorgans', (req, res) => {
    res.sendFile(path.join(publicDir, 'registerorgans.html'));
});




app.post('/api/createaccount', async (req, res) => {
    const { username, password, first_name, last_name, phone_number, country, age, height, gender } = req.body;
    const requiredFields = [username, password, first_name, last_name, phone_number, country, age, height, gender];

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
        username: username.trim(),
        age: parseInt(age),
        height: parseInt(height),
        gender: gender.trim()
    };

    try {

        await sql`
			INSERT INTO users (first_name, last_name, phone_number, country, password, username, age, height, gender)
			VALUES (
				${normalized.first_name},
                ${normalized.last_name},
                ${normalized.phone_number},
                ${normalized.country},
                ${normalized.password},
                ${normalized.username},
				${normalized.age},
				${normalized.height},
				${normalized.gender}
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


const registerOrganHandler = async (req, res) => {
    const { username, organ, bloodtype, size, ptlc, hla } = req.body;
    if (organ === undefined || bloodtype === undefined || size === undefined || ptlc === undefined || hla === undefined) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!sql) {
        return res.status(500).json({ error: 'Database is not configured' });
    }
    if (organ.trim() === 'kidney') {
        // submits the blood type, hla, size, and the user id of the person donating the kidney to the database
        try {
            await sql`
                INSERT INTO public.kidneys (blood_type, hla, size, ptlc, user_id)
                VALUES (
                    ${bloodtype.trim()},
                    ${hla.trim()},
                    ${size.trim()},
                    ${ptlc.trim()},
                    (SELECT id FROM public.users WHERE username = ${String(username).trim()})
                )
            `;
            res.status(201).json({ message: 'Kidney registered successfully' });
        } catch (error) {
            console.error('Database error during organ registration:', error);
            res.status(500).json({ error: 'Failed to register the kidney.' });
        }
    } else if(organ.trim() === 'heart') {
        try {
            await sql`
                INSERT INTO public.hearts (blood_type, size, user_id)
                VALUES (
                    ${bloodtype.trim()},
                    ${size.trim()},
                    (SELECT id FROM public.users WHERE username = ${String(username).trim()})
                )
            `;
            res.status(201).json({ message: 'Heart registered successfully' });
        } catch (error) {
            console.error('Database error during organ registration:', error);
            res.status(500).json({ error: 'Failed to register the heart.' });
        }
    } else if (organ.trim() === 'liver') {
        try {
            await sql`
                INSERT INTO public.livers (blood_type, size, user_id)
                VALUES ( 
                    ${bloodtype.trim()},
                    ${size.trim()},
                    (SELECT id FROM public.users WHERE username = ${String(username).trim()})
                )
            `;
            res.status(201).json({ message: 'Liver registered successfully' });
        } catch (error) {
            console.error('Database error during organ registration:', error);
            res.status(500).json({ error: 'Failed to register the liver.' });
        }
    } else if (organ.trim() === 'lung') {
        try {
            await sql`
                INSERT INTO public.lungs (blood_type, size, user_id)
                VALUES (
                    ${bloodtype.trim()},
                    ${size.trim()},
                    (SELECT id FROM public.users WHERE username = ${String(username).trim()})
                )
            `;
            res.status(201).json({ message: 'Lung registered successfully' });
        } catch (error) {
            console.error('Database error during organ registration:', error);
            res.status(500).json({ error: 'Failed to register the lung.' });
        }
    } else {
        res.status(400).json({ error: 'Invalid organ type.' });
    }
    
                

};

app.post(['/api/registerOrgan', '/api/register-organ', '/api/registerorgan'], registerOrganHandler);

app.use((req, res) => {
    res.status(404).sendFile(path.join(publicDir, '404.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
