// Store user answers and score
const userData = {
    answers: {},
    score: 0
};

// Screen navigation
function nextScreen(screenId) {
    const currentScreen = document.querySelector('.screen.active');
    const nextScreen = document.getElementById(screenId);

    if (currentScreen) currentScreen.classList.remove('active');
    if (nextScreen) nextScreen.classList.add('active');

    window.scrollTo(0, 0);
}

// Answer handler with scoring
function answer(question, value, nextScreenId) {
    userData.answers[question] = value;

    // Calculate score based on answer
    let points = 0;

    // Question 2: Intent (high weight)
    if (question === 'q2') {
        if (value === 'real') points = 30;
        else if (value === 'intentional') points = 25;
        else if (value === 'open') points = 15;
        else points = 5;
    }

    // Question 3: Availability (high weight)
    if (question === 'q3') {
        if (value === 'yes') points = 30;
        else if (value === 'mostly') points = 20;
        else if (value === 'chaotic') points = 10;
        else points = 0;
    }

    // Question 4: Date style (medium weight)
    if (question === 'q4') {
        points = 15;
    }

    // Question 5: Weekend preference (medium weight)
    if (question === 'q5') {
        if (value === 'conditional') points = 5;
        else points = 15;
    }

    // Question 6: First date (low weight)
    if (question === 'q6') {
        points = 10;
    }

    userData.score += points;
        
    // Navigate to the next screen
    if (nextScreenId) {
        nextScreen(nextScreenId);
    }
}

// Date input handlers
const dateInputs = document.querySelectorAll('.date-input');
dateInputs.forEach(input => {
    input.addEventListener('change', () => {
        const selectedDates = Array.from(dateInputs)
            .filter(inp => inp.checked)
            .map(inp => inp.value);
        userData.answers.dates = selectedDates;
    });
});

// Form submission with Formspree
const form = document.getElementById('date-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        // Add stored answers to form data
        for (let key in userData.answers) {
            if (key === 'dates') {
                formData.append(key, userData.answers[key].join(', '));
            } else {
                formData.append(key, userData.answers[key]);
            }
        }
        
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Show custom thank you screen instead of redirecting
                nextScreen('thank-you');
                startConfetti();
            } else {
                alert('Oops! Something went wrong. Try again?');
            }
        } catch (error) {
            alert('Oops! Something went wrong. Try again?');
        }
    });
}

// Confetti animation for thank you screen
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const confettiCount = 150;
    const colors = ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7'];
    
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * confettiCount,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((c, i) => {
            ctx.beginPath();
            ctx.lineWidth = c.r / 2;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + c.r, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
            ctx.stroke();
        });
        
        update();
    }
    
    function update() {
        confetti.forEach((c, i) => {
            c.tiltAngle += c.tiltAngleIncremental;
            c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
            c.tilt = Math.sin(c.tiltAngle - i / 3) * 15;
            
            if (c.y > canvas.height) {
                confetti[i] = {
                    x: Math.random() * canvas.width,
                    y: -10,
                    r: c.r,
                    d: c.d,
                    color: c.color,
                    tilt: c.tilt,
                    tiltAngleIncremental: c.tiltAngleIncremental,
                    tiltAngle: c.tiltAngle
                };
            }
        });
    }
    
    setInterval(draw, 33);
}

// Dodge No button functionality
// Track number of dodges
let dodgeCount = 0;

function dodgeNo() {
        // Only dodge three times, then allow click        if (dodgeCount >= 3) {        answer('final', 'no-means-yes', 'screen-loading');
        return;
    }
    
    dodgeCount++;
    
    const noBtn = document.getElementById('noBtn');
    const randomX = Math.random() * (window.innerWidth - 200);
    const randomY = Math.random() * (window.innerHeight - 100);
    
    noBtn.style.position = 'fixed';
    noBtn.style.left = randomX + 'px';
    noBtn.style.top = randomY + 'px';
    noBtn.style.transition = 'all 0.3s ease';
}

// Auto-advance from loading screen to result screen
const loadingScreen = document.getElementById('screen-loading');
if (loadingScreen) {
    // Detect when loading screen becomes active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                // Wait 3 seconds then show result screen
                setTimeout(() => {
                    nextScreen('screen-result');
                }, 3000);
            }
        });
    });
    
    observer.observe(loadingScreen, {
        attributes: true,
        attributeFilter: ['class']
    });
}
