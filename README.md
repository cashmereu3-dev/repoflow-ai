# RepoFlow AI

A modern, AI-powered platform for vehicle repossession, collateral recovery, borrower communication, and lender visibility. Built for the modern repossession industry.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Supabase (PostgreSQL, RLS, Edge Functions, Realtime)
- **AI Engine:** OpenAI (GPT-4o Vision, Whisper, GPT-4o-mini)
- **Auth:** Supabase Auth (Email + Google OAuth)

## Core Modules

- **Assignment Management:** Create and track vehicle repossession assignments.
- **Agent Mobile App:** Mobile-first progressive web app for field agents with GPS and media uploads.
- **AI Documentation Engine:** Automatically extracts vehicle details (VIN, Make, Model, Color, License Plate) and location data from uploaded photos and voice notes.
- **Borrower Portal:** Secure portal for borrowers to view account status, schedule voluntary surrenders, and communicate with lenders.
- **Live Operations Dashboard:** Real-time visibility into active operations, agent locations, and recovery metrics.
- **Compliance Engine:** Immutable audit logs tracking every system action for strict compliance and SOC2 readiness.
- **AI Analytics:** Predictive modeling generating a 0-100 Recovery Probability Score based on timing, location, history, and agent performance.

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/repoflow-ai.git
   cd repoflow-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```

4. Database Setup:
   Run the migration file located in `supabase/migrations/001_initial_schema.sql` against your Supabase project to generate the schema, roles, RLS policies, and triggers.

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

This application is ready to be deployed on Vercel. 
Connect your GitHub repository to Vercel and ensure the following environment variables are set in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`
