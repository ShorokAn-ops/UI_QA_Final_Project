# ERPNext Risk Analyzer Dashboard - Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Backend API running on `http://localhost:8081`
- [ ] Dependencies installed (`npm install`)

## Environment Configuration

For local development and testing with ERPNext integration:

1. Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your ERPNext credentials:
   ```env
   ERPNEXT_BASE_URL=http://localhost:8080
   ERPNEXT_API_KEY=your_api_key_here
   ERPNEXT_API_SECRET=your_api_secret_here
   ERPNEXT_COMPANY=Your Company Name
   ERPNEXT_ITEM_ID=ITEM-001
   ```

These variables are required for:

- Creating test invoices via the `/api/test/invoice` endpoint
- Running UI tests that interact with ERPNext

**Note:** `.env.local` is gitignored and should never be committed to version control.

## Running the Dashboard

### Option 1: Using npm (Recommended)

```bash
npm run dev
```

### Option 2: Using the batch file (Windows)

Double-click `start.bat`

The dashboard will be available at: **http://localhost:3000**

## Testing Backend Connection

Before starting the dashboard, verify your backend is running:

```bash
curl http://localhost:8081/health
```

Expected response:

```json
{ "status": "ok" }
```

## Features Overview

### 1. Dashboard Summary (Top)

- Total Invoices
- Total Suppliers
- Critical Invoices Count
- High Risk Invoices Count

### 2. Invoices Table (Middle)

- Click the arrow (▶) to expand and see invoice items
- Color-coded risk levels
- Risk percentage displayed
- Shows quantity and unit price (required fields)

### 3. Vendor Analytics Charts (Bottom)

- Bar chart showing total invoices per vendor
- Stacked bar chart showing HIGH + CRITICAL risks per vendor

## Troubleshooting

### Dashboard shows loading forever

- Check if backend is running on port 8081
- Open browser console (F12) to see error messages
- Verify CORS is enabled on backend

### Data not refreshing

- Dashboard auto-refreshes every 5 seconds
- Check browser console for network errors

### Styling looks broken

- Run `npm install` again
- Clear browser cache (Ctrl+Shift+R)

## Project Structure Quick Reference

```
├── app/
│   ├── layout.tsx    # React Query setup + polling config
│   └── page.tsx      # Main dashboard page
├── components/       # All UI components
├── lib/             # API client + utilities
├── types/           # TypeScript definitions
└── package.json
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## API Endpoints Reference

| Endpoint                                     | Purpose                     |
| -------------------------------------------- | --------------------------- |
| `GET /health`                                | Check backend status        |
| `GET /invoices?limit=500&include_items=true` | Get all invoices with items |
| `GET /risk/anomalies?min_rate=0.6`           | Get risk analysis           |
| `GET /risk/vendors?min_rate=0.6`             | Get vendor statistics       |
| `GET /dashboard/summary`                     | Get KPI summary             |

## Design Principles

✅ **DO:**

- Backend is single source of truth
- Use provided API data as-is
- Display all optional fields gracefully (show N/A if missing)
- Keep UI light and professional

❌ **DON'T:**

- Calculate risk scores on frontend
- Modify/transform backend data
- Add dark theme
- Add upload/PDF features (read-only dashboard)

---

For issues or questions, check the browser console and network tab (F12).
