// ===== API CONFIGURATION =====
// ⚠️ SECURITY: NIKADA ne hardkoduj API ključ u javnom kodu!
// Koristi .env.local fajl koji je u .gitignore
let API_KEY = '';
let API_URL = '';

// Inicijalizuj API na osnovu učitanog configa
function initializeAPI() {
    API_KEY = config.apiKey || '';
    API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-1.5-flash'}:generateContent`;
    console.log('🔧 API inicijalizovan:', { 
        hasKey: !!API_KEY, 
        keyPreview: API_KEY ? API_KEY.substring(0, 10) + '...' : 'NEMA',
        model: config.model,
        fullUrl: API_URL 
    });
}

// ===== EMOJI PICKER DATA =====
const emojis = [
    '😊','😂','😍','❤️','🔥','👍','🎉','💪',
    '🚀','😎','🤔','👏','✅','❌','⚡','🎯',
    '💰','🦗','🌟','💡','📱','💻','🎮','🎨',
    '🍕','☕','🏆','🎁','📊','🔔','💯','🙌',
    '😢','😡','🥳','🤗','🙏','💚','🌈','⭐',
    '📈','💼','🎓','✈️','🏠','🎵','📷','🎬'
];

// ===== SESSION MANAGEMENT =====
let sessions = JSON.parse(localStorage.getItem('chatSessions')) || [];
let currentSessionId = parseInt(localStorage.getItem('currentSessionId')) || Date.now();
let autoSaveInterval = null;

// ===== DOM ELEMENTS =====
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const emojiBtn = document.getElementById('emojiBtn');


// ===== STATE =====
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
    normal: {
        emoji: '🤖',
        name: 'Normalna',
        prompt: 'Odgovori prirodno i prijateljski. '
    },
    humorous: {
        emoji: '😄',
        name: 'Humor',
        prompt: 'Odgovori sa humorom i puno šala. Koristi emojije i dosjetke. '
    },
    formal: {
        emoji: '🎩',
        name: 'Formalna',
        prompt: 'Odgovori formalno i profesionalno kao poslovni konsultant. '
    },
    poetic: {
        emoji: '✨',
        name: 'Poetska',
        prompt: 'Odgovori poetski i metaforički sa lepim rečima. '
    },
    sarcastic: {
        emoji: '😏',
        name: 'Sarkastična',
        prompt: 'Odgovori sarkastično i sa dosetkom kao stand-up komičar. '
    },
    motivational: {
        emoji: '💪',
        name: 'Motivacijska',
        prompt: 'Motiviraj korisnika sa inspirativnim i snažnim porukama! '
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    // Čekaj da se config učita
    await waitForConfig();
    
    // Inicijalizuj API
    initializeAPI();
    
    if (darkMode) enableDarkMode();
    setupEventListeners();
    updateStats();
    startTimer();
    updatePersonalityUI();
    showWelcomeMessage();
     loadCurrentSession(); // Nova linija
    startAutoSave(); // Nova linija
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    document.getElementById('historyBtn').addEventListener('click', openHistoryModal);
document.getElementById('newSessionBtn').addEventListener('click', createNewSession);

    // Send message
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Emoji button (placeholder)
 emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleEmojiPicker();
});
    // Header buttons
    document.getElementById('statsBtn').addEventListener('click', openStatsModal);
    document.getElementById('gameBtn').addEventListener('click', openGameModal);
    document.getElementById('darkModeBtn').addEventListener('click', toggleDarkMode);
    document.getElementById('clearBtn').addEventListener('click', clearChat);
    document.getElementById('voiceBtn').addEventListener('click', startVoiceInput);
    document.getElementById('searchBtn').addEventListener('click', openSearchModal);
    document.getElementById('translatorBtn')?.addEventListener('click', openTranslatorModal);
    document.getElementById('personalityBtn').addEventListener('click', openPersonalityModal);

    // Modal close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('show');
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
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
    document.getElementById('translateBtn')?.addEventListener('click', translateChat);

    // Search
    document.getElementById('searchInput')?.addEventListener('input', performSearch);

    // Copy message on click
    chatBox.addEventListener('click', (e) => {
        const messageContent = e.target.closest('.message-content');
        if (messageContent && !e.target.closest('.message-avatar')) {
            const text = messageContent.innerText;
            navigator.clipboard.writeText(text);
            showNotification('📋 Poruka kopirana!');
        }
    });
}

// ===== WELCOME MESSAGE =====
function showWelcomeMessage() {
    // Welcome message is already in HTML, just animate it
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.style.animation = 'messageSlide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
}

// ===== DARK MODE =====
function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    
    if (darkMode) {
        enableDarkMode();
        document.getElementById('darkModeBtn').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        disableDarkMode();
        document.getElementById('darkModeBtn').innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeBtn').innerHTML = '<i class="fas fa-sun"></i>';
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    document.getElementById('darkModeBtn').innerHTML = '<i class="fas fa-moon"></i>';
}

// ===== MESSAGE HANDLING =====
function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    if (!isUser) {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = personalities[currentPersonality].emoji;
        messageDiv.appendChild(avatarDiv);
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(text);
    messageDiv.appendChild(contentDiv);
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    chatHistory.push({ text, isUser, timestamp: Date.now() });
    
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

function formatMessage(text) {
    // Basic markdown support
    text = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/`(.*?)`/g, '<code>$1</code>') // Code
        .replace(/\n/g, '<br>'); // Line breaks
    
    return text;
}

// ===== TYPING INDICATOR =====
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing';
    typingDiv.innerHTML = `
        <div class="message-avatar">⏳</div>
        <div class="message-content">
            <div class="typing-dots">
                <span>•</span><span>•</span><span>•</span>
            </div>
        </div>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
}

// ===== SEND MESSAGE TO BOT =====
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Provera da li je API ključ učitan
    if (!API_KEY || API_KEY.trim() === '' || API_KEY === '❌ Nije dostupan') {
        addMessage('❌ Greška: API ključ nije dostupan. Kontaktiraj administratora!', false);
        return;
    }
    
    addMessage(message, true);
    userInput.value = '';
    userInput.style.height = 'auto';
    
    showTyping();
    
    try {
        const personalityPrompt = personalities[currentPersonality].prompt;
        const fullPrompt = personalityPrompt + message;
        
        console.log('🔑 API Ključ (first 20 chars):', API_KEY.substring(0, 20) + '...');
        console.log('📤 Pozivam API sa URL:', API_URL);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }]
            })
        });
        
        const data = await response.json();
        removeTyping();
        
        console.log('📥 API Odgovor status:', response.status);
        console.log('📥 API Odgovor data:', JSON.stringify(data, null, 2));
        
        if (!response.ok) {
            const errorMsg = data.error?.message || data.error?.details || JSON.stringify(data.error) || 'Nepoznata greška';
            console.error('❌ API Error:', response.status, errorMsg);
            addMessage('❌ Greška: ' + errorMsg, false);
            return;
        }
        
        if (data.candidates && data.candidates[0].content) {
            const botResponse = data.candidates[0].content.parts[0].text;
            addMessage(botResponse, false);
            playNotificationSound();
        } else {
            addMessage('⚠️ Nisam mogao da generišem odgovor. Pokušaj ponovo.', false);
            console.error('API Response:', data);
        }
        
    } catch (error) {
        removeTyping();
        console.error('❌ Fetch Error:', error);
        addMessage('❌ Greška konekcije: ' + error.message, false);
    }
}

// ===== VOICE INPUT =====
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showNotification('❌ Voice input nije podržan u ovom browser-u');
        return;
    }
    
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'sr-RS';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    const voiceBtn = document.getElementById('voiceBtn');
    voiceBtn.style.opacity = '0.5';
    voiceBtn.innerHTML = '<i class="fas fa-circle" style="color: red; animation: pulse 1s infinite;"></i>';
    
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        userInput.value = transcript;
        voiceBtn.style.opacity = '1';
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        showNotification('🎤 Snimljeno!');
    };
    
    recognition.onerror = (event) => {
        voiceBtn.style.opacity = '1';
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        showNotification('❌ Greška: ' + event.error);
    };
    
    recognition.onend = () => {
        voiceBtn.style.opacity = '1';
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    };
    
    recognition.start();
    showNotification('🎤 Govori sada...');
}

// ===== STATS =====
function updateStats() {
    document.getElementById('messageCount').textContent = stats.totalMessages;
    document.getElementById('statMessages').textContent = stats.totalMessages;
    document.getElementById('statUserMessages').textContent = stats.userMessages;
    document.getElementById('statBotMessages').textContent = stats.botMessages;
    
    const avgLength = stats.totalMessages > 0 
        ? Math.round(stats.totalCharacters / stats.totalMessages) 
        : 0;
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
    return hours + 'h ' + (minutes % 60) + 'm';
}

// ===== CLEAR CHAT =====
function clearChat() {
    if (confirm('🗑️ Sigurno želiš da obrišeš sav chat?')) {
        // Sačuvaj pre brisanja (kao backup)
        saveCurrentSession();
        
        // Kreiraj novu sesiju
        createNewSession();
    }
}

// ===== DOWNLOAD & COPY =====
function downloadChat() {
    let content = '🦗 Grasshopper AI Chat Log by Skale\n';
    content += '📅 Vreme: ' + new Date().toLocaleString('sr-RS') + '\n';
    content += '=' .repeat(50) + '\n\n';
    
    chatHistory.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString('sr-RS');
        content += `[${time}] ${msg.isUser ? 'Ti' : 'Bot'}: ${msg.text}\n\n`;
    });
    
    content += '\n' + '='.repeat(50) + '\n';
    content += `📊 Statistika: ${stats.totalMessages} poruka, ${formatTime(Math.floor((Date.now() - stats.startTime) / 1000))} vreme\n`;
    content += '🔗 SkaleDigitals - https://skaledigitals.com\n';
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grasshopper-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('💾 Chat preuzet!');
}

async function copyAllChat() {
    let content = '';
    chatHistory.forEach(msg => {
        content += `${msg.isUser ? 'Ti' : 'Bot'}: ${msg.text}\n\n`;
    });
    
    try {
        await navigator.clipboard.writeText(content);
        showNotification('📋 Sve poruke kopirane!');
    } catch (err) {
        showNotification('❌ Greška pri kopiranju');
    }
}

// ===== MODALS =====
function openStatsModal() {
    document.getElementById('statsModal').classList.add('show');
}

function openGameModal() {
    document.getElementById('gameModal').classList.add('show');
    setTimeout(() => initGame(), 100);
}

function openSearchModal() {
    document.getElementById('searchModal').classList.add('show');
    document.getElementById('searchInput').focus();
}

function openTranslatorModal() {
    const modal = document.getElementById('translatorModal');
    if (modal) modal.classList.add('show');
}

function openPersonalityModal() {
    document.getElementById('personalityModal').classList.add('show');
}

// ===== PERSONALITY =====
function setPersonality(personality) {
    currentPersonality = personality;
    localStorage.setItem('personality', personality);
    updatePersonalityUI();
    
    const info = personalities[personality];
    document.getElementById('personalityInfo').innerHTML = `
        <strong>${info.emoji} ${info.name}</strong><br>
        ${info.prompt}
    `;
    
    showNotification(`${info.emoji} Ličnost promenjena na: ${info.name}`);
}

function updatePersonalityUI() {
    const info = personalities[currentPersonality];
    document.getElementById('currentPersonality').textContent = info.name;
    
    document.querySelectorAll('.personality-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.personality === currentPersonality) {
            btn.classList.add('active');
        }
    });
}

// ===== SEARCH =====
function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    
    if (!query) {
        resultsDiv.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Upiši nešto za pretragu...</p>';
        return;
    }
    
    const results = chatHistory.filter(msg => 
        msg.text.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nema rezultata</p>';
        return;
    }
    
    resultsDiv.innerHTML = results.map(msg => `
        <div class="search-item">
            <strong>${msg.isUser ? 'Ti' : 'Bot'}:</strong> ${msg.text.substring(0, 100)}${msg.text.length > 100 ? '...' : ''}
        </div>
    `).join('');
}

// ===== TRANSLATOR =====
async function translateChat() {
    const lang = document.getElementById('translatorLang')?.value || 'en';
    const resultsDiv = document.getElementById('translationResults');
    
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<p style="text-align: center;">⏳ Prevođenje...</p>';
    
    const translations = [];
    
    for (const msg of chatHistory.slice(-5)) { // Last 5 messages only
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': API_KEY
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Prevedi sledeći tekst na ${lang}. Samo prevod, bez dodatnog teksta:\n\n${msg.text}`
                        }]
                    }]
                })
            });
            
            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content) {
                const translatedText = data.candidates[0].content.parts[0].text;
                translations.push({
                    original: msg.text,
                    translated: translatedText,
                    isUser: msg.isUser
                });
            }
        } catch (error) {
            console.error('Translation error:', error);
        }
    }
    
    resultsDiv.innerHTML = translations.map(t => `
        <div class="translation-item">
            <div class="translation-original">${t.isUser ? 'Ti' : 'Bot'}: ${t.original}</div>
            <div class="translation-translated">→ ${t.translated}</div>
        </div>
    `).join('');
}

// ===== GAME =====
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
            startBtn.textContent = 'Igra u toku...';
            
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
        ctx.fillRect(
            grasshopper.x - grasshopper.width / 2,
            grasshopper.y - grasshopper.height / 2,
            grasshopper.width,
            grasshopper.height
        );
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
        if (!gameRunning) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        grasshopper.x += grasshopper.velocityX;
        grasshopper.velocityX *= 0.9;
        
        if (grasshopper.x - grasshopper.width / 2 < 0) 
            grasshopper.x = grasshopper.width / 2;
        if (grasshopper.x + grasshopper.width / 2 > canvas.width) 
            grasshopper.x = canvas.width - grasshopper.width / 2;
        
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
        
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.y += obs.speed;
            
            if (
                obs.x < grasshopper.x + grasshopper.width / 2 &&
                obs.x + obs.width > grasshopper.x - grasshopper.width / 2 &&
                obs.y < grasshopper.y + grasshopper.height / 2 &&
                obs.y + obs.height > grasshopper.y - grasshopper.height / 2
            ) {
                gameRunning = false;
                document.getElementById('gameScore').textContent = `Score: ${gameScore}`;
                document.getElementById('gameStartBtn').textContent = 'Ponovo Igraj';
                showNotification(`🎮 Game Over! Score: ${gameScore}`);
                return;
            }
            
            if (obs.y > canvas.height) {
                obstacles.splice(i, 1);
                gameScore++;
                document.getElementById('gameScore').textContent = `Score: ${gameScore}`;
            }
        }
        
        drawGrasshopper();
        drawObstacles();
        
        requestAnimationFrame(updateGame);
    }
    
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        if (e.key === 'ArrowLeft') grasshopper.velocityX = -5;
        if (e.key === 'ArrowRight') grasshopper.velocityX = 5;
    });
    
    updateGame();
}

function playFlappyGame(ctx, canvas) {
    // Simplified Flappy Bird clone
    showNotification('🪁 Flappy game uskoro!');
    gameRunning = false;
    document.getElementById('gameStartBtn').textContent = 'Počni Igru';
}
// ===== EMOJI PICKER =====
let emojiPickerOpen = false;

function toggleEmojiPicker() {
    const existingPicker = document.getElementById('emojiPicker');
    
    if (existingPicker) {
        closeEmojiPicker();
        return;
    }
    
    showEmojiPicker();
}

function showEmojiPicker() {
    emojiPickerOpen = true;
    
    const picker = document.createElement('div');
    picker.id = 'emojiPicker';
    picker.className = 'emoji-picker';
    
    // Header sa search (opciono)
    const header = document.createElement('div');
    header.className = 'emoji-picker-header';
    header.innerHTML = `
        <span style="font-weight: 600; font-size: 14px;">Izaberi Emoji</span>
        <button class="emoji-close-btn" onclick="closeEmojiPicker()">×</button>
    `;
    picker.appendChild(header);
    
    // Grid sa emoji-ma
    const grid = document.createElement('div');
    grid.className = 'emoji-grid';
    
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'emoji-btn';
        btn.textContent = emoji;
        btn.title = emoji;
        
        btn.onclick = (e) => {
            e.stopPropagation();
            insertEmoji(emoji);
        };
        
        grid.appendChild(btn);
    });
    
    picker.appendChild(grid);
    
    // Dodaj u container
    const container = document.querySelector('.input-container');
    container.appendChild(picker);
    
    // Animacija
    setTimeout(() => picker.classList.add('show'), 10);
    
    // Zatvori na klik napolje
    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 100);
}

function closeEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    if (!picker) return;
    
    picker.classList.remove('show');
    setTimeout(() => picker.remove(), 300);
    
    emojiPickerOpen = false;
    document.removeEventListener('click', handleOutsideClick);
}

function handleOutsideClick(e) {
    const picker = document.getElementById('emojiPicker');
    const emojiButton = document.getElementById('emojiBtn');
    
    if (picker && !picker.contains(e.target) && e.target !== emojiButton && !emojiButton.contains(e.target)) {
        closeEmojiPicker();
    }
}

function insertEmoji(emoji) {
    const cursorPos = userInput.selectionStart;
    const textBefore = userInput.value.substring(0, cursorPos);
    const textAfter = userInput.value.substring(cursorPos);
    
    userInput.value = textBefore + emoji + textAfter;
    
    // Postavi cursor posle emoji-a
    const newCursorPos = cursorPos + emoji.length;
    userInput.setSelectionRange(newCursorPos, newCursorPos);
    userInput.focus();
    
    // Vibracija (ako je podržano)
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
    
    // Ne zatvaraj picker - ostavi otvoren za više emoji-a
    // closeEmojiPicker();
}
// ===== CHAT HISTORY & SESSIONS =====

function loadCurrentSession() {
    const savedSession = sessions.find(s => s.id === currentSessionId);
    
    if (savedSession) {
        // Učitaj podatke iz sesije
        chatHistory = savedSession.messages || [];
        stats = savedSession.stats || stats;
        currentPersonality = savedSession.personality || 'normal';
        
        // Iscrtaj poruke
        chatBox.innerHTML = '';
        chatHistory.forEach(msg => {
            addMessageToDOM(msg.text, msg.isUser);
        });
        
        updateStats();
        updatePersonalityUI();
        
        showNotification(`📂 Sesija učitana: ${savedSession.name || 'Chat ' + sessions.indexOf(savedSession)}`);
    } else {
        // Nova sesija - prikaži welcome
        showWelcomeMessage();
    }
}

function saveCurrentSession() {
    const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
    
    const sessionData = {
        id: currentSessionId,
        name: generateSessionName(),
        timestamp: Date.now(),
        messages: chatHistory,
        stats: stats,
        personality: currentPersonality,
        preview: getSessionPreview()
    };
    
    if (sessionIndex >= 0) {
        sessions[sessionIndex] = sessionData;
    } else {
        sessions.push(sessionData);
    }
    
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
    localStorage.setItem('currentSessionId', currentSessionId);
}

function generateSessionName() {
    const now = new Date();
    const date = now.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });
    const time = now.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' });
    
    // Ako ima user poruka, uzmi prvu kao ime
    const firstUserMsg = chatHistory.find(m => m.isUser);
    if (firstUserMsg && firstUserMsg.text.length > 0) {
        const preview = firstUserMsg.text.substring(0, 30);
        return `${preview}... - ${date}`;
    }
    
    return `Chat ${date} ${time}`;
}

function getSessionPreview() {
    const lastMsg = chatHistory[chatHistory.length - 1];
    if (!lastMsg) return 'Nema poruka';
    
    const preview = lastMsg.text.substring(0, 50);
    return preview + (lastMsg.text.length > 50 ? '...' : '');
}

function startAutoSave() {
    // Auto-save svake 30 sekundi
    autoSaveInterval = setInterval(() => {
        if (chatHistory.length > 0) {
            saveCurrentSession();
        }
    }, 30000);
}

function createNewSession() {
    // Sačuvaj trenutnu sesiju
    if (chatHistory.length > 0) {
        saveCurrentSession();
    }
    
    // Kreiraj novu
    currentSessionId = Date.now();
    chatHistory = [];
    stats = {
        userMessages: 0,
        botMessages: 0,
        totalMessages: 0,
        startTime: Date.now(),
        totalCharacters: 0
    };
    currentPersonality = 'normal';
    
    chatBox.innerHTML = '';
    showWelcomeMessage();
    updateStats();
    updatePersonalityUI();
    
    localStorage.setItem('currentSessionId', currentSessionId);
    
    closeModal('historyModal');
    showNotification('✨ Nova sesija kreirana!');
}

function loadSession(sessionId) {
    // Sačuvaj trenutnu pre prebacivanja
    if (chatHistory.length > 0) {
        saveCurrentSession();
    }
    
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
        showNotification('❌ Sesija nije pronađena');
        return;
    }
    
    currentSessionId = sessionId;
    chatHistory = session.messages || [];
    stats = session.stats || stats;
    currentPersonality = session.personality || 'normal';
    
    chatBox.innerHTML = '';
    chatHistory.forEach(msg => {
        addMessageToDOM(msg.text, msg.isUser);
    });
    
    updateStats();
    updatePersonalityUI();
    
    localStorage.setItem('currentSessionId', currentSessionId);
    
    closeModal('historyModal');
    showNotification(`✅ Učitana sesija: ${session.name}`);
}

function deleteSession(sessionId, event) {
    event.stopPropagation();
    
    if (!confirm('🗑️ Sigurno želiš da obrišeš ovu sesiju?')) {
        return;
    }
    
    sessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
    
    // Ako brišeš trenutnu sesiju, kreiraj novu
    if (sessionId === currentSessionId) {
        createNewSession();
    }
    
    displaySessions();
    showNotification('🗑️ Sesija obrisana!');
}

function renameSession(sessionId, event) {
    event.stopPropagation();
    
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const newName = prompt('Novo ime sesije:', session.name);
    if (newName && newName.trim()) {
        session.name = newName.trim();
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        displaySessions();
        showNotification('✏️ Sesija preimenovana!');
    }
}

function openHistoryModal() {
    displaySessions();
    document.getElementById('historyModal').classList.add('show');
}

function displaySessions() {
    const container = document.getElementById('historySessions');
    
    if (sessions.length === 0) {
        container.innerHTML = `
            <div class="no-sessions">
                <i class="fas fa-folder-open" style="font-size: 48px; opacity: 0.3;"></i>
                <p>Nema sačuvanih sesija</p>
                <p style="font-size: 13px; opacity: 0.7;">Započni novi chat da kreiraš sesiju</p>
            </div>
        `;
        return;
    }
    
    // Sortiraj od najnovijih
    const sortedSessions = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
    
    container.innerHTML = sortedSessions.map(session => {
        const date = new Date(session.timestamp).toLocaleString('sr-RS', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const isActive = session.id === currentSessionId;
        const messageCount = session.messages ? session.messages.length : 0;
        
        return `
            <div class="session-item ${isActive ? 'active' : ''}" onclick="loadSession(${session.id})">
                <div class="session-header">
                    <div class="session-icon">
                        ${session.personality ? personalities[session.personality].emoji : '🦗'}
                    </div>
                    <div class="session-info">
                        <div class="session-name">${session.name || 'Chat'}</div>
                        <div class="session-meta">
                            <span><i class="fas fa-clock"></i> ${date}</span>
                            <span><i class="fas fa-comments"></i> ${messageCount} poruka</span>
                        </div>
                    </div>
                    ${isActive ? '<div class="active-badge">Aktivna</div>' : ''}
                </div>
                <div class="session-preview">${session.preview || 'Nema poruka'}</div>
                <div class="session-actions">
                    <button class="session-action-btn" onclick="renameSession(${session.id}, event)" title="Preimenuj">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="session-action-btn delete" onclick="deleteSession(${session.id}, event)" title="Obriši">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Helper funkcija za dodavanje poruke bez update-a stats-a
function addMessageToDOM(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    if (!isUser) {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = personalities[currentPersonality].emoji;
        messageDiv.appendChild(avatarDiv);
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(text);
    messageDiv.appendChild(contentDiv);
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


// ===== NOTIFICATION SOUND =====
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ===== NOTIFICATION TOAST =====
function showNotification(text) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #4a7c2c 0%, #5a8c3a 100%);
        color: white;
        padding: 14px 20px;
        border-radius: 14px;
        z-index: 2000;
        animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 8px 24px rgba(74, 124, 44, 0.5);
        font-weight: 600;
        font-size: 14px;
        max-width: 300px;
    `;
    
    notif.textContent = text;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 2500);
}

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .typing-dots {
        display: flex;
        gap: 4px;
        align-items: center;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        background: currentColor;
        border-radius: 50%;
        animation: typingDot 1.4s infinite;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typingDot {
        0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
        }
        30% {
            transform: translateY(-10px);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// ===== AUTO-RESIZE INPUT =====
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

console.log('🦗 Grasshopper AI by Skale - Ready!');
