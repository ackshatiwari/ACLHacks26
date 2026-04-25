const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (document.getElementById('createAccountForm')) {
  const createAccountForm = document.getElementById('createAccountForm');
    createAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        const phone_number = document.getElementById('phone_number').value;
        const country = document.getElementById('country').value;

        try {
            const response = await fetch('/api/createaccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, first_name, last_name, phone_number, country })
            });
            const responseBody = await response.json().catch(() => ({}));

            if (response.ok) {
                alert(responseBody.message || 'Account created successfully!');
                createAccountForm.reset();
            } else {
                alert(responseBody.error || 'Failed to create account. Please try again.');
            }
        }
        catch (error) {
            console.error('Error creating account:', error);
        }
    });
}

if (document.getElementById('login-account-form')) {
    const loginForm = document.getElementById('login-account-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const response = await fetch('/api/login-to-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'            },
            body: JSON.stringify({ username, password })
        });
        const responseBody = await response.json().catch(() => ({}));
        if (response.ok) {
            alert(responseBody.message || 'Logged in successfully!');
            loginForm.reset();
        } else {
            alert(responseBody.error || 'Failed to log in. Please check your credentials and try again.');
        }
    });
}

if (document.getElementById('register-organ-form')) {
    const registerOrganForm = document.getElementById('register-organ-form');
    const organSelect = document.getElementById('organ');
    organSelect.addEventListener('change', () => {
        const organ = document.getElementById('organ').value;
        if (organ === '') alert('Please select an organ to register.');
        else {
            if (organ.toLowerCase() === 'lung') {
                // it will include the blood type. the size of the lung, the pTLC thats it
                const lungFormHtml = `
                    <h2>Lung Registration</h2>
                    <form id="lung-registration-form">
                        <label for="bloodtype">Blood Type:</label>
                        <select id="bloodtype" name="bloodtype" required>
                            <option value="">Select blood type</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                        <label for="size">Size of Lung (in cm) (widthxheight):</label>
                        <input type="text" id="size" name="size" required>
                        <label for="ptlc">Predicted Total Lung Capacity (pTLC) (in liters):</label>
                        <input type="number" id="ptlc" name="ptlc" required>
                        <button type="submit">Register Lung</button>
                    </form>
                `;
                document.querySelector('.container').innerHTML = lungFormHtml;
                
            } else if (organ.toLowerCase() === 'kidney') {
                // Give a set of forms to fill out for the kidneys
                // it will include the Bloodtypes, the HLA typing, and the size of the kidney
                const kidneyFormHtml = `
                    <h2>Kidney Registration</h2>
                    <form id="kidney-registration-form">
                        <label for="bloodtype">Blood Type:</label>
                        <select id="bloodtype" name="bloodtype" required>
                            <option value="">Select blood type</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                        <label for="hla">HLA Typing:</label>
                        <input type="text" id="hla" name="hla" required>
                        <label for="size">Size of Kidney (in cm) (widthxheight):</label>
                        <input type="number" id="size" name="size" required>
                        <button type="submit">Register Kidney</button>
                    </form>
                `;
                document.querySelector('.container').innerHTML = kidneyFormHtml;
            } else if (organ.toLowerCase() === 'heart') {
                // Give a set of forms to fill out for the heart
                // it will include the blood type, and the size of the heart
                const heartFormHtml = `
                    <h2>Heart Registration</h2>
                    <form id="heart-registration-form">
                        <label for="bloodtype">Blood Type:</label>
                        <select id="bloodtype" name="bloodtype" required>
                            <option value="">Select blood type</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                        <label for="size">Size of Heart (in cm.) (widthxheight):</label>
                        <input type="text" id="size" name="size" required>
                        <button type="submit">Register Heart</button>
                    </form>
                `;
                document.querySelector('.container').innerHTML = heartFormHtml;
            } else if (organ.toLowerCase() === 'liver') {
                // Give a set of forms to fill out for the liver
                // it will include the blood type, and size of the liver
                const liverFormHtml = `
                    <h2>Liver Registration</h2>
                    <form id="liver-registration-form"> 
                        <label for="bloodtype">Blood Type:</label>
                        <select id="bloodtype" name="bloodtype" required>
                            <option value="">Select blood type</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                        <label for="size">Size of Liver (in cm) (widthxheight):</label>
                        <input type="text" id="size" name="size" required>
                        <button type="submit">Register Liver</button>
                    </form>
                `;
                document.querySelector('.container').innerHTML = liverFormHtml;
            }
        }
    });
}
