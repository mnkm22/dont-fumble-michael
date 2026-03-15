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
// We create the Audio element up front so the browser has it ready.
// play() is called inside the click handler (user gesture).
// A floating ♪ toggle button appears on every screen after the first —
// this gives the user a visible way to start/stop music at any time,
// which also acts as a fallback if autoplay was silently blocked.
let bgMusic = null;
let musicEnabled = false;

function startMusic(play) {
    musicEnabled = play;
    if (play) {
        bgMusic = new Audio('music/it-aint-over.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.75;
        bgMusic.play();
    }
    showMusicToggle();
    nextScreen('screen-hero');
}

function showMusicToggle() {
    const btn = document.getElementById('music-toggle');
    if (btn) btn.style.display = 'flex';
}

function toggleMusic() {
    const btn = document.getElementById('music-toggle');
    if (bgMusic.paused) {
        bgMusic.play().catch(() => {});
        musicEnabled = true;
        if (btn) btn.textContent = '♪';
        if (btn) btn.title = 'Mute music';
    } else {
        bgMusic.pause();
        musicEnabled = false;
        if (btn) btn.textContent = '♪';
        if (btn) btn.style.opacity = '0.4';
        if (btn) btn.title = 'Play music';
    }
    if (btn) btn.style.opacity = bgMusic.paused ? '0.4' : '1';
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

// ── FIX 4: NO BUTTON ──
// Starts in normal document flow (in-line with other answers).
// Moves on hover up to MAX_DODGES times.
// After MAX_DODGES the onmouseover is removed and onclick is added
// so the button is finally clickable.
const MAX_DODGES = 3;
let dodgeCount = 0;

function dodgeNo() {
    const noBtn = document.getElementById('noBtn');
    if (!noBtn) return;

    dodgeCount++;

    if (dodgeCount >= MAX_DODGES) {
        // Stop running — remove the hover handler and make it clickable
        noBtn.onmouseover = null;
        noBtn.onclick = () => answer('final', 'no-means-yes', 'screen-loading');
        // Snap it back into flow one last time so it's findable
        noBtn.style.position = 'relative';
        noBtn.style.left = 'auto';
        noBtn.style.top = 'auto';
        noBtn.style.transition = 'none';
        noBtn.title = 'Fine. You win. 😤';
        return;
    }

    // Pull it out of flow and jump to a random spot
    const btnRect = noBtn.getBoundingClientRect();
    const maxX = window.innerWidth  - btnRect.width  - 20;
    const maxY = window.innerHeight - btnRect.height - 20;

    // Bias towards the opposite side of where the cursor likely is
    const randomX = Math.max(10, Math.random() * maxX);
    const randomY = Math.max(10, Math.random() * maxY);

    noBtn.style.position = 'fixed';
    noBtn.style.left = randomX + 'px';
    noBtn.style.top  = randomY + 'px';
    noBtn.style.transition = 'all 0.2s ease';
    noBtn.style.zIndex = '1000';
}

// Auto-advance loading → result after 3s
const loadingScreen = document.getElementById('screen-loading');
if (loadingScreen) {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.target.classList.contains('active')) {
                setTimeout(() => nextScreen('screen-result'), 3000);
            }
        });
    });
    observer.observe(loadingScreen, { attributes: true, attributeFilter: ['class'] });
}
