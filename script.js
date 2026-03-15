// Form submission handler
const form = document.getElementById('date-form');
const loadingScreen = document.getElementById('screen-loading');
const resultScreen = document.getElementById('screen-result');

// Handle form submission
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect all answers
        const formData = new FormData(form);
        const answers = {};
        
        for (let [key, value] of formData.entries()) {
            if (key.startsWith('q') || key === 'custom_date_idea' || key === 'availability' || key === 'name' || key === 'instagram') {
                answers[key] = value;
            }
        }
        
        // Set the answers field
        document.getElementById('answersField').value = JSON.stringify(answers);
        
        // Hide form and show loading screen
        form.style.display = 'none';
        document.querySelector('.hero-section').style.display = 'none';
        loadingScreen.style.display = 'block';
        
        // Simulate calculation time
        setTimeout(() => {
            // Submit the form to Formspree
            const formDataToSubmit = new FormData(form);
            
            fetch(form.action, {
                method: 'POST',
                body: formDataToSubmit,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                // Hide loading, show result
                loadingScreen.style.display = 'none';
                resultScreen.style.display = 'block';
                
                // Trigger confetti
                createConfetti();
            }).catch(error => {
                console.log('Form submission error:', error);
                // Still show result screen even if submission fails
                loadingScreen.style.display = 'none';
                resultScreen.style.display = 'block';
                createConfetti();
            });
        }, 3000);
    });
}

// Confetti animation
function createConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiPieces = [];
    const confettiCount = 150;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8'];
    
    class ConfettiPiece {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 10 + 5;
            this.speedY = Math.random() * 3 + 2;
            this.speedX = Math.random() * 2 - 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
        }
        
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;
            
            if (this.y > canvas.height) {
                this.y = -10;
                this.x = Math.random() * canvas.width;
            }
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }
    
    for (let i = 0; i < confettiCount; i++) {
        confettiPieces.push(new ConfettiPiece());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiPieces.forEach(piece => {
            piece.update();
            piece.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Background music (optional - can be removed if not using)
const backgroundMusic = document.getElementById('background-music');
if (backgroundMusic) {
    // Auto-play is usually blocked by browsers, so this is optional
    document.addEventListener('click', function playMusic() {
        backgroundMusic.play().catch(err => console.log('Audio play prevented:', err));
        document.removeEventListener('click', playMusic);
    }, { once: true });
}
