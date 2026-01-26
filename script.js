const API_KEY = 'AIzaSyCscm2cNoVYd7aAujKav5RX4mUpzTQvZUk';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Statistika
let stats = {
    userMessages: 0,
    botMessages: 0,
    totalMessages: 1,
    startTime: Date.now(),
    totalCharacters: 0,
};

let chatHistory = [];
let darkMode = localStorage.getItem('darkMode') === 'true' || false;
let currentPersonality = localStorage.getItem('personality') || 'normal';

const personalities = {
    normal: { emoji: '🤖', name: 'Normalna', prompt: '' },
    humorous: { emoji: '😄', name: 'Humor', prompt: 'Odgovori sa humorom i puno šala. ' },
    formal: { emoji: '🎩', name: 'Formalna', prompt: 'Odgovori formalno i profesionalno. ' },
    poetic: { emoji: '✨', name: 'Poetska', prompt: 'Odgovori poetski i metaforički. ' },
    sarcastic: { emoji: '😏', name: 'Sarkastična', prompt: 'Odgovori sarkastično i sa dosetkom. ' },
    motivational: { emoji: '💪', name: 'Motivacijska', prompt: 'Motiviraj korisnika sa inspirativnim odgovorerom. ' }
};

// Inicijalizacija
document.addEventListener('DOMContentLoaded', () => {
    if (darkMode) enableDarkMode();
    setupEventListeners();
    updateStats();
    startTimer();
    updatePersonalityUI();
});

function setupEventListeners() {
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Header buttons
    document.getElementById('statsBtn').addEventListener('click', openStatsModal);
    document.getElementById('gameBtn').addEventListener('click', openGameModal);
    document.getElementById('darkModeBtn').addEventListener('click', toggleDarkMode);
    document.getElementById('clearBtn').addEventListener('click', clearChat);
    document.getElementById('voiceBtn').addEventListener('click', startVoiceInput);
    document.getElementById('searchBtn').addEventListener('click', openSearchModal);
    document.getElementById('translatorBtn').addEventListener('click', openTranslatorModal);
    document.getElementById('personalityBtn').addEventListener('click', openPersonalityModal);

    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('show');
        });
    });

    // Stats modal buttons
    document.getElementById('downloadBtn').addEventListener('click', downloadChat);
    document.getElementById('copyBtn').addEventListener('click', copyAllChat);

    // Personality buttons
    document.querySelectorAll('.personality-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const personality = e.target.closest('.personality-btn').dataset.personality;
            setPersonality(personality);
        });
    });

    // Translator
    document.getElementById('translateBtn').addEventListener('click', translateChat);

    // Search
    document.getElementById('searchInput').addEventListener('input', performSearch);

    // Copy on message click
    chatBox.addEventListener('click', (e) => {
        if (e.target.closest('.message-content')) {
            const text = e.target.closest('.message-content').innerText;
            navigator.clipboard.writeText(text);
            showNotification('📋 Poruka kopirana!');
        }
    });
}

// Dark Mode
function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
}

// Add Message
function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p>${sanitizeHTML(text)}</p>`;
    
    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    chatHistory.push({ text, isUser });

    if (isUser) {
        stats.userMessages++;
        stats.totalCharacters += text.length;
    } else {
        stats.botMessages++;
        stats.totalCharacters += text.length;
    }
    stats.totalMessages++;
    updateStats();
}

function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Animacija typing
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing';
    typingDiv.innerHTML = '<div class="message-content"><p class="loading"><span></span><span></span><span></span></p></div>';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
}

// Pošalji poruku botu
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    userInput.value = '';
    
    showTyping();
    
    try {
        const personalityPrompt = personalities[currentPersonality].prompt;
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: personalityPrompt + message }]
                }]
            })
        });
        
        const data = await response.json();
        removeTyping();
        
        if (data.candidates && data.candidates[0].content) {
            const botResponse = data.candidates[0].content.parts[0].text;
            addMessage(botResponse, false);
            playNotificationSound();
        } else {
            addMessage('Nisam mogao da generišem odgovor.', false);
        }
    } catch (error) {
        removeTyping();
        addMessage('Greška: ' + error.message, false);
    }
}

// Voice Input
function startVoiceInput() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'sr-RS';
    
    document.getElementById('voiceBtn').style.opacity = '0.5';
    
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        userInput.value = transcript;
        document.getElementById('voiceBtn').style.opacity = '1';
        sendMessage();
    };
    
    recognition.onerror = () => {
        document.getElementById('voiceBtn').style.opacity = '1';
    };
    
    recognition.start();
}

// Stats
function updateStats() {
    document.getElementById('messageCount').textContent = stats.totalMessages;
    document.getElementById('statMessages').textContent = stats.totalMessages;
    document.getElementById('statUserMessages').textContent = stats.userMessages;
    document.getElementById('statBotMessages').textContent = stats.botMessages;
    
    const avgLength = stats.userMessages > 0 ? Math.round(stats.totalCharacters / stats.totalMessages) : 0;
    document.getElementById('statAvgLength').textContent = avgLength + ' znakova';
}

function startTimer() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - stats.startTime) / 1000);
        document.getElementById('chatTime').textContent = formatTime(elapsed);
        document.getElementById('statChatTime').textContent = formatTime(elapsed);
    }, 1000);
}

function formatTime(seconds) {
    if (seconds < 60) return seconds + 's';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm';
    const hours = Math.floor(minutes / 60);
    return hours + 'h';
}

// Clear Chat
function clearChat() {
    if (confirm('Sigurno želiš da obrišeš sav chat?')) {
        chatBox.innerHTML = '<div class="message bot-message"><div class="message-content"><p>Čikk čikk! 🦗 Chat je obrisan. Počni ispočetka!</p></div></div>';
        chatHistory = [];
        stats = { userMessages: 0, botMessages: 0, totalMessages: 1, startTime: Date.now(), totalCharacters: 0 };
        updateStats();
        showNotification('🗑️ Chat obrisan!');
    }
}

// Download Chat
function downloadChat() {
    let content = 'Grasshopper AI Chat Log\n';
    content += 'Vreme: ' + new Date().toLocaleString() + '\n\n';
    
    chatHistory.forEach(msg => {
        content += (msg.isUser ? 'Ti: ' : 'Bot: ') + msg.text + '\n\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grasshopper-chat.txt';
    a.click();
    showNotification('💾 Chat preuzet!');
}

// Copy All Chat
async function copyAllChat() {
    let content = '';
    chatHistory.forEach(msg => {
        content += (msg.isUser ? 'Ti: ' : 'Bot: ') + msg.text + '\n\n';
    });
    
    await navigator.clipboard.writeText(content);
    showNotification('📋 Sve poruke kopirane!');
}

// Modals
function openStatsModal() {
    document.getElementById('statsModal').classList.add('show');
}

function openGameModal() {
    document.getElementById('gameModal').classList.add('show');
    setTimeout(() => initGame(), 100);
}

// Sound
function playNotificationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Notification
function showNotification(text) {
    const notif = document.createElement('div');
    notif.style.cssText = 'position:fixed;top:20px;right:20px;background:#4a7c2c;color:white;padding:12px 20px;border-radius:10px;z-index:2000;animation:slideUp 0.3s ease;';
    notif.textContent = text;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

// Game - Grasshopper Jump
let gameRunning = false;
let gameScore = 0;
let currentGame = 'jump';

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const startBtn = document.getElementById('gameStartBtn');
    startBtn.textContent = 'Počni Igru';
    
    // Game selection
    document.getElementById('selectJump').addEventListener('click', () => {
        currentGame = 'jump';
        document.querySelectorAll('.game-select-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('selectJump').classList.add('active');
    });
    
    document.getElementById('selectFlappy').addEventListener('click', () => {
        currentGame = 'flappy';
        document.querySelectorAll('.game-select-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('selectFlappy').classList.add('active');
    });
    
    startBtn.onclick = () => {
        if (!gameRunning) {
            gameRunning = true;
            gameScore = 0;
            startBtn.textContent = 'Igra je u toku...';
            if (currentGame === 'jump') {
                playJumpGame(ctx, canvas);
            } else {
                playFlappyGame(ctx, canvas);
            }
        }
    };
}

function playJumpGame(ctx, canvas) {
    const grasshopper = {
        x: canvas.width / 2,
        y: canvas.height - 50,
        width: 30,
        height: 30,
        velocityX: 0
    };
    
    const obstacles = [];
    let frameCount = 0;
    
    function drawGrasshopper() {
        ctx.fillStyle = '#4a7c2c';
        ctx.fillRect(grasshopper.x - grasshopper.width / 2, grasshopper.y - grasshopper.height / 2, grasshopper.width, grasshopper.height);
        ctx.font = 'bold 20px Arial';
        ctx.fillText('🦗', grasshopper.x - 10, grasshopper.y + 10);
    }
    
    function drawObstacles() {
        ctx.fillStyle = '#d4a574';
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
    }
    
    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        grasshopper.x += grasshopper.velocityX;
        grasshopper.velocityX *= 0.9;
        
        if (grasshopper.x - grasshopper.width / 2 < 0) grasshopper.x = grasshopper.width / 2;
        if (grasshopper.x + grasshopper.width / 2 > canvas.width) grasshopper.x = canvas.width - grasshopper.width / 2;
        
        frameCount++;
        if (frameCount % 60 === 0) {
            obstacles.push({
                x: Math.random() * (canvas.width - 40),
                y: -20,
                width: 40,
                height: 20,
                speed: 3 + gameScore / 100
            });
        }
        
        obstacles.forEach((obs, index) => {
            obs.y += obs.speed;
            
            if (obs.x < grasshopper.x + grasshopper.width / 2 &&
                obs.x + obs.width > grasshopper.x - grasshopper.width / 2 &&
                obs.y < grasshopper.y + grasshopper.height / 2 &&
                obs.y + obs.height > grasshopper.y - grasshopper.height / 2) {
                gameRunning = false;
                document.getElementById('gameScore').textContent = `Rezultat: ${gameScore}`;
                document.getElementById('gameStartBtn').textContent = 'Ponovo Igraj';
                return;
            }
            
            if (obs.y > canvas.height) {
                obstacles.splice(index, 1);
                gameScore++;
                document.getElementById('gameScore').textContent = `Rezultat: ${gameScore}`;
            }
        });
        
        drawGrasshopper();
        drawObstacles();
        
        if (gameRunning) {
            requestAnimationFrame(updateGame);
        }
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') grasshopper.velocityX = -5;
        if (e.key === 'ArrowRight') grasshopper.velocityX = 5;
    });
    
    updateGame();
}

// Personality
function setPersonality(personality) {
    currentPersonality = personality;
    localStorage.setItem('personality', personality);
    updatePersonalityUI();
    const info = personalities[personality];
    document.getElementById('personalityInfo').innerHTML = `<strong>${info.emoji} ${info.name}</strong><br>Bot će sada odgovarati sa ovom ličnošću.`;
    showNotification(`✨ Ličnost promenjena na: ${info.name}`);
}

function updatePersonalityUI() {
    document.querySelectorAll('.personality-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.personality === currentPersonality) {
            btn.classList.add('active');
        }
    });
    const info = personalities[currentPersonality];
    document.getElementById('personalityInfo').innerHTML = `<strong>${info.emoji} ${info.name}</strong><br>Trenutna ličnost bota je postavljena.`;
}

// Search
function openSearchModal() {
    document.getElementById('searchModal').classList.add('show');
    document.getElementById('searchInput').focus();
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    
    if (!query) {
        resultsDiv.innerHTML = '';
        return;
    }
    
    const results = chatHistory.filter(msg => 
        msg.text.toLowerCase().includes(query)
    );
    
    resultsDiv.innerHTML = results.map((msg, idx) => `
        <div class="search-item">
            <div class="search-item-user">${msg.isUser ? 'Ti' : 'Bot'}:</div>
            <div>${msg.text.substring(0, 100)}${msg.text.length > 100 ? '...' : ''}</div>
            <div class="search-item-time">#${chatHistory.indexOf(msg) + 1}</div>
        </div>
    `).join('');
}

// Translator
function openTranslatorModal() {
    document.getElementById('translatorModal').classList.add('show');
}

async function translateChat() {
    const lang = document.getElementById('translatorLang').value;
    const resultsDiv = document.getElementById('translationResults');
    resultsDiv.innerHTML = '<p>Prevođenje...</p>';
    
    const translations = [];
    
    for (const msg of chatHistory) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-goog-api-key': API_KEY
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `Prevedi na sledeći jezik kod: ${lang}. Prevedi samo tekst, bez dodatnog teksta:\n${msg.text}` }]
                    }]
                })
            });
            
            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                const translatedText = data.candidates[0].content.parts[0].text;
                translations.push({ original: msg.text, translated: translatedText, isUser: msg.isUser });
            }
        } catch (error) {
            console.error('Greška pri prevodu:', error);
        }
    }
    
    resultsDiv.innerHTML = translations.map(t => `
        <div class="translation-item">
            <div class="translation-original"><strong>${t.isUser ? 'Ti' : 'Bot'}:</strong> ${t.original.substring(0, 80)}...</div>
            <div class="translation-text">${t.translated}</div>
        </div>
    `).join('');
}

// Modals
function openStatsModal() {
    document.getElementById('statsModal').classList.add('show');
}

function openGameModal() {
    document.getElementById('gameModal').classList.add('show');
    setTimeout(() => initGame(), 100);
}

function openPersonalityModal() {
    document.getElementById('personalityModal').classList.add('show');
}

// Flappy Bird Game
function playFlappyGame(ctx, canvas) {
    const bird = {
        x: canvas.width / 4,
        y: canvas.height / 2,
        width: 25,
        height: 25,
        velocityY: 0,
        gravity: 0.4,
        jumpPower: -8
    };
    
    const pipes = [];
    let frameCount = 0;
    const pipeGap = 120;
    const pipeWidth = 60;
    
    function drawBird() {
        ctx.fillStyle = '#4a7c2c';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 16px Arial';
        ctx.fillText('🦗', bird.x - 8, bird.y + 6);
    }
    
    function drawPipes() {
        ctx.fillStyle = '#8B4513';
        pipes.forEach(pipe => {
            // Gornja cev
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
            // Donja cev
            ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap);
        });
    }
    
    function updateFlappyGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Gravitacija
        bird.velocityY += bird.gravity;
        bird.y += bird.velocityY;
        
        // Granice
        if (bird.y - bird.width / 2 < 0 || bird.y + bird.width / 2 > canvas.height) {
            gameRunning = false;
            document.getElementById('gameScore').textContent = `Rezultat: ${gameScore}`;
            document.getElementById('gameStartBtn').textContent = 'Ponovo Igraj';
            return;
        }
        
        // Generisanje cevi
        frameCount++;
        if (frameCount % 90 === 0) {
            const topHeight = Math.random() * (canvas.height - pipeGap - 80) + 40;
            pipes.push({
                x: canvas.width,
                topHeight: topHeight,
                scored: false
            });
        }
        
        // Ažuriranje cevi
        pipes.forEach((pipe, idx) => {
            pipe.x -= 4;
            
            // Kolizija
            if (bird.x + bird.width / 2 > pipe.x &&
                bird.x - bird.width / 2 < pipe.x + pipeWidth) {
                if (bird.y - bird.width / 2 < pipe.topHeight ||
                    bird.y + bird.width / 2 > pipe.topHeight + pipeGap) {
                    gameRunning = false;
                    document.getElementById('gameScore').textContent = `Rezultat: ${gameScore}`;
                    document.getElementById('gameStartBtn').textContent = 'Ponovo Igraj';
                    return;
                }
            }
            
            // Scoring
            if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
                gameScore++;
                pipe.scored = true;
                document.getElementById('gameScore').textContent = `Rezultat: ${gameScore}`;
            }
            
            // Uklanjanje cevi
            if (pipe.x + pipeWidth < 0) {
                pipes.splice(idx, 1);
            }
        });
        
        drawBird();
        drawPipes();
        
        if (gameRunning) {
            requestAnimationFrame(updateFlappyGame);
        }
    }
    
    // Kontrole
    const handleJump = () => {
        if (gameRunning) {
            bird.velocityY = bird.jumpPower;
        }
    };
    
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'ArrowUp') {
            e.preventDefault();
            handleJump();
        }
    });
    
    canvas.addEventListener('click', handleJump);
    
    updateFlappyGame();
}
