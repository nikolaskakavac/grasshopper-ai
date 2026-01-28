let config = {
    apiKey: '',
    model: 'openai/gpt-oss-120b',
    apiProvider: 'groq'
};

async function loadEnvConfig() {
    console.log('✅ Config već dostupan (GitHub Actions build)');
}

async function waitForConfig() {
    if (config.apiKey) {
        console.log('✅ Config je dostupan - API ključ:', config.apiKey.substring(0, 10) + '...');
    } else {
        console.warn('⚠️ Config nije učitan');
    }
    return Promise.resolve();
}

loadEnvConfig();
