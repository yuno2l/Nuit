# CVE Explorer - Visual Threat Intelligence Platform

A modern, enterprise-grade vulnerability analysis and visualization platform built for the Rimini Street hackathon.

## Features

### 🔍 Single CVE Analyzer
- **Smart Search**: Search any CVE by ID with real-time data from NVD
- **Visual Metrics**: 
  - CVSS score gauge (0-10 scale with color-coded severity)
  - EPSS probability meter showing exploitation likelihood
- **Comprehensive Details**:
  - CWE (Common Weakness Enumeration) information
  - KEV (Known Exploited Vulnerabilities) status
  - Publication and modification dates
  - CVSS vector strings
  - Reference links

### 📊 Threat Overview Dashboard
- **Flexible Filtering**: 
  - Pre-configured vendor searches (Oracle, SAP, VMware, Microsoft, Apache)
  - Time period selection (1, 3, 6, 12 months)
- **Rich Visualizations**:
  - Top 10 CVSS vulnerabilities (horizontal bar chart)
  - Top 10 EPSS vulnerabilities (ranked list)
  - CVSS severity distribution (pie chart)
  - Top CWE categories (bar chart)
  - Timeline trend analysis (dual-axis line chart)
- **Key Statistics**:
  - Total CVEs found
  - Average CVSS score
  - Average EPSS probability
  - KEV count

### 🎨 Enterprise UI/UX
- Professional Rimini Street color scheme
- Dark/light mode support
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Loading states and error handling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **State**: React hooks + SWR for data fetching
- **APIs Integrated**:
  - NVD (National Vulnerability Database)
  - EPSS (Exploit Prediction Scoring System)
  - CISA KEV (Known Exploited Vulnerabilities)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
cd Nuit
npm install
```

2. **Set up environment variables** (optional):
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your NVD API key (recommended for higher rate limits):
```
NVD_API_KEY=your_api_key_here
```

Get an API key at: https://nvd.nist.gov/developers/request-an-api-key

3. **Run the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables (NVD_API_KEY)
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Project Structure

```
Nuit/
├── app/
│   ├── api/
│   │   ├── analytics/route.ts    # Analytics API endpoint
│   │   ├── autocomplete/route.ts # CVE autocomplete
│   │   └── cve/route.ts          # Single CVE details
│   ├── dashboard/
│   │   └── page.tsx              # Threat overview dashboard
│   ├── layout.tsx                # Root layout with navigation
│   ├── page.tsx                  # CVE search page
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── CVSSGauge.tsx            # CVSS score visualization
│   ├── EPSSMeter.tsx            # EPSS probability meter
│   ├── TopCVSSChart.tsx         # Top CVSS bar chart
│   ├── CVSSTimelineChart.tsx    # Timeline trend chart
│   ├── CVSSDistributionChart.tsx # Severity pie chart
│   ├── CWEDistributionList.tsx  # CWE category list
│   ├── StatsCard.tsx            # Statistics card
│   ├── Navigation.tsx           # Top navigation
│   └── ThemeProvider.tsx        # Dark mode provider
├── lib/
│   ├── api.ts                   # API integration layer
│   ├── cache.ts                 # In-memory caching
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # Utility functions
└── package.json
```

## API Rate Limits

- **NVD API**: 
  - Without API key: 5 requests per 30 seconds
  - With API key: 50 requests per 30 seconds
- **EPSS API**: No strict limits
- **KEV Catalog**: Static JSON, cached for 24 hours

The app includes automatic rate limiting and caching to stay within limits.

## Features Implemented

✅ Single CVE search with autocomplete  
✅ CVSS score gauge visualization  
✅ EPSS probability meter  
✅ KEV (Known Exploited) badge and details  
✅ CWE weakness information  
✅ Multi-vendor threat dashboard  
✅ Time period filtering (1-12 months)  
✅ Top 10 CVSS vulnerabilities chart  
✅ Top 10 EPSS vulnerabilities list  
✅ CVSS severity distribution  
✅ CWE category distribution  
✅ Timeline trend analysis  
✅ Dark/light mode  
✅ Fully responsive design  
✅ In-memory caching (24h TTL)  
✅ Error boundaries and loading states  

## Performance Optimizations

- Server-side API routes for backend logic
- In-memory caching with 24-hour TTL
- Lazy loading for charts
- Responsive images and icons
- Minimal bundle size with tree-shaking

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - Built for Rimini Street Hackathon

## Credits

- **APIs**: NVD, EPSS, CISA KEV
- **UI Components**: Shadcn/ui
- **Charts**: Recharts
- **Framework**: Next.js by Vercel

---

**Built with ❤️ for enterprise security teams**
