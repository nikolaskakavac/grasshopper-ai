/**
 * Configuration Loader
 * Učitava environment varijable iz .env.local fajla
 * Za GitHub Pages: API_KEY je ubačen kroz index.html (od GitHub Actions)
 * 
 * ⚠️ SECURITY: API_KEY se nikada ne sme hardkodirati!
 * Koristi .env.local fajl koji je u .gitignore
 */

let config = {
    apiKey: window.API_KEY_GITHUB ? window.API_KEY_GITHUB : '', 
    model: 'gemini-2.5-flash'
};

// Učitaj .env.local (fallback za lokalnu development)
async function loadEnvConfig() {
    try {
        // Ako je config.apiKey već postavljen (od GitHub Actions kroz index.html), preskočimo
        if (config.apiKey && config.apiKey !== 'GITHUB_API_KEY_PLACEHOLDER' && config.apiKey.trim()) {
            console.log('✅ Config već ima API_KEY (GitHub Actions build)');
            return;
        }
        
        // Pokušaj da učitaš .env.local
        const response = await fetch('.env.local');
        
        if (response.ok) {
            const text = await response.text();
            const lines = text.split('\n');
            
            lines.forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        const cleanKey = key.replace('VITE_GEMINI_', '').toLowerCase();
                        if (cleanKey === 'api_key') {
                            config.apiKey = value.trim();
                        } else if (cleanKey === 'model') {
                            config.model = value.trim();
                        }
                    }
                }
            });
            
            if (config.apiKey) {
                console.log('✅ Config učitan iz .env.local - API ključ dostupan');
            }
        }
    } catch (error) {
        // .env.local nije pronađen - OK, može biti na GitHub Pages
        console.log('ℹ️ .env.local nije pronađen (očekivano na GitHub Pages)');
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
