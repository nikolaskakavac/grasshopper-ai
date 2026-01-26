/**
 * Configuration Loader
 * Učitava environment varijable iz .env.local fajla
 * 
 * ⚠️ SECURITY: API_KEY se NIKADA ne sme hardkodirati!
 * Koristi .env.local fajl koji je u .gitignore
 */

let config = {
    apiKey: '', // Učitava se iz .env.local - NEMOJ HARDKODIRATI KLJUČ!
    model: 'gemini-2.5-flash'
};

// Učitaj .env.local sinhronizovano pre nego što se ostatak koda pokrene
async function loadEnvConfig() {
    try {
        const response = await fetch('.env.local');
        if (!response.ok) throw new Error('.env.local not found');
        
        const text = await response.text();
        const lines = text.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, value] = line.split('=');
                if (key && value) {
                    const normalizedKey = key.replace('VITE_GEMINI_', '').toLowerCase();
                    config[normalizedKey + '_key'] = value.trim();
                }
            }
        });
        
        if (config.api_key) {
            config.apiKey = config.api_key;
        }
        console.log('✅ Config učitan iz .env.local');
    } catch (error) {
        console.warn('⚠️ .env.local nije pronađen. Koristi default config.');
    }
}

// Ovo će biti pozvan iz HTML-a pre nego što se script.js pokrene
// (čeka se što je moguće brže)
