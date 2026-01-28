# ERPNext Risk Analyzer Dashboard

A professional, real-time React/Next.js dashboard for monitoring and analyzing invoice risks from ERPNext.

## Features

- 📊 **Real-time Dashboard** - Auto-refreshes every 5 seconds
- 🎯 **Risk Analysis** - Categorizes invoices by risk level (LOW, MEDIUM, HIGH, CRITICAL)
- 📈 **Vendor Analytics** - Visual charts showing risky vendors
- 📋 **Invoice Details** - Expandable rows showing items with quantities and prices
- 🎨 **Professional UI** - Clean, light-themed interface

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://localhost:8081`

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints Used

- `GET /health` - Health check
- `GET /invoices?limit=100&include_items=true` - Get invoices with items
- `GET /risk/anomalies?min_rate=0.6` - Get risk analysis
- `GET /risk/vendors?min_rate=0.6` - Get vendor analytics
- `GET /dashboard/summary` - Get dashboard statistics

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with React Query
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── DashboardSummary.tsx # KPI cards
│   ├── InvoicesTable.tsx    # Invoice list with expandable rows
│   └── VendorsChart.tsx     # Vendor risk charts
├── lib/
│   ├── api-client.ts        # API client
│   └── utils.ts             # Helper functions
├── types/
│   └── api.ts               # TypeScript types
└── package.json
```

## Risk Level Color Coding

- 🟢 **LOW** - Green
- 🟡 **MEDIUM** - Yellow
- 🟠 **HIGH** - Orange
- 🔴 **CRITICAL** - Red

## License

This project is part of an academic QA automation final project.
