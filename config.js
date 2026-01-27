/**
 * Configuration Loader
 * Učitava environment varijable iz .env.local fajla (ili GitHub Actions build)
 * 
 * ⚠️ SECURITY: API_KEY se nikada ne sme hardkodirati u source code-u!
 * - Lokalno: Koristi .env.local fajl koji je u .gitignore
 * - GitHub Pages: GitHub Actions ubacuje API_KEY iz Secrets
 */

let config = {
    apiKey: '', 
    model: 'gemini-2.5-flash'
};

// Učitaj .env.local sinhronizovano pre nego što se ostatak koda pokrene
async function loadEnvConfig() {
    try {
        // Prvo proveri da li je config već postavljen (od GitHub Actions)
        if (config.apiKey) {
            console.log('✅ Config već učitan (GitHub Actions build)');
            return;
        }
        
        // Pokušaj sa različitim putanjama (tiho preskačemo 404-e)
        const paths = ['.env.local', './.env.local', '/.env.local'];
        let response = null;
        
        for (const path of paths) {
            try {
                const res = await fetch(path, { method: 'HEAD' });
                if (res.ok) {
                    response = await fetch(path);
                    break;
                }
            } catch (e) {
                // Tiho preskačemo svaki path koji ne radi
            }
        }
        
        if (response && response.ok) {
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
                console.log('✅ Config učitan iz .env.local');
            }
        }
    } catch (error) {
        console.log('ℹ️ .env.local nije dostupan (GitHub Pages - expected)');
    }
}
}

// Učitaj odmah
loadEnvConfig();
