/**
 * Configuration Loader
 * Učitava environment varijable iz .env.local fajla
 * 
 * ⚠️ SECURITY: API_KEY se NIKADA ne sme hardkodirati!
 * Koristi .env.local fajl koji je u .gitignore
 */

let config = {
    apiKey: '', 
    model: 'gemini-2.5-flash'
};

// Učitaj .env.local sinhronizovano pre nego što se ostatak koda pokrene
async function loadEnvConfig() {
    try {
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
                console.log('✅ Config učitan iz .env.local - API ključ dostupan');
                // Sačuvaj u localStorage za sledeći put
                localStorage.setItem('gemini_api_key', config.apiKey);
            }
        } else {
            // Ako .env.local ne postoji, pokušaj iz localStorage (ovo je OK za GitHub Pages)
            const savedKey = localStorage.getItem('gemini_api_key');
            if (savedKey) {
                config.apiKey = savedKey;
                console.log('✅ Korišćen sačuvani API ključ iz localStorage');
            } else {
                config.apiKey = '❌ Nije dostupan';
                console.warn('⚠️ .env.local nije pronađen i nema sačuvanog ključa u localStorage');
            }
        }
    } catch (error) {
        // Tiho preskačemo greške - .env.local ne postoji na GitHub Pages (očekivano)
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            config.apiKey = savedKey;
            console.log('✅ Korišćen sačuvani API ključ iz localStorage (fallback)');
        } else {
            config.apiKey = '❌ Nije dostupan';
            console.warn('⚠️ .env.local nije pronađen i nema sačuvanog ključa u localStorage');
        }
    }
}

// Učitaj odmah
loadEnvConfig();
