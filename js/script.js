/*
  Ankur Saini - AI Interactive Portfolio
  Main Script - Chat Logic, Animations, and Effects
*/

// ============================================
// BACKGROUND & CURSOR SETUP
// ============================================

const canvas = document.getElementById('gradient-bg');
const ctx = canvas.getContext('2d');
let canvasWidth, canvasHeight;

function resizeCanvas() {
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;
}

function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    grad.addColorStop(0, '#0a0a0a');
    grad.addColorStop(0.5, '#121212');
    grad.addColorStop(1, '#1a1a2e');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Particle animation
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const r = Math.random() * 2 + 0.5;
        ctx.fillStyle = `rgba(0,255,200,${Math.random() * 0.08})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    requestAnimationFrame(drawBackground);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawBackground();

// ============================================
// CUSTOM CURSOR
// ============================================

const cursor = document.getElementById('custom-cursor');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
});

// Enlarge cursor on interactive elements
const interactiveElements = '.send-btn, .quick-questions button';
document.addEventListener('mouseover', (e) => {
    if (e.target.matches(interactiveElements)) {
        cursor.classList.add('cursor-large');
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.matches(interactiveElements)) {
        cursor.classList.remove('cursor-large');
    }
});

// Background reaction to mouse
window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 15;
    const y = (e.clientY / window.innerHeight - 0.5) * 15;
    canvas.style.transform = `translate(${x}px, ${y}px)`;
});

// ============================================
// AI CHAT SYSTEM
// ============================================

let cvData = {};

// Load CV data from JSON
fetch('data/data.json')
    .then(response => response.json())
    .then(data => {
        cvData = data;
    })
    .catch(err => console.log('Data loaded with fallback', err));

// DOM Elements
const intro = document.getElementById('intro');
const chatSection = document.getElementById('chat');
const messagesEl = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const floatingTagsContainer = document.querySelector('.floating-tags');

// Transition from intro to chat
intro.addEventListener('animationend', () => {
    setTimeout(() => {
        intro.classList.add('hidden');
        chatSection.classList.remove('hidden');
        createFloatingTags();
        chatInput.focus();
    }, 800);
});

// Create floating skill tags
function createFloatingTags() {
    if (!cvData.skills || !floatingTagsContainer) return;
    
    cvData.skills.forEach(skill => {
        const tag = document.createElement('div');
        tag.className = 'floating-tag';
        tag.textContent = skill;
        tag.style.left = Math.random() * 100 + '%';
        tag.style.top = (50 + Math.random() * 100 * -1) + '%';
        tag.style.animationDuration = (5 + Math.random() * 8) + 's';
        tag.style.animationDelay = Math.random() * 2 + 's';
        floatingTagsContainer.appendChild(tag);
    });
}

// Chat message display
function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    
    if (type === 'ai' && text.includes('\n')) {
        const lines = text.split('\n');
        const summary = lines.shift();
        
        const summaryNode = document.createElement('div');
        summaryNode.textContent = summary;
        div.appendChild(summaryNode);
        
        const more = document.createElement('div');
        more.className = 'extra';
        more.textContent = lines.join('\n');
        more.style.display = 'none';
        
        const toggleBtn = document.createElement('span');
        toggleBtn.className = 'toggle-more';
        toggleBtn.textContent = ' (more)';
        toggleBtn.addEventListener('click', () => {
            const isHidden = more.style.display === 'none';
            more.style.display = isHidden ? 'block' : 'none';
            toggleBtn.textContent = isHidden ? ' (less)' : ' (more)';
        });
        
        div.appendChild(toggleBtn);
        div.appendChild(more);
    } else {
        div.textContent = text;
    }
    
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Add typing indicator
function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message ai';
    div.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
}

// Process user query
async function processQuery(query) {
    addMessage(query, 'user');
    
    const typingNode = addTypingIndicator();
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    
    if (typingNode && typingNode.parentNode) {
        typingNode.parentNode.removeChild(typingNode);
    }
    
    const answer = generateAnswer(query);
    addMessage(answer, 'ai');
}

// Generate answer based on query
function generateAnswer(query) {
    const q = query.toLowerCase();
    
    if (q.includes('project')) {
        const projects = cvData.projects ? cvData.projects.join(', ') : 'Check back soon for project details.';
        return `Here are the projects Ankur has worked on:\n${projects}`;
    }
    
    if (q.includes('technology') || q.includes('specialize') || q.includes('skill')) {
        if (!cvData.skills) return 'Unable to load skills data.';
        const skills = `Frontend: ${cvData.skills.slice(0, 5).join(', ')}\nTools: ${cvData.tools ? cvData.tools.slice(0, 3).join(', ') : 'N/A'}`;
        return skills;
    }
    
    if (q.includes('architecture') || q.includes('experience')) {
        if (!cvData.experience) return 'No experience data available.';
        let exp = 'Ankur\'s Professional Background:\n\n';
        cvData.experience.forEach(e => {
            exp += `${e.company} (${e.years})\n${e.details.join(', ')}\n\n`;
        });
        return exp;
    }
    
    if (q.includes('year') || q.includes('experience') && q.includes('many')) {
        return 'Ankur has 11+ years of professional experience in frontend development, UI systems, and digital architecture.';
    }
    
    if (q.includes('education')) {
        if (!cvData.education) return 'Education details not available.';
        return `Education:\n${cvData.education.join('\n')}`;
    }
    
    if (q.includes('tool')) {
        if (!cvData.tools) return 'No tools data available.';
        return `Design & Development Tools:\n${cvData.tools.join(', ')}`;
    }
    
    // Default fallback
    return "I'm Ankur's digital AI assistant. I can answer questions about his experience, skills, projects, tools, and education. Try asking me something specific!";
}

// Chat form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    
    if (!query) return;
    
    chatInput.value = '';
    await processQuery(query);
});

// Quick question buttons
document.querySelectorAll('.quick-questions button').forEach(btn => {
    btn.addEventListener('click', async () => {
        const query = btn.dataset.q;
        await processQuery(query);
    });
});

// Allow Enter key to submit (ensure no duplicate submission)
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

// ============================================
// OPENAI INTEGRATION (Placeholder)
// ============================================

async function callOpenAI(prompt) {
    // Placeholder for OpenAI integration
    // Replace with actual API call when ready:
    // const response = await fetch('/api/openai', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ prompt })
    // });
    // return response.json();
    return { text: 'OpenAI integration ready. Configure API endpoint when needed.' };
}

console.log('✨ Ankur Saini AI Portfolio Ready');
