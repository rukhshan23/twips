# TwIPS

## Project Overview
**TwIPS (Texting with Interpret, Preview, and Suggest)** is a research prototype texting application that uses large language models (LLMs) to help autistic users interpret tone and intent in messages and compose replies that better match their intended meaning—while preserving user autonomy.

TwIPS was built as part of our work on supporting autistic users with conversational nuance in everyday text-based communication.

---

## Key Features (LLM-powered)

### Interpret
Explains the overall tone and meaning of an incoming message and highlights potentially ambiguous elements (e.g., sarcasm, metaphors, emojis). The UI can mark ambiguous fragments and provide short explanations to reduce guesswork.

### Preview
Lets users preview how their drafted message might be perceived by the recipient (e.g., emotional reaction). Preview can flag messages that may come across as blunt, depending on user interaction.

### Suggest
When a draft may come across as blunt, Suggest generates an alternative phrasing that preserves intent while softening delivery. Suggestions are optional—users remain in control.

---

## Model & Prompting
TwIPS used GPT-4 via Azure OpenAI for interpretation and rephrasing. Prompts were iteratively refined, and conversation history was included when needed for context.

---

## Evaluation
TwIPS was evaluated in an in-lab study with autistic participants using a two-phase design:
- A scripted conversation with an imaginary character (to ensure consistent scenarios)
- An AI-based simulation (to enable more dynamic interaction)

---

## Tech Stack
- JavaScript (frontend + backend prototype)
- LLM integration (Azure OpenAI)

---

## How to Run (Local)

> This is a research prototype. Some parts reflect study-specific wiring and may need minor adjustments.

### Prerequisites
- Node.js (16+ recommended)
- npm (or yarn)

### Install
```bash
npm install
npm start
npm run server
npm run client
```

### Paper

TwIPS: A Large Language Model Powered Texting Application to Simplify Conversational Nuances for Autistic Users (ACM ASSETS 2024)

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
