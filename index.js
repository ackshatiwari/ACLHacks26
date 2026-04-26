import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';


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

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(publicDir, 'dashboard.html'));
});

app.get('/registerorgans', (req, res) => {
    res.sendFile(path.join(publicDir, 'registerorgans.html'));
});

app.get('/match_with_donor', (req, res) => {
    res.sendFile(path.join(publicDir, 'match_with_doner.html'));
});

app.get('/match_with_doner', (req, res) => {
    res.sendFile(path.join(publicDir, 'match_with_doner.html'));
});




app.post('/api/createaccount', async (req, res) => {
    const { username, password, first_name, last_name, phone_number, country, age, height, gender, bloodtype, bloodType, email, city, state } = req.body;
    const resolvedBloodType = bloodtype ?? bloodType;
    const requiredFields = [username, password, first_name, last_name, phone_number, country, age, height, gender, resolvedBloodType, email, city, state];

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
        gender: gender.trim(),
        bloodtype: String(resolvedBloodType).trim(),
        email: email.trim(),
        city: city.trim(),
        state: state.trim()
    };

    try {

        await sql`
			INSERT INTO users (first_name, last_name, phone_number, country, password, username, age, height, gender, blood_type, email, city, state)
			VALUES (
				${normalized.first_name},
                ${normalized.last_name},
                ${normalized.phone_number},
                ${normalized.country},
                ${normalized.password},
                ${normalized.username},
				${normalized.age},
				${normalized.height},
				${normalized.gender},
                ${normalized.bloodtype},
                ${normalized.email},
                ${normalized.city},
                ${normalized.state}
			)
		`;

        // get the id of the user that was just created and return it in the response along with the username and first name
        const createdUser = await sql`
            SELECT id FROM users WHERE username = ${normalized.username}
        `;


        res.status(201).json({ message: 'Account created successfully', id: createdUser[0].id });
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
            SELECT id, username, first_name, email, phone_number, country, age, height
            FROM users
            WHERE username = ${String(username).trim()} AND password = ${String(password).trim()}
        `;
        if (user.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }
        res.status(200).json({ message: 'Login successful!', user: user[0] });
    } catch (error) {
        console.error('Database error during login:', error);
        res.status(500).json({ error: 'Failed to log in.' });
    }
});

app.get('/api/dashboard', async (req, res) => {
    const username = String(req.query.username || '').trim();

    if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
    }
    if (!sql) {
        return res.status(500).json({ error: 'Database is not configured' });
    }

    try {
        const users = await sql`
            SELECT id, first_name, last_name, email, phone_number, country, age, height, gender, blood_type, username, city, state
            FROM public.users
            WHERE username = ${username}
        `;

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = users[0];

        const kidneys = await sql`
            SELECT id, blood_type, hla, size, requested_users
            FROM public.kidneys
            WHERE user_id = ${user.id}
        `;

        const livers = await sql`
            SELECT id, blood_type, size, requested_users
            FROM public.livers
            WHERE user_id = ${user.id}
        `;

        const lungs = await sql`
            SELECT id, blood_type, size, ptlc, requested_users
            FROM public.lungs
            WHERE user_id = ${user.id}
        `;

        const hearts = await sql`
            SELECT id, blood_type, size, requested_users
            FROM public.hearts
            WHERE user_id = ${user.id}
        `;

        const enrichOrgansWithRequesterEmails = async (organRows) => {
            if (!Array.isArray(organRows) || organRows.length === 0) {
                return [];
            }

            const requesterIds = [...new Set(
                organRows
                    .flatMap((row) => (Array.isArray(row.requested_users) ? row.requested_users : []))
                    .map((value) => Number.parseInt(String(value), 10))
                    .filter((value) => Number.isInteger(value))
            )];

            const emailById = new Map();

            for (const requesterId of requesterIds) {
                const requesterRows = await sql`
                    SELECT id, email
                    FROM public.users
                    WHERE id = ${requesterId}
                `;
                if (requesterRows.length > 0) {
                    emailById.set(requesterRows[0].id, requesterRows[0].email);
                }
            }

            return organRows.map((row) => {
                const requesters = (Array.isArray(row.requested_users) ? row.requested_users : [])
                    .map((value) => Number.parseInt(String(value), 10))
                    .filter((value) => Number.isInteger(value))
                    .map((requesterId) => ({
                        id: requesterId,
                        email: emailById.get(requesterId) || null
                    }));

                return {
                    ...row,
                    requesters
                };
            });
        };

        const kidneysWithRequesters = await enrichOrgansWithRequesterEmails(kidneys);
        const liversWithRequesters = await enrichOrgansWithRequesterEmails(livers);
        const lungsWithRequesters = await enrichOrgansWithRequesterEmails(lungs);
        const heartsWithRequesters = await enrichOrgansWithRequesterEmails(hearts);

        res.status(200).json({
            user,
            organs: {
                kidneys: kidneysWithRequesters,
                livers: liversWithRequesters,
                lungs: lungsWithRequesters,
                hearts: heartsWithRequesters
            }
        });
    } catch (error) {
        console.error('Database error during dashboard lookup:', error);
        res.status(500).json({ error: 'Failed to load dashboard data.' });
    }
});


// ************************************
// This is the handler for registering an organ. It takes in the organ type, blood type, size, ptlc, and hla (if kidney) and inserts it into the respective table in the database along with the user id of the person donating the organ.

// ************************************
const registerOrganHandler = async (req, res) => {
    const { username, organ, bloodtype, size, ptlc, hla } = req.body;
    if (username === undefined || organ === undefined || bloodtype === undefined || size === undefined) {
        return res.status(400).json({ error: 'Username, organ, blood type, and size are required.' });
    }
    if (!sql) {
        return res.status(500).json({ error: 'Database is not configured' });
    }
    if (organ.trim() === 'kidney') {
        if (hla === undefined || !String(hla).trim()) {
            return res.status(400).json({ error: 'HLA is required for kidney registration.' });
        }
        // submits the blood type, hla, size, and the user id of the person donating the kidney to the database
        try {
            await sql`
                INSERT INTO public.kidneys (blood_type, hla, size, user_id)
                VALUES (
                    ${bloodtype.trim()},
                    ${hla.trim()},
                    ${size.trim()},
                    (SELECT id FROM public.users WHERE username = ${String(username).trim()})
                )
            `;
            res.status(201).json({ message: 'Kidney registered successfully' });
        } catch (error) {
            console.error('Database error during organ registration:', error);
            res.status(500).json({ error: 'Failed to register the kidney.' });
        }
    } else if (organ.trim() === 'heart') {
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
        if (ptlc === undefined || !String(ptlc).trim()) {
            return res.status(400).json({ error: 'pTLC is required for lung registration.' });
        }
        try {
            await sql`
                INSERT INTO public.lungs (blood_type, size, ptlc, user_id)
                VALUES (
                    ${bloodtype.trim()},
                    ${size.trim()},
                    ${ptlc.trim()},
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

const findMatchesHandler = async (req, res) => {
    const { organ, bloodtype, size, ptlc, hla, city, state, country } = req.body;
    // hla and ptlc are optional and only used for kidney matches. If the organ is not a kidney, then they will be undefined and should not be included in the query to find matches.
    if (organ === undefined || bloodtype === undefined) {
        return res.status(400).json({ error: 'Organ and blood type are required.' });
    }
    if (!sql) {
        return res.status(500).json({ error: 'Database is not configured' });
    }
    // look through the databse of the organ in the 'organ field' and select everything
    if (organ.trim() === 'liver') {
        try {
            let matchOrgans = await sql`
                SELECT
                    l.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_number,
                    u.country,
                    u.age,
                    u.city,
                    u.state
                FROM public.livers AS l
                JOIN public.users AS u ON u.id = l.user_id
                WHERE l.blood_type = ${bloodtype.trim()} `;
            if (city || state || country) {
                const cty = String(city || '').trim();
                const st = String(state || '').trim();
                const cn = String(country || '').trim();
                matchOrgans = await sql`
                    SELECT
                        l.*,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone_number,
                        u.country,
                        u.age,
                        u.city,
                        u.state
                    FROM public.livers AS l
                    JOIN public.users AS u ON u.id = l.user_id
                    WHERE l.blood_type = ${bloodtype.trim()}
                      AND u.city = ${cty}
                      AND u.state = ${st}
                      AND u.country = ${cn}
                `;
            }
            res.status(200).json({ matches: matchOrgans });
        } catch (error) {
            console.error('Database error during match finding:', error);
            res.status(500).json({ error: 'Failed to find matches for the liver.' });
        }
    } else if (organ.trim() === 'kidney') {
        if (hla === undefined || !String(hla).trim()) {
            return res.status(400).json({ error: 'HLA is required for kidney match finding.' });
        }
        try {
            let matchOrgans = await sql`
                SELECT
                    k.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_number,
                    u.country,
                    u.age,
                    u.city,
                    u.state
                FROM public.kidneys AS k
                JOIN public.users AS u ON u.id = k.user_id
                WHERE k.blood_type = ${bloodtype.trim()}
                  AND k.hla = ${String(hla).trim()} `;
            if (city || state || country) {
                const cty = String(city || '').trim();
                const st = String(state || '').trim();
                const cn = String(country || '').trim();
                matchOrgans = await sql`
                    SELECT
                        k.*,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone_number,
                        u.country,
                        u.age,
                        u.city,
                        u.state
                    FROM public.kidneys AS k
                    JOIN public.users AS u ON u.id = k.user_id
                    WHERE k.blood_type = ${bloodtype.trim()}
                      AND k.hla = ${String(hla).trim()}
                      AND u.city = ${cty}
                      AND u.state = ${st}
                      AND u.country = ${cn}
                `;
            }
            res.status(200).json({ matches: matchOrgans });
        } catch (error) {
            console.error('Database error during match finding:', error);
            res.status(500).json({ error: 'Failed to find matches for the kidney.' });
        }
    } else if (organ.trim() === 'heart') {
        try {
            let matchOrgans = await sql`
                SELECT
                    h.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_number,
                    u.country,
                    u.age,
                    u.city,
                    u.state
                FROM public.hearts AS h
                JOIN public.users AS u ON u.id = h.user_id
                WHERE h.blood_type = ${bloodtype.trim()} `;
            if (city || state || country) {
                const cty = String(city || '').trim();
                const st = String(state || '').trim();
                const cn = String(country || '').trim();
                matchOrgans = await sql`
                    SELECT
                        h.*,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone_number,
                        u.country,
                        u.age,
                        u.city,
                        u.state
                    FROM public.hearts AS h
                    JOIN public.users AS u ON u.id = h.user_id
                    WHERE h.blood_type = ${bloodtype.trim()}
                      AND u.city = ${cty}
                      AND u.state = ${st}
                      AND u.country = ${cn}
                `;
            }
            res.status(200).json({ matches: matchOrgans });
        } catch (error) {
            console.error('Database error during match finding:', error);
            res.status(500).json({ error: 'Failed to find matches for the heart.' });
        }
    } else if (organ.trim() === 'lung') {
        if (ptlc === undefined || !String(ptlc).trim()) {
            return res.status(400).json({ error: 'pTLC is required for lung match finding.' });
        }
        try {
            let matchOrgans = await sql`
                SELECT
                    l.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_number,
                    u.country,
                    u.age,
                    u.city,
                    u.state
                FROM public.lungs AS l
                JOIN public.users AS u ON u.id = l.user_id
                WHERE l.blood_type = ${bloodtype.trim()}
                  AND l.ptlc = ${String(ptlc).trim()} `;
            if (city || state || country) {
                const cty = String(city || '').trim();
                const st = String(state || '').trim();
                const cn = String(country || '').trim();
                matchOrgans = await sql`
                    SELECT
                        l.*,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone_number,
                        u.country,
                        u.age,
                        u.city,
                        u.state
                    FROM public.lungs AS l
                    JOIN public.users AS u ON u.id = l.user_id
                    WHERE l.blood_type = ${bloodtype.trim()}
                      AND l.ptlc = ${String(ptlc).trim()}
                      AND u.city = ${cty}
                      AND u.state = ${st}
                      AND u.country = ${cn}
                `;
            }
            res.status(200).json({ matches: matchOrgans });
        } catch (error) {
            console.error('Database error during match finding:', error);
            res.status(500).json({ error: 'Failed to find matches for the lung.' });
        }
    } else {
        res.status(400).json({ error: 'Unsupported organ type for match finding.' });
    }

}

app.post('/api/contactmatch', async (req, res) => {
    const { username, email, id, organ, organRecordId } = req.body;

    console.log("Contact Match Request Received:", { username, email, id, organ, organRecordId });

    // 1. Validation
    if (!email || !username || !organ) {
        return res.status(400).json({ error: 'Username, email, and organ are required.' });
    }
    if (!sql) {
        return res.status(500).json({ error: 'Database is not configured' });
    }

    const organKey = String(organ).trim().toLowerCase();
    if (!['kidney', 'liver', 'lung', 'heart'].includes(organKey)) {
        return res.status(400).json({ error: 'Invalid organ type.' });
    }

    const requesterId = Number.parseInt(String(id), 10);
    const targetOrganId = Number.parseInt(String(organRecordId), 10);
    if (!Number.isInteger(requesterId) || !Number.isInteger(targetOrganId)) {
        return res.status(400).json({ error: 'Valid requester and target organ ids are required.' });
    }

    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'cooloofy123@gmail.com',
                pass: process.env.GMAIL_APP_PASSWORD,
            },
            tls: { rejectUnauthorized: false }
        });

        let info = await transporter.sendMail({
            from: '"Find My Donor" <cooloofy123@gmail.com>',
            to: email.trim(),
            subject: `${organKey.toUpperCase()} Match Request from ${username}`,
            html: `<p>Hey</p><p>You have received a new match request...</p>`
        });

        if (organKey === 'kidney') {
            await sql`
                UPDATE public.kidneys
                SET requested_users = array_append(COALESCE(requested_users, '{}'::int[]), ${requesterId})
                WHERE id = ${targetOrganId}
            `;
        } else if (organKey === 'liver') {
            await sql`
                UPDATE public.livers
                SET requested_users = array_append(COALESCE(requested_users, '{}'::int[]), ${requesterId})
                WHERE id = ${targetOrganId}
            `;
        } else if (organKey === 'lung') {
            await sql`
                UPDATE public.lungs
                SET requested_users = array_append(COALESCE(requested_users, '{}'::int[]), ${requesterId})
                WHERE id = ${targetOrganId}
            `;
        } else {
            await sql`
                UPDATE public.hearts
                SET requested_users = array_append(COALESCE(requested_users, '{}'::int[]), ${requesterId})
                WHERE id = ${targetOrganId}
            `;
        }

        return res.status(200).json({ 
            message: 'Contact email sent successfully!', 
            organ: organKey 
        });

    } catch (error) {
        console.error("Error in contactmatch:", error);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Failed to process match request.' });
        }
    }
});

app.post('/api/findmatches', findMatchesHandler);

app.post(['/api/registerOrgan', '/api/register-organ', '/api/registerorgan'], registerOrganHandler);


app.use((req, res) => {
    res.status(404).sendFile(path.join(publicDir, '404.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
