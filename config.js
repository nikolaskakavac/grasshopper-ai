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
        // Pokušaj sa različitim putanjama
        let response = await fetch('.env.local');
        
        // Ako ne radi, pokušaj sa drugom putanjom
        if (!response.ok) {
            response = await fetch('./.env.local');
        }
        
        // Ako i dalje ne radi, pokušaj sa ../ 
        if (!response.ok) {
            response = await fetch('/.env.local');
        }
        
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
                // Sačuvaj u localStorage za sledeći put
                localStorage.setItem('gemini_api_key', config.apiKey);
            }
        } else {
            // Ako .env.local ne postoji, pokušaj iz localStorage
            const savedKey = localStorage.getItem('gemini_api_key');
            if (savedKey) {
                config.apiKey = savedKey;
                console.log('✅ Korišćen sačuvani API ključ iz localStorage');
            } else {
                console.warn('⚠️ .env.local nije pronađen i nema sačuvanog ključa u localStorage');
            }
        }
    } catch (error) {
        console.warn('⚠️ Greška pri učitavanju .env.local:', error.message);
        // Pokušaj fallback
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            config.apiKey = savedKey;
            console.log('✅ Korišćen sačuvani API ključ iz localStorage (fallback)');
        }
    }
}

// Učitaj odmah
loadEnvConfig();
