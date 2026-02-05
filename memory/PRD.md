# MoltBot + Lead Scraper PRD

## Original Problem Statement
User wanted to continue building a Multi-Industry Lead Scraper that was started in another Emergent chat (Job ID: 720d10d8-0102-4f23-b5a6-0c5dcec525e0). The previous agent was asleep, so the features were recreated from documentation.

## Architecture
- **Backend**: FastAPI (Python) with MongoDB
- **Frontend**: React with TailwindCSS
- **Browser Automation**: Playwright for Facebook scraping
- **MoltBot Integration**: OpenClaw AI assistant gateway

## User Personas
1. **Lead Generator**: Sales professionals scraping Facebook groups for business contacts
2. **Marketing Teams**: Collecting leads across multiple industries for outreach campaigns

## Core Requirements
- Multi-industry support (6 industries: Plumbing, HVAC, Electrical, Remodeling, Landscaping, Power Washing)
- Facebook cookie-based authentication
- Infinite scroll scraping with progress tracking
- CSV export with auto-tagging
- File management dashboard

## What's Been Implemented (Feb 4, 2026)

### Backend APIs
- `GET /api/scraper/industries` - List supported industries
- `POST /api/scraper/detect-industry` - Auto-detect industry from text
- `GET /api/scraper/cookies/status` - Check cookie configuration
- `POST /api/scraper/cookies/save` - Save Facebook cookies
- `DELETE /api/scraper/cookies` - Delete cookies
- `POST /api/scraper/start` - Start scraping job
- `GET /api/scraper/job/{job_id}` - Get job status
- `POST /api/scraper/job/{job_id}/stop` - Stop job
- `GET /api/scraper/jobs` - List job history
- `GET /api/scrapes` - List CSV files
- `POST /api/scrapes/upload` - Upload CSV
- `GET /api/scrapes/download/{filename}` - Download CSV
- `DELETE /api/scrapes/{filename}` - Delete CSV

### Frontend Pages
- `/scraper` - Lead Scraper Dashboard
  - Industry selector with auto-detection
  - Cookie configuration panel
  - URL input for Facebook groups
  - Real-time job progress
  - Job history panel
- `/scrapes` - Scrape Database Dashboard
  - File listing with metadata
  - Auto-tagging (industry, leads, etc.)
  - Search and filter
  - Upload/Download/Delete
  - Quick download links

### Key Files
- `/app/backend/server.py` - Main API server
- `/app/backend/fb_scraper.py` - Playwright scraping logic
- `/app/backend/industry_config.py` - Industry keywords
- `/app/frontend/src/pages/ScraperDashboard.jsx`
- `/app/frontend/src/pages/ScrapeDashboard.jsx`

## Security
- High-entropy slug generation (64 bits via secrets.token_hex(8))
- No credential exposure in URLs
- Facebook cookies stored server-side only

## Prioritized Backlog

### P0 (Critical)
- ✅ Basic scraping workflow
- ✅ File management
- ✅ Industry detection

### P1 (High)
- Profile deep scraping with contact extraction
- Job persistence across restarts
- Error recovery and retry logic

### P2 (Medium)
- Export to CRM formats
- Scheduled scraping jobs
- Duplicate lead detection

## Next Tasks
1. User needs to provide Facebook cookies to enable actual scraping
2. Test with real Facebook group URLs
3. Add more detailed profile scraping (phone, website, address extraction)
