 # TwIPS

## Project Overview
**TwIPS (Texting with Interpret, Preview, and Suggest)** is a research prototype texting application that uses large language models (LLMs) to help autistic users interpret tone and intent in online messaging.

---

## Key Features

### Interpret
Explains the overall tone and meaning of an incoming message and highlights potentially ambiguous elements (e.g., sarcasm, metaphors, emojis). The UI can mark ambiguous fragments and provide short explanations.

### Preview
Lets users preview how their message might be perceived by the recipient (e.g., the recipient's emotional reaction). Preview can flag messages that may come across as blunt.

### Suggest
When a draft may come across as blunt, Suggest generates an alternative phrasing that preserves intent while softening the tone.

---

## Model & Prompting
TwIPS uses GPT-4 via Azure OpenAI.

---

## Evaluation
TwIPS was evaluated in an in-lab study with autistic participants using a two-phase design:
- A scripted conversation to evaluate Preview and Suggest.
- An AI-based simulation to evaluate Interpret.

---

## Tech Stack
- React/JS (frontend)
- Node/Express (backend)
- Azure OpenAI API

---

## How to Run (Local)

This project has two parts:
- **Frontend** in `public/` (contains its own `package.json` and `src/`)
- **Backend** in `server/` (contains its own `package.json` and `index.js`)

### Prerequisites
- Node.js 16+ recommended
- npm (or yarn)

### Install dependencies

Frontend:
```bash
cd public
npm install
cd ..
```

Backend:
```bash
cd server
npm install
cd ..
```
Configure environment variables in LLMInterpretation.jsx

Run (two terminals)

Terminal 1 — backend:

```bash
cd server
npm start
```

Terminal 2 — frontend:

```bash
cd public
npm start
```
Open the UI (commonly http://localhost:3000)

## Paper

**TwIPS: A Large Language Model Powered Texting Application to Simplify Conversational Nuances for Autistic Users.**  
In *Proceedings of the 26th International ACM SIGACCESS Conference on Computers and Accessibility (ASSETS 2024).*  
PDF: https://rukhshan23.github.io/twips.pdf


### Citation

@inproceedings{10.1145/3663548.3675633,
        author = {Haroon, Rukhshan and Dogar, Fahad},
        title = {TwIPS: A Large Language Model Powered Texting Application to Simplify Conversational Nuances for Autistic Users},
        year = {2024},
        isbn = {9798400706776},
        publisher = {Association for Computing Machinery},
        address = {New York, NY, USA},
        url = {https://doi.org/10.1145/3663548.3675633},
        doi = {10.1145/3663548.3675633},
        booktitle = {Proceedings of the 26th International ACM SIGACCESS Conference on Computers and Accessibility},
        articleno = {24},
        numpages = {18},
        location = {St. John's, NL, Canada},
        series = {ASSETS '24}
        }
