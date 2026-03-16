// Store user answers and score
const userData = { answers: {}, score: 0 };

// Screen navigation
function nextScreen(screenId) {
    const currentScreen = document.querySelector('.screen.active');
    const next = document.getElementById(screenId);
    if (currentScreen) currentScreen.classList.remove('active');
    if (next) next.classList.add('active');
    window.scrollTo(0, 0);
}

// ── MUSIC ──
let bgMusic = null;

function startMusic(play) {
    if (play) {
        bgMusic = new Audio('https://mnkm22.github.io/dont-fumble/it-aint-over.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.75;
        bgMusic.play().then(() => updateToggle()).catch(() => updateToggle());
    }
    const btn = document.getElementById('music-toggle');
    if (btn) btn.style.display = 'block';
    updateToggle();
    nextScreen('screen-hero');
}

function updateToggle() {
    const btn = document.getElementById('music-toggle');
    if (!btn) return;
    const playing = bgMusic && !bgMusic.paused;
    btn.style.opacity = playing ? '1' : '0.5';
    btn.textContent = playing ? '♪ music' : '♪ muted';
    btn.title = playing ? 'Mute music' : 'Play music';
}

function toggleMusic() {
    if (!bgMusic) {
        bgMusic = new Audio('https://mnkm22.github.io/dont-fumble/it-aint-over.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.75;
    }
    if (bgMusic.paused) {
        bgMusic.play().then(() => updateToggle()).catch(() => updateToggle());
    } else {
        bgMusic.pause();
        updateToggle();
    }
}

// Answer handler with scoring
function answer(question, value, nextScreenId) {
    userData.answers[question] = value;
    let points = 0;
    if (question === 'q2') {
        if (value === 'real') points = 30;
        else if (value === 'intentional') points = 25;
        else if (value === 'open') points = 15;
        else points = 5;
    }
    if (question === 'q3') {
        if (value === 'yes') points = 30;
        else if (value === 'mostly') points = 20;
        else if (value === 'chaotic') points = 10;
    }
    if (question === 'q4') points = 15;
    if (question === 'q5') points = value === 'conditional' ? 5 : 15;
    if (question === 'q6') points = 10;
    userData.score += points;
    if (nextScreenId) nextScreen(nextScreenId);
}

// ── ALT CONTACT ──
// Toggles the alternative contact field and swaps Instagram to optional
function toggleAltContact() {
    const altField = document.getElementById('alt-contact-field');
    const igField  = document.getElementById('instagram-field');
    const altInput = document.getElementById('alt-contact-input');
    const visible  = altField.style.display === 'block';

    if (visible) {
        altField.style.display = 'none';
        altInput.required = false;
        igField.required = true;
        igField.placeholder = 'Your Instagram handle';
    } else {
        altField.style.display = 'block';
        altInput.required = true;
        igField.required = false;
        igField.placeholder = 'Instagram (optional)';
    }
}

// Saves custom date idea before navigating away
function submitCustomDate() {
    const input = document.getElementById('date-suggestion');
    const value = input ? input.value.trim() : '';
    if (value) userData.answers['custom_date_idea'] = value;
    nextScreen('screen-q5');
}

// Date checkbox handlers
const dateInputs = document.querySelectorAll('.date-input');
dateInputs.forEach(input => {
    input.addEventListener('change', () => {
        userData.answers.dates = Array.from(dateInputs)
            .filter(i => i.checked).map(i => i.value);
    });
});

// Form submission
const form = document.getElementById('date-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('answersField').value = JSON.stringify(userData.answers);
        document.getElementById('scoreField').value = userData.score;
        const formData = new FormData(form);
        for (let key in userData.answers) {
            formData.append(key, key === 'dates'
                ? userData.answers[key].join(', ')
                : userData.answers[key]);
        }
        try {
            const res = await fetch(form.action, {
                method: 'POST', body: formData,
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) { nextScreen('thank-you'); startConfetti(); }
            else alert('Oops! Something went wrong. Try again?');
        } catch { alert('Oops! Something went wrong. Try again?'); }
    });
}

// Confetti
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#ff00cc', '#00cfcf', '#aaff00', '#ffff00', '#ff6600', '#9b00ff'];
    const pieces = Array.from({ length: 160 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 7 + 3,
        d: Math.random() * 160,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0
    }));
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(c => {
            ctx.beginPath(); ctx.lineWidth = c.r / 2;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + c.r, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
            ctx.stroke();
        });
        pieces.forEach((c, i) => {
            c.tiltAngle += c.tiltAngleIncremental;
            c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
            c.tilt = Math.sin(c.tiltAngle - i / 3) * 15;
            if (c.y > canvas.height) {
                pieces[i] = { ...c, x: Math.random() * canvas.width, y: -10 };
            }
        });
    }
    setInterval(draw, 33);
}

// ── NO BUTTON ──
const MAX_DODGES = 5;
let dodgeCount = 0;

function resetNoBtn() {
    dodgeCount = 0;
    const noBtn = document.getElementById('noBtn');
    if (!noBtn) return;
    noBtn.removeAttribute('style');
    noBtn.style.position = 'relative';
    noBtn.onmouseover = null;
    noBtn.onclick = null;
    noBtn.title = '';
    noBtn.removeEventListener('touchstart', handleNoBtnTouch);
    setTimeout(() => {
        noBtn.onmouseover = dodgeNo;
        noBtn.addEventListener('touchstart', handleNoBtnTouch, { passive: false });
    }, 50);
}

function handleNoBtnTouch(e) {
    if (dodgeCount < MAX_DODGES) {
        e.preventDefault();
        dodgeNo();
    }
}

const finalScreen = document.getElementById('screen-final');
if (finalScreen) {
    const finalObserver = new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.target.classList.contains('active')) resetNoBtn();
        });
    });
    finalObserver.observe(finalScreen, { attributes: true, attributeFilter: ['class'] });
}

function dodgeNo() {
    const noBtn = document.getElementById('noBtn');
    if (!noBtn) return;

    dodgeCount++;

    // Get the bounding box of the answer options to avoid covering them
    const optionsBox = document.getElementById('final-options');
    const avoid = optionsBox ? optionsBox.getBoundingClientRect() : null;

    const btnW = 220;
    const btnH = 50;
    let randomX, randomY;
    let attempts = 0;

    do {
        randomX = Math.max(10, Math.random() * (window.innerWidth  - btnW - 20));
        randomY = Math.max(10, Math.random() * (window.innerHeight - btnH - 20));
        attempts++;
        // If we can't find a clear spot after 20 tries, just place it anywhere
        if (attempts > 20) break;
        // Check if it overlaps the options area
        const overlaps = avoid &&
            randomX < avoid.right + 10 &&
            randomX + btnW > avoid.left - 10 &&
            randomY < avoid.bottom + 10 &&
            randomY + btnH > avoid.top - 10;
        if (!overlaps) break;
    } while (true);

    noBtn.style.position = 'fixed';
    noBtn.style.left = randomX + 'px';
    noBtn.style.top  = randomY + 'px';
    noBtn.style.transition = 'all 0.2s ease';
    noBtn.style.zIndex = '1000';
    noBtn.style.width = btnW + 'px';

    if (dodgeCount >= MAX_DODGES) {
        noBtn.onmouseover = null;
        noBtn.removeEventListener('touchstart', handleNoBtnTouch);
        noBtn.onclick = () => answer('final', 'no-means-yes', 'screen-loading');
        noBtn.title = 'Fine. You win. 😤';
    }
}

// Auto-advance loading → result after 5s
const loadingScreen = document.getElementById('screen-loading');
if (loadingScreen) {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.target.classList.contains('active')) {
                setTimeout(() => nextScreen('screen-result'), 5000);
            }
        });
    });
    observer.observe(loadingScreen, { attributes: true, attributeFilter: ['class'] });
}
