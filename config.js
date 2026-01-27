let config = {
    apiKey: 'AIzaSyDvzLWGZjmZYeaQC206A2Zqt8oo37VfZoM',
    model: 'gemini-1.5-flash'
};

async function loadEnvConfig() {
    console.log('✅ Config već dostupan (GitHub Actions build)');
}

async function waitForConfig() {
    return Promise.resolve();
}

loadEnvConfig();
