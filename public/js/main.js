const yearEl = document.getElementById('year');

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const authLink = document.getElementById('auth-link');
const welcomeUser = document.getElementById('welcome-user');
const username = sessionStorage.getItem('username');

if (username && authLink && welcomeUser) {
    authLink.hidden = true;
    welcomeUser.hidden = false;
    welcomeUser.textContent = `Welcome, ${username}`;
}

const createHealthReviewForm = document.getElementById('createHealthReviewForm');

if (createHealthReviewForm) {
    createHealthReviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const first_name = document.getElementById('first_name').value;
        const last_name = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const phone_number = document.getElementById('phone_number').value;
        const country = document.getElementById('country').value;
        const age = document.getElementById('age').value;
        const height = document.getElementById('height').value;
        const gender = document.getElementById('gender').value;
        const bloodType = document.getElementById('blood_type').value;
        const city = document.getElementById('city')?.value || '';
        const state = document.getElementById('state')?.value || '';

        try {
            const response = await fetch('/api/createaccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, first_name, last_name, phone_number, country, age, height, gender, bloodType, email, city, state })
            });
            const responseBody = await response.json().catch(() => ({}));

            if (response.ok) {
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('first_name', first_name);
                sessionStorage.setItem('id', responseBody.id);
                sessionStorage.setItem('email', email);
                sessionStorage.setItem('phone_number', phone_number);
                sessionStorage.setItem('country', country);
                sessionStorage.setItem('age', age);
                sessionStorage.setItem('height', height);
                console.log('✓ Username stored in sessionStorage:', sessionStorage.getItem('username'));
                alert(responseBody.message || 'Account created successfully!');
                createHealthReviewForm.reset();
            } else {
                alert(responseBody.error || 'Failed to create account. Please try again.');
            }
        } catch (error) {
            console.error('Error creating account:', error);
        }
    });

    const startHealthReviewButton = document.getElementById('start-health-review');
    const processingStatus = document.getElementById('processing-status');
    const processingLabel = document.getElementById('processing-label');
    const processingText = document.getElementById('processing-text');
    const processComplete = document.getElementById('process-complete');
    const submitButton = startHealthReviewButton;
    let processingTimer = null;

    const resetProcessingUi = () => {
        createHealthReviewForm.classList.remove('is-processing');
        if (processingStatus) {
            processingStatus.hidden = true;
        }
        if (processComplete) {
            processComplete.hidden = true;
        }
        if (processingLabel) {
            processingLabel.textContent = 'AI is processing your report';
        }
        if (processingText) {
            processingText.textContent = 'Uploading and analyzing your physical report...';
        }
        if (submitButton) {
            submitButton.disabled = false;
        }
    };

    if (startHealthReviewButton) {
        startHealthReviewButton.addEventListener('click', () => {
            const reportInput = document.getElementById('physical_report');
            const reportFile = reportInput?.files?.[0];

            if (!reportFile) {
                alert('Please upload your latest physical report to continue.');
                return;
            }

            if (processingTimer) {
                window.clearTimeout(processingTimer);
            }

            createHealthReviewForm.classList.add('is-processing');
            if (processingStatus) {
                processingStatus.hidden = false;
            }
            if (processComplete) {
                processComplete.hidden = true;
            }
            if (processingLabel) {
                processingLabel.textContent = 'AI is processing your report';
            }
            if (processingText) {
                processingText.textContent = `Reviewing ${reportFile.name} for health markers and eligibility signals...`;
            }
            if (submitButton) {
                submitButton.disabled = true;
            }

            processingTimer = window.setTimeout(() => {
                if (processingLabel) {
                    processingLabel.textContent = 'Analysis finished';
                }
                if (processingText) {
                    processingText.textContent = 'Your report has been reviewed successfully.';
                }
                if (processComplete) {
                    processComplete.hidden = false;
                }
                if (submitButton) {
                    submitButton.disabled = false;
                }
                createHealthReviewForm.classList.remove('is-processing');
            }, 2000);
        });
    }

    createHealthReviewForm.addEventListener('reset', resetProcessingUi);
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const responseBody = await response.json().catch(() => ({}));
        if (response.ok) {
            sessionStorage.setItem('username', username);
            if (responseBody.user?.id !== undefined && responseBody.user?.id !== null) {
                sessionStorage.setItem('id', String(responseBody.user.id));
            }
            if (responseBody.user?.first_name) sessionStorage.setItem('first_name', responseBody.user.first_name);
            if (responseBody.user?.email) sessionStorage.setItem('email', responseBody.user.email);
            if (responseBody.user?.phone_number) sessionStorage.setItem('phone_number', responseBody.user.phone_number);
            if (responseBody.user?.country) sessionStorage.setItem('country', responseBody.user.country);
            if (responseBody.user?.age !== undefined && responseBody.user?.age !== null) sessionStorage.setItem('age', String(responseBody.user.age));
            if (responseBody.user?.height !== undefined && responseBody.user?.height !== null) sessionStorage.setItem('height', String(responseBody.user.height));
            console.log('✓ Username stored in sessionStorage:', sessionStorage.getItem('username'));
            alert(responseBody.message || 'Logged in successfully!');
            window.location.href = '/dashboard';
            loginForm.reset();
        } else {
            alert(responseBody.error || 'Failed to log in. Please check your credentials and try again.');
        }
    });
}

if (document.getElementById('register-organ-form')) {
    if (sessionStorage.getItem('username') === null) {
        alert('You must be logged in to register an organ. Redirecting to login page.');
        window.location.href = '/login_to_account';
    }

    const registerShell = document.getElementById('register-shell');
    const organSelect = document.getElementById('organ');

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
        }, 100);
    };

    const renderOrganForm = (organ) => {
        if (!registerShell) return;

        const organName = organ.charAt(0).toUpperCase() + organ.slice(1).toLowerCase();
        const organHints = {
            kidney: ['Blood type compatibility', 'HLA typing', 'Size measurement'],
            liver: ['Blood type compatibility', 'Size measurement', 'Organ health details'],
            lung: ['Blood type compatibility', 'Lung size', 'pTLC estimate'],
            heart: ['Blood type compatibility', 'Heart size', 'Urgency and match factors']
        };

        const hintsMarkup = (organHints[organ.toLowerCase()] || []).map((hint) => `<li>${hint}</li>`).join('');
        const fieldsMarkup = organ.toLowerCase() === 'lung'
            ? `
                <div class="form-grid">
                    <label class="full" for="bloodtype">Blood Type</label>
                    <select class="full" id="bloodtype" name="bloodtype" required>
                        <option value="">Select blood type</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>

                    <label class="full" for="size">Size of Lung (width x height)</label>
                    <input class="full" type="text" id="size" name="size" placeholder="Example: 12 x 18 cm" required />

                    <label class="full" for="ptlc">Predicted Total Lung Capacity</label>
                    <input class="full" type="number" id="ptlc" name="ptlc" placeholder="Liters" required />
                </div>
            `
            : organ.toLowerCase() === 'kidney'
                ? `
                <div class="form-grid">
                    <label class="full" for="bloodtype">Blood Type</label>
                    <select class="full" id="bloodtype" name="bloodtype" required>
                        <option value="">Select blood type</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>

                    <label class="full" for="hla">HLA Typing</label>
                    <input class="full" type="text" id="hla" name="hla" placeholder="Example: A2, B8, DR3" required />

                    <label class="full" for="size">Size of Kidney</label>
                    <input class="full" type="number" id="size" name="size" placeholder="Centimeters" required />
                </div>
            `
                : organ.toLowerCase() === 'heart'
                    ? `
                <div class="form-grid">
                    <label class="full" for="bloodtype">Blood Type</label>
                    <select class="full" id="bloodtype" name="bloodtype" required>
                        <option value="">Select blood type</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>

                    <label class="full" for="size">Size of Heart</label>
                    <input class="full" type="text" id="size" name="size" placeholder="Example: 13 x 11 cm" required />
                </div>
            `
                    : `
                <div class="form-grid">
                    <label class="full" for="bloodtype">Blood Type</label>
                    <select class="full" id="bloodtype" name="bloodtype" required>
                        <option value="">Select blood type</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>

                    <label class="full" for="size">Size of Liver</label>
                    <input class="full" type="text" id="size" name="size" placeholder="Example: 15 x 10 cm" required />
                </div>
            `;

        registerShell.innerHTML = `
            <div class="organ-detail">
                <article class="organ-detail-card">
                    <h2>${organName} Registration</h2>
                    <p>Fill in the details below to register this organ for matching.</p>
                </article>

                <article class="organ-detail-card">
                    <form id="${organ.toLowerCase()}-registration-form">
                        ${fieldsMarkup}
                        <div class="full">
                            <h3 style="margin: 0 0 0.45rem; color: #12312d;">What we’ll check</h3>
                            <ul class="hint-list">
                                ${hintsMarkup}
                            </ul>
                        </div>
                        <button type="submit" id="${organ.toLowerCase()}Submit">Register ${organName}</button>
                    </form>
                </article>
            </div>
        `;

        attachSubmit(`${organ.toLowerCase()}-registration-form`, organName);
    };

    organSelect.addEventListener('change', () => {
        const organ = organSelect.value;
        if (!organ) {
            alert('Please select an organ to register.');
            return;
        }

        renderOrganForm(organ);
    });
}


const attachSubmitFindMatch = (formId, organType) => {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = sessionStorage.getItem('username');
        const bloodtype = document.getElementById('bloodtype').value;
        const hla = document.getElementById('hla')?.value || null;
        const ptlc = document.getElementById('ptlc')?.value || null;
        try {
            const response = await fetch('/api/findmatches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    organ: organType.toLowerCase(),
                    bloodtype,
                    hla,
                    ptlc
                })
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                const matches = Array.isArray(data.matches) ? data.matches : [];
                const resultsEl = document.getElementById('matches-container');

                if (resultsEl) {
                    if (matches.length === 0) {
                        resultsEl.innerHTML = '<p>No matches found.</p>';
                    } else {
                        resultsEl.innerHTML = `
                            <style>
                                .matches-grid {
                                    display: grid;
                                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                                    gap: 1rem;
                                    margin-top: 1rem;
                                }

                                .match-tile {
                                    border: 1px solid #dbe3ea;
                                    border-radius: 18px;
                                    background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
                                    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
                                    overflow: hidden;
                                }

                                .match-name {
                                    margin: 0;
                                    padding: 1.1rem 1.1rem 0.9rem;
                                    font-size: 1.5rem;
                                    line-height: 1.15;
                                    font-weight: 800;
                                    color: #0f172a;
                                    border-bottom: 1px solid #e5eef5;
                                    background: linear-gradient(135deg, #effaf7 0%, #ffffff 75%);
                                }

                                .match-body {
                                    padding: 1rem 1.1rem 1.1rem;
                                    display: grid;
                                    gap: 0.85rem;
                                }

                                .match-section {
                                    padding: 0.9rem;
                                    border-radius: 14px;
                                    background: #ffffff;
                                    border: 1px solid #e6edf3;
                                }

                                .match-section h4 {
                                    margin: 0 0 0.45rem;
                                    font-size: 0.88rem;
                                    text-transform: uppercase;
                                    letter-spacing: 0.08em;
                                    color: #0f766e;
                                }

                                .match-section p {
                                    margin: 0.2rem 0;
                                    color: #334155;
                                    font-size: 0.96rem;
                                    line-height: 1.45;
                                }

                                .match-organ-list {
                                    margin: 0;
                                    padding-left: 1.1rem;
                                    color: #334155;
                                }
                            </style>
                            <h3>${organType} Matches</h3>
                            <div class="matches-grid">
                                ${matches.map((match) => `
                                    <article
                                        class="match-tile"
                                        data-email="${match.email ?? ''}"
                                        data-organ="${organType.toLowerCase()}"
                                        data-organ-id="${match.id ?? ''}"
                                        style="cursor: pointer;"
                                    >
                                        <h3 class="match-name">${match.first_name ?? ''} ${match.last_name ?? ''}</h3>
                                        <div class="match-body">
                                            <section class="match-section">
                                                <h4>Contact Info</h4>
                                                <p><strong>Email:</strong> ${match.email ?? ''}</p>
                                                <p><strong>Phone:</strong> ${match.phone_number ?? ''}</p>
                                                <p><strong>Country:</strong> ${match.country ?? ''}</p>
                                                <p><strong>Age:</strong> ${match.age ?? ''}</p>
                                            </section>
                                            <section class="match-section">
                                                <h4>Organ Details</h4>
                                                <p><strong>Blood Type:</strong> ${match.blood_type ?? ''}</p>
                                                <p><strong>Size:</strong> ${match.size ?? ''}</p>
                                                ${match.hla ? `<p><strong>HLA:</strong> ${match.hla}</p>` : ''}
                                                ${match.ptlc ? `<p><strong>pTLC:</strong> ${match.ptlc}</p>` : ''}
                                            </section>
                                        </div>
                                    </article>
                                `).join('')}
                            </div>
                        `;
                        // Attach click listeners to tiles after they're created
                        setTimeout(() => {
                            document.querySelectorAll('.match-tile').forEach(tile => {
                                tile.addEventListener('click', async () => {
                                    const email = tile.dataset.email;
                                    const organ = tile.dataset.organ;
                                    const organRecordId = tile.dataset.organId || null;
                                    const username = sessionStorage.getItem('username');
                                    if (!username) {
                                        alert('You must be logged in to contact a match. Redirecting to login page.');
                                        window.location.href = '/login_to_account';
                                        return;
                                    }
                                    if (!email || !organ) {
                                        alert('Unable to identify this match. Please refresh and try again.');
                                        return;
                                    }
                                    console.log(sessionStorage.getItem('id'), username, email, organ, organRecordId);
                                    // send a POST request to the server to trigger an email to the match
                                    const response = await fetch('/api/contactmatch', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ username, email, id: sessionStorage.getItem('id'), organ, organRecordId })
                                    });
                                    const data = await response.json().catch(() => ({}));
                                    if (response.ok) {
                                        alert(data.message);
                                    } else {
                                        alert(data.error || 'Failed to contact match. Please try again.');
                                    }
                                });
                            });
                        }, 50);

                    }
                }

                form.reset();
            } else {
                alert(data.error || `Failed to find matches for ${organType}. Please try again.`);
            }
        } catch (error) {
            console.error(`Error finding matches for ${organType}:`, error);
            alert(`An error occurred while finding matches for ${organType}. Please try again.`);
        }
    });
};

if (document.getElementById('match-with-donor-form')) {
    const organSelect = document.getElementById('match-organ');
    const matchFormContainer = document.querySelector('.match-panel .panel-body') || document.querySelector('.container');

    organSelect.addEventListener('change', () => {
        const organ = document.getElementById('match-organ').value;
        if (organ === '') {
            alert('Please select an organ to find matches for.');
            return;
        }
        if (!matchFormContainer) {
            console.error('Match form container not found.');
            return;
        }

        if (organ.trim() === 'liver') {
            const liverMatchFormHtml = `
                <h2>Liver Match Lookup</h2>
                <form id="liver-match-form">
                    <label for="bloodtype">Blood Type:</label>
                    <select id="bloodtype" name="bloodtype" required>
                        <option value="">Select blood type</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>
                    <button type="submit" id="liverMatchSubmit">Find Liver Matches</button>
                </form>
            `;

            matchFormContainer.innerHTML = liverMatchFormHtml;
            attachSubmitFindMatch('liver-match-form', 'Liver');
        } else if (organ.trim() === 'kidney') {
            const kidneyMatchFormHtml = `
                <h2>Kidney Match Lookup</h2>
                <form id="kidney-match-form">
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
                    <button type="submit" id="kidneyMatchSubmit">Find Kidney Matches</button>
                </form>
            `;

            matchFormContainer.innerHTML = kidneyMatchFormHtml;
            attachSubmitFindMatch('kidney-match-form', 'Kidney');
        } else if (organ.trim() === 'lung') {
            const lungMatchFormHtml = `
                <h2>Lung Match Lookup</h2>
                <form id="lung-match-form">
                    <label for="bloodtype">Blood Type:</label>
                    <select id="bloodtype" name="bloodtype" required>
                        <option value="">Select blood type</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>
                    <label for="ptlc">Predicted Total Lung Capacity (pTLC) (in liters):</label>
                    <input type="number" id="ptlc" name="ptlc" required>
                    <button type="submit" id="lungMatchSubmit">Find Lung Matches</button>
                </form>
            `;

            matchFormContainer.innerHTML = lungMatchFormHtml;
            attachSubmitFindMatch('lung-match-form', 'Lung');
        } else if (organ.trim() === 'heart') {
            const heartMatchFormHtml = `
                <h2>Heart Match Lookup</h2>
                <form id="heart-match-form">
                    <label for="bloodtype">Blood Type:</label>
                    <select id="bloodtype" name="bloodtype" required>
                        <option value="">Select blood type</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>
                    <button type="submit" id="heartMatchSubmit">Find Heart Matches</button>
                </form>
            `;

            matchFormContainer.innerHTML = heartMatchFormHtml;
            attachSubmitFindMatch('heart-match-form', 'Heart');
        }
    });
}

