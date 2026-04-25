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
