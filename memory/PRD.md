# CivicPulse — Product Requirements & Progress Log

## Original Problem Statement (Summary)
Build **CivicPulse**, an AI-powered Citizen Complaint & Resolution Management System.
Citizens report local civic problems (potholes, garbage, broken streetlights, water
leaks, drainage, etc.) via text, voice, photo, and map location. AI classifies,
translates (multilingual), prioritises, detects duplicates, and routes to the right
municipal department. Citizens track progress; admins act on complaints and post
proof-of-work photos before marking them resolved.

## Architecture
- **Frontend**: React (CRA) + Tailwind + shadcn/ui + Leaflet + Lucide React
- **Backend**: FastAPI + Motor (async MongoDB)
- **Auth**: JWT (HTTP-only cookies + Bearer header fallback, `bcrypt` password hash)
- **AI**: Emergent LLM Key via `emergentintegrations` library (OpenAI gpt-5.4-mini),
  rule-based fallback for offline/multilingual coverage

## User Personas & Roles
1. **Citizen** — submit complaints in any language, track via complaint number, receive
   in-app notifications, rate resolution quality, view proof-of-work photos.
2. **Administrator** — municipal officer who triages the queue, assigns departments,
   updates status (PENDING → ASSIGNED → IN PROGRESS → RESOLVED), and uploads proof-of-work
   evidence photos.
3. **Developer / System** — diagnostic role with access to system logs (privacy-shielded
   citizen data).

## Core Static Requirements
- Role-based routing: `/citizen` vs `/admin`; citizen cannot read other citizens' PII.
- Complaint number scheme: `CP-YYYY-XXXXX`.
- Every status change is appended to `status_history` (immutable audit trail).
- Admin must attach a proof-of-work photo when marking a complaint IN PROGRESS or RESOLVED.
- Citizen data is privacy-shielded from the admin (name/mobile masked; only ID + operational data shown).
- All backend routes prefixed with `/api`.
- `MONGO_URL` and `DB_NAME` come from `.env` only. No hardcoded secrets.

## What's Been Implemented (2026-02-21)
- ✅ Public landing page (`/`) with civic categories, live stats, how-it-works
- ✅ Login page with 1-click demo accounts (citizen / admin / dev)
- ✅ Citizen Dashboard: overview, new complaint form, map picker (Leaflet),
  photo upload, voice input, AI live analysis, my complaints table, timeline modal,
  feedback rating, notifications
- ✅ Admin Dashboard: overview stats, priority queue, complaint queue with search
  & filters, department list, ward analysis, system logs, manage-complaint modal
- ✅ **Proof-of-Work photo upload in admin's manage modal** (blocks IN PROGRESS / RESOLVED without a photo)
- ✅ Proof photos rendered inline in citizen's complaint timeline
- ✅ AI pipeline using Emergent LLM Key (`gpt-5.4-mini`) for language detection,
  translation, category classification, priority detection, department recommendation
- ✅ AI duplicate-complaint detection based on ward proximity + category
- ✅ In-app notification system (complaint filed, department assigned, status update,
  resolution — including a callout when a proof photo has been attached)
- ✅ Rule-based multilingual fallback (Bengali / Hindi / Tamil) when LLM is unavailable

## Prioritized Backlog

### P0 — MVP (DONE)
- ✅ Full citizen → admin lifecycle end-to-end
- ✅ Real AI pipeline with EMERGENT_LLM_KEY
- ✅ Admin proof-of-work photo upload

### P1 — Post-MVP polish
- Emergent Object Storage instead of base64 for proof photos (currently data URLs)
- SMS notification integration (Twilio) beyond in-app
- Real map heatmap of complaint density per ward
- Real speech-to-text via Whisper for VoiceInput (currently Web Speech API)

### P2 — Future
- CSV / PDF export of complaint reports
- Automated SLA breach flagging + escalation
- Multi-admin permissions (per-department)
- Public map view (anonymised) so citizens see nearby issues in their ward

## Files of Reference
- Backend
  - `/app/backend/server.py` — FastAPI routes (auth, complaints, admin, notifications)
  - `/app/backend/auth.py` — JWT, bcrypt, cookie/bearer auth
  - `/app/backend/ai_service.py` — Emergent LLM classifier + rule fallback
  - `/app/backend/seed_data.py` — initial admin/citizen/dev users + sample complaints
- Frontend
  - `/app/frontend/src/pages/LandingPage.jsx`
  - `/app/frontend/src/pages/LoginPage.jsx`
  - `/app/frontend/src/pages/CitizenDashboard.jsx`
  - `/app/frontend/src/pages/AdminDashboard.jsx`
  - `/app/frontend/src/components/MapPicker.jsx`
  - `/app/frontend/src/components/VoiceInput.jsx`
  - `/app/frontend/src/components/ComplaintTimeline.jsx` (renders proof photos)
  - `/app/frontend/src/context/AuthContext.jsx`
- Design/tests
  - `/app/design_guidelines.json`
  - `/app/memory/test_credentials.md`

## Test Credentials
Kept in `/app/memory/test_credentials.md`. Snapshot:
- Citizen: `9876543210` / `citizen123`
- Admin: `admin@civicpulse.org` / `admin123`
- Developer: `dev@civicpulse.org` / `dev123`
