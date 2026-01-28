let config = {
    apiKey: '',
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    apiProvider: 'huggingface'
};

async function loadEnvConfig() {
    console.log('✅ Config već dostupan (GitHub Actions build)');
}

async function waitForConfig() {
    return Promise.resolve();
}

loadEnvConfig();
