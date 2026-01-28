/**
 * Configuration Loader
 * Učitava environment varijable iz .env.local fajla
 * Za GitHub Pages: HF_TOKEN se učitava iz localStorage
 * 
 * ⚠️ SECURITY: HF_TOKEN se nikada ne sme hardkodirati u javnom kodu!
 * Koristi .env.local fajl koji je u .gitignore
 */

let config = {
    apiKey: '',
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    apiProvider: 'huggingface'
};

// Učitaj .env.local (fallback za lokalnu development)
async function loadEnvConfig() {
    try {
        // 1. Prvo proveri localStorage (za produkciju na GitHub Pages)
        const savedKey = localStorage.getItem('hf_token');
        if (savedKey && savedKey.trim()) {
            config.apiKey = savedKey;
            console.log('✅ Config učitan iz localStorage');
            return;
        }
        
        // 2. Pokušaj da učitaš .env.local (za lokalni development)
        const response = await fetch('.env.local');
        if (response.ok) {
            const text = await response.text();
            const lines = text.split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        if (key === 'VITE_HF_TOKEN') {
                            config.apiKey = value.trim();
                        } else if (key === 'VITE_HF_MODEL') {
                            config.model = value.trim();
                        }
                    }
                }
            });
            
            if (config.apiKey) {
                console.log('✅ Config učitan iz .env.local');
                // Sačuvaj u localStorage za sledeći put
                localStorage.setItem('hf_token', config.apiKey);
            }
        } else {
            console.log('⚠️ .env.local nije pronađen - trebam HF token');
            // Ako je GitHub Pages, proveri window varijablu
            if (window.HF_TOKEN_GITHUB) {
                config.apiKey = window.HF_TOKEN_GITHUB;
                console.log('✅ Config učitan iz GitHub Actions');
            }
        }
        
    } catch (error) {
        console.log('ℹ️ .env.local nije pronađen (očekivano na GitHub Pages)');
        
        // Fallback: Proveri GitHub Actions varijablu
        if (window.HF_TOKEN_GITHUB) {
            config.apiKey = window.HF_TOKEN_GITHUB;
            console.log('✅ Koristi GitHub Actions token');
        } else {
            const savedKey = localStorage.getItem('hf_token');
            if (savedKey) {
                config.apiKey = savedKey;
                console.log('✅ Koristi localStorage token');
            } else {
                console.warn('⚠️ HF token nije pronađen - dodaj ga!');
            }
        }
    }
}

// Čekaj da se config učita (do 20 sekundi)
async function waitForConfig() {
    const maxWait = 20000; // 20 sekundi
    const startTime = Date.now();
    
    while (!config.apiKey && (Date.now() - startTime) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (config.apiKey) {
        console.log('✅ Config je dostupan - API ključ:', config.apiKey.substring(0, 10) + '...');
    } else {
        console.warn('⚠️ Config nije učitan u roku od 20 sekundi');
    }
}

// Učitaj odmah
loadEnvConfig().then(() => {
    console.log('✅ loadEnvConfig() završen');
});
