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
function answer(question, value) {
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
  
  // Question 1: Vibe (low weight)
  if (question === 'q1') {
    points = 5;
  }
  
  // Final question
  if (question === 'final') {
    if (value === 'yes' || value === 'snacks') points = 10;
    else if (value === 'convince') points = 5;
  }
  
  userData.score += points;
  
  // Navigate to next screen
  const flowMap = {
    'q1': 'meme-1',
    'q2': 'meme-2',
    'q3': 'meme-3',
    'q4': 'screen-q5',
    'q5': 'meme-4',
    'final': 'screen-loading'
  };
  
  if (flowMap[question]) {
    setTimeout(() => {
      nextScreen(flowMap[question]);
      
      // Auto-progress from loading to result after 3 seconds
      if (question === 'final') {
        setTimeout(() => {
          prepareResults();
          nextScreen('screen-result');
        }, 3000);
      }
    }, 300);
  }
}

// Dodging "No" button
let dodgeCount = 0;
function dodgeNo() {
  const btn = document.getElementById('noBtn');
  
  if (dodgeCount === 0) {
    // First click: move button
    const randomX = Math.random() * 200 - 100;
    const randomY = Math.random() * 200 - 100;
    btn.style.transform = `translate(${randomX}px, ${randomY}px)`;
    dodgeCount++;
  } else {
    // Second click: give up and proceed
    answer('final', 'reluctant');
  }
}

// Prepare final results for submission
function prepareResults() {
  // Get calendar availability
  const checkboxes = document.querySelectorAll('input[name="availability"]:checked');
  const availability = Array.from(checkboxes).map(cb => cb.value);
  userData.answers.availability = availability.join(', ');
  
  // Populate hidden form fields
  document.getElementById('answersField').value = JSON.stringify(userData.answers);
  document.getElementById('scoreField').value = userData.score;
}

// Form submission handler
const form = document.getElementById('finalForm');
if (form) {
  form.addEventListener('submit', function(e) {
    // Form will submit naturally to Formspree
    // Formspree will redirect or show confirmation
  });
}
