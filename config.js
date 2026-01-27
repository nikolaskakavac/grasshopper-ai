/**
 * Configuration Loader - GitHub Pages Version
 * API_KEY je ubačen kroz GitHub Actions iz Secret-a
 */

let config = {
    apiKey: 'AIzaSyDvzLWGZjmZYeaQC206A2Zqt8oo37VfZoM',
    model: 'gemini-2.5-flash'
};

// Dummy loadEnvConfig za kompatibilnost
async function loadEnvConfig() {
    console.log('✅ Config učitan kroz GitHub Actions');
}

// Dummy waitForConfig
async function waitForConfig() {
    console.log('✅ Config je dostupan');
}

// Učitaj odmah
loadEnvConfig().then(() => {
    console.log('✅ GitHub Pages deployment - API ključ je dostupan');
});
