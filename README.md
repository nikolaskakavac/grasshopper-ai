# 🦗 Grasshopper AI - Chatbot Application

Moderan AI chatbot izgrađen sa Vanilla JavaScript i Google Gemini API. Optimizovan za mobilne uređaje sa dark mode-om, govornom kontrolom i zabavnim igramama!

## ✨ Karakteristike

- **🤖 AI Chatbot** - Pokrenut sa Google Gemini 2.5 Flash modelom
- **🎭 6 AI Ličnosti** - Normalna, Humor, Formalna, Poezija, Sarcasm, Motivacijska
- **🎤 Govorni Unos** - Speech Recognition API integracija
- **🌙 Dark Mode** - Potpuna podrška sa localStorage perzistencijom
- **📊 Statistika** - Brojačи poruka, vremenske statistike, analitika
- **🔍 Pretraga** - Real-time pretraga kroz istoriju četa
- **🌐 Prevodilac** - AI-powered prevod na 10+ jezika
- **🎮 Igre** - Grasshopper Jump i Flappy Bird igre sa Canvas API
- **📱 Mobilna Optimizacija** - Full-screen, touch-friendly interfejs
- **💾 Upravljanje Četom** - Download, Copy, Clear, History tracking
- **🔊 Zvučne Notifikacije** - Web Audio API beepovi

## 🚀 Brzi Početak

### Zahtevi
- Web pretraživač sa JavaScript podrškompython 3.x (za lokalni server)

### Instalacija

1. **Kloniraj repozitorijum**
```bash
git clone https://github.com/yourusername/grasshopper-ai.git
cd grasshopper-ai
```

2. **Pokreni lokalni server**
```bash
python -m http.server 8000
```

3. **Otvori u pretraživaču**
```
http://localhost:8000
```

## ⚙️ Konfiguracija API-ja

### Google Gemini API Setup

1. Idi na [Google AI Studio](https://aistudio.google.com)
2. Kreiraj novi API ključ
3. **VAŽNO**: U produkciji, koristi backend za API pozive da zaštitиš ključ!

#### Sigurnost API Ključa

**⚠️ UPOZORENJE**: Ne deli nikada svoj API ključ javno!

**Za Produkciju:**
- Koristi backend server (Node.js, Python, itd.)
- Klijent šalje zahtev backendu
- Backend šalje zahtev Google API-ju sa ključem
- Odgovore šalje klijенtu

**Brzi Primjer sa Python/Flask:**
```python
from flask import Flask, request
import requests

app = Flask(__name__)
API_KEY = "your-secret-key"

@app.route('/api/chat', methods=['POST'])
def chat():
    message = request.json['message']
    response = requests.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        headers={'x-goog-api-key': API_KEY},
        json={'contents': [{'parts': [{'text': message}]}]}
    )
    return response.json()
```

## 📖 Korišćenje

### Osnovne Funkcije
- **Pisanje** - Upiši poruku i pritisni Send ili Enter
- **Govor** - Klikни na 🎤 dugme za govorni unos
- **Odgovori** - AI će odgovoriti sa izabranom ličnošću

### Gumbi u Headeru
| Gumb | Funkcija |
|------|----------|
| 🔍 | Pretraga kroz istoriju četa |
| 🌐 | Prevedi ceo čet na drugi jezik |
| 🎭 | Odaberi AI ličnost |
| 📊 | Prikaži statistiku četa |
| 🎮 | Pokreni igre (Jump/Flappy) |
| 🌙 | Uključi/Isključi dark mode |
| 🗑️ | Obriši čet |

### AI Ličnosti
1. **Normal** - Standardni odgovori
2. **Humor** - Šala i humor
3. **Formal** - Profesionalni ton
4. **Poetry** - Pesništvo i metafora
5. **Sarcasm** - Sarkazam i ironija
6. **Motivational** - Motivacijski odgovori

## 🎮 Igre

### Grasshopper Jump
- Kontroluj skakavca desno/levo (← →)
- Izbegavaj prepreke
- Dobij što više poena

### Flappy Bird
- Pritisni Space ili klikni za skok
- Prođi kroz cevi
- Izbegavaj sudare

## 📊 Korišćenje API-ja

**Google Gemini Besplatni Tier:**
- ✅ ~60 zahteva po minuti
- ✅ ~1.5 miliona tokena dnevno
- 💳 Plaćeni tier počinje od $0.075/milion tokena

**Optimizacija:**
- Grupiraj kratke poruke
- Cache odgovore kada je moguće
- Koristi rate limiting na klijentskoj strani

## 🛠️ Tehnološka Baza

- **Frontend**: Vanilla JavaScript (ES6), HTML5, CSS3
- **API**: Google Gemini 2.5 Flash
- **Čuvanje**: Browser localStorage
- **Animacije**: CSS animations + requestAnimationFrame
- **Audio**: Web Audio API
- **Govor**: Web Speech Recognition API
- **Grafika**: HTML5 Canvas

## 📦 Arhitektura Fajlova

```
grasshopper-ai/
├── index.html          # HTML struktura
├── style.css           # CSS stilovi (1250+ linija)
├── script.js           # JavaScript logika (650+ linija)
├── README.md           # Dokumentacija
└── .gitignore          # Git ignoruj fajlove
```

## 🎨 Prilagođavanje

### Boje
Uredi vrednosti boja u `style.css`:
```css
/* Glavna boja */
#2d5016, #4a7c2c, #5a8c3a
```

### Ličnosti
Uredi `personalities` objekat u `script.js`:
```javascript
personalities: {
    customName: {
        emoji: '🎯',
        name: 'Custom',
        prompt: 'Your custom personality prompt...'
    }
}
```

## ⚡ Performanse

- **Background Animacije**: Optimizovane za mobilne uređaje
- **Duboka Animacija**: CSS3 @keyframes
- **Canvas Igre**: Koristi requestAnimationFrame
- **Čuvanje**: localStorage za brz pristup

## 🤝 Doprinos

Forkuj, uredi, i prati pull request! 

## 📄 Licenca

MIT License - Slobodno koristi u privatnim ili komercijalnim projektima.

## ⚠️ Zakonske Napomene

- **Odgovornost**: Korisnici su odgovorni za korišćenje ovog alata
- **API Ključ**: Čuva tvoj API ključ u produkciji!
- **Google Uslovi**: Poštuj Google AI uslove korišćenja
- **Količina Korišćenja**: Nadgledaj potrošnju API-ja

## 📞 Podrška

Za probleme ili predloge:
1. Otvori GitHub Issue
2. Napiši detaljnu opis problema
3. Uključi korake za reprodukciranje

## 🎉 Hvala!

Nadam se da će ti se sviđati Grasshopper AI! 🦗✨

---

**Verzija**: 1.0.0  
**Poslednja Ažuriranja**: Januar 2026  
**Kreirano sa ❤️** za AI entuzijaste
