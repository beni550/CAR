# Rechev IL - PRD (Product Requirements Document)

## Original Problem Statement
Build "רכב IL" (Rechev IL) - Israeli vehicle lookup and analysis web application. Users enter vehicle plate number (typing/camera/gallery upload) and get full vehicle info: technical details, test validity, ownership, disability tag, theft status in real-time from data.gov.il APIs, with AI license plate recognition via Gemini.

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor)
- **AI**: Gemini 2.5-flash via Emergent LLM Key (emergentintegrations)
- **Auth**: Emergent-managed Google Auth
- **Data Source**: data.gov.il REST API (vehicle details, theft status, disability tag)

## User Personas
1. **Car Buyer**: Checking used cars before purchase (theft, test validity)
2. **Insurance Agent**: Quick vehicle lookup for assessments
3. **Curious Citizen**: Checking any vehicle seen on the street

## Core Requirements
- RTL Hebrew interface
- Vehicle search by plate number
- AI license plate recognition from camera/gallery
- Real-time data from government databases
- Status cards (theft/test/disability)
- User authentication (Google OAuth)
- Search history & favorites
- Free vs Pro pricing tiers
- Dark mode (default)
- Mobile-first responsive design

## What's Been Implemented (April 13, 2026)
### Phase 1 - MVP Complete
- [x] Landing page with hero search, feature cards, stats, pricing preview
- [x] Vehicle search via data.gov.il API (basic + pro details)
- [x] Status cards: theft check, test validity, disability tag
- [x] AI license plate recognition (Gemini 2.5-flash)
- [x] Emergent Google Auth (login/logout/session management)
- [x] Search history (CRUD, auth-protected)
- [x] Favorites/saved vehicles (CRUD, auth-protected)
- [x] Account page with user info
- [x] Pricing page with comparison table + FAQ accordion
- [x] Quick Search page (minimal, no navbar)
- [x] RTL Hebrew layout throughout
- [x] Dark mode with glass morphism design
- [x] Responsive design with mobile bottom nav
- [x] Framer Motion animations (staggered fade-ups, scroll reveals)
- [x] Israeli license plate visual component
- [x] Skeleton loading states

### Phase 2 - Stripe + Features (April 13, 2026)
- [x] Stripe payment integration for Pro ($5/month)
- [x] Motorcycle/two-wheeler support (parallel search)
- [x] Vehicle estimated value (price list + depreciation calc, Pro feature)
- [x] Fixed disability tag API (corrected resource_id + field name)
- [x] Demo Pro test user created

## Prioritized Backlog

### P0 (Critical)
- [x] Stripe payment integration for Pro plan ($5/month) - DONE

### P1 (Important)
- [ ] Vehicle comparison page (up to 3 vehicles)
- [ ] PDF export for vehicle reports
- [ ] AI scan daily limit (10/day for free users)
- [ ] Push notifications for test expiry

### P2 (Nice to Have)
- [ ] Blog with SEO content
- [ ] Google AdSense integration
- [ ] PWA support (manifest, service worker)
- [ ] Dark/Light mode toggle
- [ ] About/Privacy/Terms pages with content
- [ ] Vehicle image search (Google Images link)
- [ ] Share results (Web Share API)
- [ ] Keyboard shortcuts (Enter = search, Ctrl+K = focus)
- [ ] English language support
- [ ] API result caching in MongoDB (24h)

## Next Tasks
1. Implement Stripe integration for Pro subscriptions
2. Add vehicle comparison feature
3. Add AI scan rate limiting
4. Build PDF export for vehicle reports
5. Create blog infrastructure with SEO
