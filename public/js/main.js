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
        const age = document.getElementById('age').value;
        const height = document.getElementById('height').value;
        const gender = document.getElementById('gender').value;

        try {
            const response = await fetch('/api/createaccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, first_name, last_name, phone_number, country, age, height, gender })
            });
            const responseBody = await response.json().catch(() => ({}));

            if (response.ok) {
                sessionStorage.setItem('username', username);
                console.log('✓ Username stored in sessionStorage:', sessionStorage.getItem('username'));
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
            sessionStorage.setItem('username', username);
            console.log('✓ Username stored in sessionStorage:', sessionStorage.getItem('username'));
            alert(responseBody.message || 'Logged in successfully!');
            loginForm.reset();
        } else {
            alert(responseBody.error || 'Failed to log in. Please check your credentials and try again.');
        }
    });
}

if (document.getElementById('register-organ-form')) {
    console.log(sessionStorage.getItem('username'));

    if (sessionStorage.getItem('username') === null) {
        alert('You must be logged in to register an organ. Redirecting to login page.');
        window.location.href = '/login_to_account';
    }

    const registerOrganForm = document.getElementById('register-organ-form');
    const organSelect = document.getElementById('organ');

    organSelect.addEventListener('change', () => {
        const organ = document.getElementById('organ').value;
        if (organ === '') {
            alert('Please select an organ to register.');
            return;
        }

        // helper to attach the submit handler
        const attachSubmit = (formId, organType) => {
            setTimeout(() => {
                const form = document.getElementById(formId);
                if (!form) return;
                
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const username = sessionStorage.getItem('username');
                    const bloodtype = document.getElementById('bloodtype').value;
                    const size = document.getElementById('size').value;
                    
                    const ptlc = document.getElementById('ptlc')?.value || null;
                    const hla = document.getElementById('hla')?.value || null;

                    try {
                        const response = await fetch('/api/registerOrgan', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username,
                                organ: organType.toLowerCase(),
                                bloodtype,
                                size,
                                ptlc,
                                hla
                            })
                        });
                        const data = await response.json().catch(() => ({}));
                        if (response.ok) {
                            alert(data.message || `${organType} registered successfully!`);
                            form.reset();
                        } else {
                            alert(data.error || `Failed to register ${organType}. Please try again.`);
                        }
                    } catch (error) {
                        console.error(`Error registering ${organType}:`, error);
                        alert(`An error occurred while registering the ${organType}. Please try again.`);
                    }
                });
            }, 100); // slight delay to ensure form is rendered
        };

        if (organ.toLowerCase() === 'lung') {
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
                        <button type="submit" id="lungSubmit">Register Lung</button>
                    </form>
                `;
                document.querySelector('.container').innerHTML = lungFormHtml;
                attachSubmit('lung-registration-form', 'Lung');
                
            } else if (organ.toLowerCase() === 'kidney') {
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
                        <button type="submit" id="kidneySubmit">Register Kidney</button>
                    </form>
                `;
                document.querySelector('.container').innerHTML = kidneyFormHtml;
                attachSubmit('kidney-registration-form', 'Kidney');
            } else if (organ.toLowerCase() === 'heart') {
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
                        <button type="submit" id="heartSubmit">Register Heart</button>
                    </form>
                `;
                document.querySelector('.container').innerHTML = heartFormHtml;
                attachSubmit('heart-registration-form', 'Heart');
            } else if (organ.toLowerCase() === 'liver') {
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
                        <button type="submit" id="liverSubmit">Register Liver</button>
                    </form>
                `;
                document.querySelector('.container').innerHTML = liverFormHtml;
                attachSubmit('liver-registration-form', 'Liver');
            }
    });
}

