/**
 * Configuration Loader
 * Učitava environment varijable iz .env.local fajla
 */

let config = {
    apiKey: 'AIzaSyCscm2cNoVYd7aAujKav5RX4mUpzTQvZUk',
    model: 'gemini-2.5-flash'
};

// Pokušaj učitati .env.local fajl
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
    } catch (error) {
        console.log('ℹ️ Using default config. To use custom config, create .env.local file.');
    }
}

// Učitaj config pre nego što se script.js pokrene
loadEnvConfig().catch(console.error);
