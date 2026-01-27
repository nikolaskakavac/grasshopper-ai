/**
 * Configuration Loader
 * Učitava environment varijable iz .env.local fajla
 * 
 * ⚠️ SECURITY: API_KEY se nikada ne sme hardkodirati!
 * Koristi .env.local fajl koji je u .gitignore
 */

let config = {
    apiKey: '', 
    model: 'gemini-2.5-flash'
};

// Učitaj .env.local
async function loadEnvConfig() {
    try {
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
        console.log('ℹ️ .env.local nije pronađen (OK za GitHub Pages)');
    }
}

// Učitaj odmah
loadEnvConfig();
