# AceMock – AI Driven Mock Interview & Feedback System

AceMock is a web-based AI-powered mock interview platform that helps users practice interviews, receive instant feedback, and improve their performance through structured evaluations.

---

## 🚀 Features

- AI-generated interview questions
- Real-time answer evaluation
- Per-question rating (out of 10)
- Detailed feedback & correct answers
- Overall interview rating
- User-friendly dashboard
- Secure database storage
- Responsive modern UI

---
## 🧩 System Architecture:
## User
##  │
##  ▼
## Next.js Frontend
 ## │
 ## ▼
## API Routes (Next.js)
 ## │
 ## ▼
## Google Gemini AI ── Evaluation
 ## │
 ## ▼
## Neon PostgreSQL (via Drizzle ORM)
---
## 🛠 Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React
- Tailwind CSS
- shadcn/ui

**Backend**
- Next.js API Routes
- Drizzle ORM
- Neon PostgreSQL

**AI**
- Google Gemini API

**Deployment**
- Vercel

---
## ⚙️ Installation & Setup:   
1️⃣ Clone the Repository
git clone https://github.com/yukta65/An-AI-Driven-Mock-Interview-and-Feedback-System.git
cd An-AI-Driven-Mock-Interview-and-Feedback-System

2️⃣ Install Dependencies
npm install
---
## ⚙️ Environment Variables

Create a .env.local file and add:

NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_neon_database_url

## ▶️ Run Locally
npm install
npm run dev

Visit: http://localhost:3000
