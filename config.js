let config = {
    apiKey: '',
    model: 'llama-3.1-70b-versatile',
    apiProvider: 'groq'
};

async function loadEnvConfig() {
    console.log('✅ Config već dostupan (GitHub Actions build)');
}

async function waitForConfig() {
    return Promise.resolve();
}

loadEnvConfig();
