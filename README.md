# JobWizard

**Trova aziende tech. Traccia le candidature.**

JobWizard è una web app full-stack che automatizza la ricerca di lavoro per sviluppatori e web designer: importa aziende da Google Places, scansiona i loro siti con cheerio per rilevare keyword tech che corrispondono al mio profilo, assegna un "tech score" basato su un dizionario di keyword, e traccia le candidature in una Kanban. Include un generatore di bozze email con Gemini API.

![JobWizard Search](public/search.jpg)

> [Read in English ↓](#-jobwizard-english)

---

## Perché l'ho costruito

Sto cercando lavoro come sviluppatrice a Cuneo o Torino. Vorrei trovare **aziende tech che non conosco** — non solo le 10 software house che trovo nella prima pagina di Google. LinkedIn e Indeed non bastavano: mostravano solo le aziende che pubblicano annunci di lavoro e io vorrei trovare il mio match perfetto, anche se non stanno cercando in questo momento.

Ho costruito JobWizard per automatizzare la ricerca:
- Importare **tutte** le aziende in un raggio di 50km da un luogo che decido
- Scansionare i loro siti per rilevare le keyword che ho scelto e che corrispondono al mio profilo
- Assegnare un punteggio in base a keyword tech trovate
- Tracciare le candidature in una Kanban
- Generare bozze email personalizzate con AI così da non soffrire di panico da pagina bianca (non preoccupatevi, le riscrivo sempre personalmente)

(C'è una buona probabilità che abbia trovato la tua azienda esattamente così!)

---

## Funzionalità

### Import aziende (Google Places)
- Ricerca per città + raggio
- Multi-categoria (software house, agenzie)
- Import automatico nel DB con deduplica

### Scraping (Cheerio)
- Visita i siti delle aziende
- Estrae il testo visibile
- Cerca keyword tech con un dizionario pesato

### Scoring
- Dizionario di ~150 keyword pesate (React, WordPress, developer, ...)
- Punteggio 0-700+
- Classificazione: "Non tech" → "Weak" → "Maybe tech" → "Tech" → "Top tech"

### Library
- Tabella filtrabile per score, ordinamento, città
- Ricerca per gruppo di città (grandi vs piccole)
- Responsive (tabella su desktop, card su mobile)

### Kanban (Quest Board)
- Drag & drop tra tutti gli stati

### AI email draft
- Genera una bozza personalizzata per ogni azienda
- Usa il profilo dell'utente (skill, esperienze, bio)
- Modello: Gemini 3.1 Flash Lite (free tier)
- Modificabile e copiabile

---

## Tech Stack

| **Framework** | Next.js 16 |
| **Language** | JavaScript |
| **Database** | PostgreSQL 16 + Prisma 6 |
| **Local infra** | Docker + Docker Compose |
| **Scraping** | Cheerio |
| **External APIs** | Google Places, Google Geocoding, Gemini AI |
| **UI** | Tailwind CSS v4, Lucide icons |
| **Fonts** | Cormorant Garamond (headings) + Outfit (body) |
| **Drag & drop** | @dnd-kit |
| **HTTP client** | native fetch + axios |


## Screenshots

### Kanban (Quest Board)
![Kanban](public/kanban.jpg)

### Library
![Library](public/library.jpg)

### Company detail + AI Email
![Detail](public/aidraft.jpg)

### Import companies
![Import](public/search.jpg)


---

## Come avviarlo

### Prerequisiti
- Node.js ≥ 20
- Docker Desktop
- Account Google Cloud (per Places + Geocoding API)
- Account Google AI Studio (per Gemini API)

### Setup

1. **Clona il repo**
   ```bash
   git clone https://github.com/verongale/JobWizard.git
   cd JobWizard
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Crea le API key**
   - **Google Cloud**: abilita Places API e Geocoding API, crea una API key
   - **Google AI Studio**: crea una API key per Gemini

4. **Configura `.env.local`**
   ```bash
   cp .env.example .env.local
   ```
   Compila:
   ```
   DATABASE_URL="postgresql://jobwizard:password@localhost:5432/jobwizard"
   GOOGLE_PLACES_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   ```

5. **Configura il tuo profilo personale**
   ```bash
   cp src/lib/profile.example.js src/lib/profile.js
   ```
   Compila con i tuoi dati (nome, email, skill, esperienze).

6. **Avvia Postgres**
   ```bash
   docker compose up -d
   ```

7. **Crea le tabelle**
   ```bash
   npx prisma migrate dev
   ```

8. **Avvia il server**
   ```bash
   npm run dev
   ```


## 🗺️ Roadmap

- [x] Import companies (Places)
- [x] Scraping (Cheerio)
- [x] Scoring
- [x] Library with filters
- [x] Company detail
- [x] Kanban drag & drop
- [x] AI email draft
- [ ] Multi-user (different profiles)
- [ ] CV tailored with AI
- [ ] Statistics dashboard
- [ ] CSV export
- [ ] Follow-up reminders

---

### Why Webpack and not Turbopack
Turbopack (default in Next.js 16) has a bug on Mac with low RAM: the cache gets corrupted and every request recompiles everything. Webpack is slower to compile but stable.

### Why batch scraping
Scanning 697 sites in a single Server Action takes about 15 minutes.I split it into batches of 20 sites.

### Why the keyword dictionary is weighted
A site saying "React" 3 times is more tech than one saying "website" 5 times. The score is `sum(weight × occurrences)`, with a cap at 3 occurrences per keyword (to prevent a site repeating "React" 50 times from exploding the score).


## 👤 Author

**Veronica Galeazzo** — Digital Designer & Front-End Developer
- Portfolio: [veronicagaleazzo.it](https://www.veronicagaleazzo.it)
- LinkedIn: [linkedin.com/in/veronica-galeazzo](https://www.linkedin.com/in/veronica-galeazzo)
- Email: galeazzo.ve@gmail.com

---

## JobWizard (English)

**Find tech companies. Track your job applications.**

JobWizard is a full-stack web app that automates the job search for developers and web designers: it imports companies from Google Places, scrapes their websites with cheerio to detect tech keywords that match my profile, assigns a "tech score" based on a keyword dictionary, and tracks applications in a Kanban. Includes an AI-powered email draft generator with Gemini API.

> [Leggi in italiano ↑](#-jobwizard)

---

## Why I built it

I am looking for a developer job in Cuneo or Turin, Italy. I would like to find **tech companies I don't know of** — not just the 10 software houses that I find in the first page of google results. LinkedIn and Indeed weren't enough: they only showed companies posting job ads and I would like to find my perfect match, even if they aren't looking right now.

I built JobWizard to automate the search:
- Import **all** companies within a 50km radius from a place I decide
- Scrape their websites to detect the keywords I chose and that match my profile
- Assign a score based on tech keywords found
- Track applications in a Kanban
- Generate personalized email drafts with AI so that I don't suffer from blank page panic (don't worry, I always re-write them personally)

(There's a good chance I found your company exactly like that!)

---

## Features

### Import companies (Google Places)
- Search by city + radius
- Multi-category (software houses, agencies)
- Automatic import into the DB with deduplication

### Scraping (Cheerio)
- Visits company websites
- Extracts visible text
- Searches for tech keywords with a weighted dictionary

### Scoring
- Dictionary of ~150 keywords with weights (React, WordPress, developer, ...)
- Score 0-700+
- Classification: "Non tech" → "Weak" → "Maybe tech" → "Tech" → "Top tech"

### Library
- Table filterable by score, sorting, city
- Search by city group (large vs small)
- Responsive (table on desktop, cards on mobile)

### Kanban (Quest Board)
- Drag & drop across all the states

### AI email draft
- Generates a personalized draft for each company
- Uses the user's profile (skills, experience, bio)
- Model: Gemini 3.1 Flash Lite (free tier)
- Editable and copyable

---

## Tech Stack

| **Framework** | Next.js 16 |
| **Language** | JavaScript |
| **Database** | PostgreSQL 16 + Prisma 6 |
| **Local infra** | Docker + Docker Compose |
| **Scraping** | Cheerio |
| **External APIs** | Google Places, Google Geocoding, Gemini AI |
| **UI** | Tailwind CSS v4, Lucide icons |
| **Fonts** | Cormorant Garamond (headings) + Outfit (body) |
| **Drag & drop** | @dnd-kit |
| **HTTP client** | native fetch + axios |


## Screenshots

### Kanban (Quest Board)
![Kanban](public/kanban.jpg)

### Library
![Library](public/library.jpg)

### Company detail + AI Email
![Detail](public/aidraft.jpg)

### Import companies
![Import](public/search.jpg)


---

## How to run it

### Prerequisites
- Node.js ≥ 20
- Docker Desktop
- Google Cloud account (for Places + Geocoding API)
- Google AI Studio account (for Gemini API)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/verongale/JobWizard.git
   cd JobWizard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create the API keys**
   - **Google Cloud**: enable Places API and Geocoding API, create an API key
   - **Google AI Studio**: create a Gemini API key

4. **Configure `.env.local`**
   ```bash
   cp .env.example .env.local
   ```
   Fill in:
   ```
   DATABASE_URL="postgresql://jobwizard:password@localhost:5432/jobwizard"
   GOOGLE_PLACES_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   ```

5. **Configure your personal profile**
   ```bash
   cp src/lib/profile.example.js src/lib/profile.js
   ```
   Fill in with your data (name, email, skills, experience).

6. **Start Postgres**
   ```bash
   docker compose up -d
   ```

7. **Create the tables**
   ```bash
   npx prisma migrate dev
   ```

8. **Start the server**
   ```bash
   npm run dev
   ```


## 🗺️ Roadmap

- [x] Import companies (Places)
- [x] Scraping (Cheerio)
- [x] Scoring
- [x] Library with filters
- [x] Company detail
- [x] Kanban drag & drop
- [x] AI email draft
- [ ] Multi-user (different profiles)
- [ ] CV tailored with AI
- [ ] Statistics dashboard
- [ ] CSV export
- [ ] Follow-up reminders

---

### Why Webpack and not Turbopack
Turbopack (default in Next.js 16) has a bug on Mac with low RAM: the cache gets corrupted and every request recompiles everything. Webpack is slower to compile but stable.

### Why batch scraping
Scanning 697 sites in a single Server Action takes about 15 minutes.I split it into batches of 20 sites.

### Why the keyword dictionary is weighted
A site saying "React" 3 times is more tech than one saying "website" 5 times. The score is `sum(weight × occurrences)`, with a cap at 3 occurrences per keyword (to prevent a site repeating "React" 50 times from exploding the score).


## 👤 Author

**Veronica Galeazzo** — Digital Designer & Front-End Developer
- Portfolio: [veronicagaleazzo.it](https://www.veronicagaleazzo.it)
- LinkedIn: [linkedin.com/in/veronica-galeazzo](https://www.linkedin.com/in/veronica-galeazzo)
- Email: galeazzo.ve@gmail.com