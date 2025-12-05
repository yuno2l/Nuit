# 🛡️ Nuit - CVE Explorer & Digital Sovereignty Platform

[![AGPL License](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://opensource.org/licenses/AGPL-3.0)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/yuno2l/Nuit)


**Live Demo**: [https://nuit-nu.vercel.app](https://nuit-nu.vercel.app)  

A modern, AI-powered vulnerability analysis platform with digital sovereignty recommendations and multi-CVE processing capabilities.

## ✨ Key Features

### 🔍 Multi-CVE Analysis
- **Bulk Processing**: Analyze up to 50 CVEs simultaneously
- **Smart Input Methods**:
  - Manual entry with autocomplete (starts after 3 characters)
  - File upload support (TXT, CSV, XLSX)
  - Tag-based CVE management (add/remove easily)
- **Collapsible Cards**: Efficient viewing of multiple CVEs with expand/collapse
- **Visual Metrics**: 
  - CVSS score gauge (0-10 scale with color-coded severity)
  - EPSS probability meter showing exploitation likelihood
- **Comprehensive Details**:
  - CWE (Common Weakness Enumeration) information
  - KEV (Known Exploited Vulnerabilities) status
  - Publication and modification dates
  - CVSS vector strings
  - Reference links

### 🤖 AI-Powered Migration Assistant (Gemini)
- **Digital Sovereignty Alerts**: Automatic detection of Windows/Oracle vulnerabilities
- **NIRD Recommendations**: 
  - Open-source alternatives with maturity ratings
  - Migration complexity assessment
  - Key considerations for transition
  - Durable integration strategies
- **Interactive AI Chat**:
  - Context-aware migration guidance
  - Personalized step-by-step planning
  - Inline chat interface with conversation history
  - Scrollable chat without page interference

### 📊 Threat Overview Dashboard
- **Flexible Filtering**: 
  - Pre-configured vendor searches (Oracle, SAP, VMware, Microsoft, Apache)
  - Time period selection (1, 3, 6, 12 months)
  - Automatic 120-day chunking for large date ranges
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

### 🎨 Professional UI/UX
- Modern, clean interface with Rimini Street branding
- Dark/light mode support with system preference detection
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and loading states
- Comprehensive error handling

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, React Server Components)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **HTTP Client**: Axios
- **State Management**: React hooks + SWR for data fetching
- **Icons**: Lucide React

### 🔗 Data Sources & APIs
- **NVD (National Vulnerability Database)**: CVE details, CVSS scores, CWE information
- **EPSS (Exploit Prediction Scoring System)**: Exploitation probability scores
- **CISA KEV (Known Exploited Vulnerabilities)**: Critical vulnerability catalog
- **Google Gemini API**: AI-powered migration recommendations and chat assistant

## 🎛️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher ([Download](https://nodejs.org/))
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: For cloning the repository

### API Keys (Recommended)

1. **NVD API Key** (Optional but recommended):
   - Without key: 5 requests/30 seconds
   - With key: 50 requests/30 seconds
   - Get one at: https://nvd.nist.gov/developers/request-an-api-key

2. **Gemini API Key** (Required for AI features):
   - Free tier available
   - Get one at: https://aistudio.google.com/app/apikey

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yuno2l/Nuit.git
cd Nuit
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js, React, TypeScript
- Tailwind CSS and UI components
- Axios for API calls
- Google Generative AI SDK
- Recharts for visualizations

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# NVD API Key (optional but recommended for higher rate limits)
NVD_API_KEY=your_nvd_api_key_here

# Upstash Redis (optional for distributed caching)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Gemini API Key (required for AI migration recommendations)
GEMINI_API_KEY=your_gemini_api_key_here
```

**Note**: The application will work without API keys but with limited functionality:
- Without NVD key: Slower rate limits (5 req/30s)
- Without Gemini key: No AI recommendations or migration chat

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

This creates an optimized production build and starts the server on port 3000.

## 📁 Project Structure

```
Nuit/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Server-side)
│   │   ├── analytics/
│   │   │   └── route.ts          # Analytics API endpoint
│   │   ├── autocomplete/
│   │   │   └── route.ts          # CVE autocomplete suggestions
│   │   ├── cve/
│   │   │   ├── route.ts          # Single CVE details
│   │   │   └── bulk/
│   │   │       └── route.ts      # Bulk CVE processing (up to 50)
│   │   └── migration/
│   │       ├── chat/
│   │       │   └── route.ts      # AI chat endpoint
│   │       └── recommendations/
│   │           └── route.ts      # Migration recommendations
│   ├── dashboard/
│   │   └── page.tsx              # Threat overview dashboard
│   ├── layout.tsx                # Root layout with navigation
│   ├── page.tsx                  # Main CVE search page
│   └── globals.css               # Global styles + Tailwind
│
├── components/                   # React Components
│   ├── ui/                       # Shadcn UI base components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── tabs.tsx
│   ├── CVECard.tsx              # Collapsible CVE display card
│   ├── CVEInput.tsx             # Multi-CVE input with autocomplete
│   ├── CVSSGauge.tsx            # CVSS score visualization
│   ├── CVSSTimelineChart.tsx    # Timeline trend chart
│   ├── CVSSDistributionChart.tsx # Severity pie chart
│   ├── CWEDistributionList.tsx  # CWE category list
│   ├── EPSSMeter.tsx            # EPSS probability meter
│   ├── MigrationChat.tsx        # AI chat interface
│   ├── Navigation.tsx           # Top navigation bar
│   ├── NIRDRecommendations.tsx  # Digital sovereignty recommendations
│   ├── StatsCard.tsx            # Statistics display card
│   ├── ThemeProvider.tsx        # Dark/light mode provider
│   └── TopCVSSChart.tsx         # Top CVSS bar chart
│
├── lib/                          # Core Logic & Utilities
│   ├── api.ts                   # API integration layer
│   │                            # - NVD, EPSS, KEV fetching
│   │                            # - Rate limiting
│   │                            # - Date range chunking
│   ├── cache.ts                 # In-memory caching system
│   ├── fileParser.ts            # File upload parser (TXT/CSV/XLSX)
│   ├── gemini.ts                # Gemini AI integration
│   │                            # - Migration recommendations
│   │                            # - Chat assistant
│   │                            # - Proprietary software detection
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # Utility functions
│
├── types/                        # Type definitions
│   └── next-themes.d.ts         # Theme types
│
├── .env.local.example           # Environment variables template
├── .env.local                   # Your local environment (gitignored)
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## 🧱 Application Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  CVE Search  │  │  Dashboard   │  │  Migration   │         │
│  │     Page     │  │     Page     │  │     Chat     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App (Server)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes Layer                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │  │
│  │  │ /api/cve   │  │ /api/bulk  │  │ /api/migration  │   │  │
│  │  │  - Single  │  │  - Multi   │  │  - Chat         │   │  │
│  │  │  - Details │  │  - Process │  │  - Recommend    │   │  │
│  │  └──────┬─────┘  └──────┬─────┘  └────────┬────────┘   │  │
│  └─────────┼────────────────┼──────────────────┼────────────┘  │
│            │                │                  │                │
│  ┌─────────▼────────────────▼──────────────────▼────────────┐  │
│  │              Core Business Logic Layer                    │  │
│  │  ┌─────────────┐  ┌──────────┐  ┌─────────────────┐    │  │
│  │  │   api.ts    │  │ gemini.ts│  │  fileParser.ts  │    │  │
│  │  │  - NVD API  │  │  - AI    │  │  - TXT/CSV/XLS  │    │  │
│  │  │  - EPSS     │  │  - Chat  │  │  - CVE Extract  │    │  │
│  │  │  - KEV      │  │  - Detect│  │                 │    │  │
│  │  └──────┬──────┘  └────┬─────┘  └─────────────────┘    │  │
│  └─────────┼──────────────┼─────────────────────────────────┘  │
│            │              │                                     │
│  ┌─────────▼──────────────▼─────────────────────────────────┐  │
│  │              Caching Layer (cache.ts)                     │  │
│  │   In-Memory Map with TTL (15 min - 24 hours)             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│   NVD API    │  │  EPSS API    │  │  Google Gemini   │
│  (nvd.nist)  │  │  (first.org) │  │  AI API          │
└──────────────┘  └──────────────┘  └──────────────────┘
```

### Data Flow

#### 1. Single CVE Analysis
```
User Input (CVE-ID)
  → API Route (/api/cve)
    → api.ts: fetchCVEFromNVD()
      → Check cache
      → If miss: Call NVD API with rate limiting
      → Fetch EPSS score
      → Fetch KEV catalog
      → Detect proprietary software
    → Return enriched CVE data
  → Display with CVECard component
    → If proprietary: Show NIRDRecommendations
      → Fetch AI recommendations (Gemini)
      → Show inline chat option
```

#### 2. Bulk CVE Processing
```
User Input (Multiple CVE-IDs or File)
  → fileParser.ts: Extract CVE-IDs from file
  → CVEInput component: Manage CVE tags
  → API Route (/api/cve/bulk)
    → Process up to 50 CVEs in parallel
    → Promise.allSettled for fault tolerance
    → Return successful + failed stats
  → Display multiple CVECard components
```

#### 3. AI Migration Assistant
```
User clicks "Get Personalized Migration Assistance"
  → API Route (/api/migration/recommendations)
    → gemini.ts: generateMigrationRecommendations()
      → Analyze CVE description
      → Generate open-source alternatives
      → Assess migration complexity
    → Return structured recommendations
  → Display in NIRDRecommendations component
  
User interacts with chat
  → API Route (/api/migration/chat)
    → gemini.ts: chatWithMigrationAssistant()
      → Context-aware responses
      → Conversation history tracking
    → Return AI response
  → Display in MigrationChat component
```

### Key Design Patterns

#### 1. **API Route Pattern**
- Server-side API routes handle external API calls
- Prevents CORS issues and protects API keys
- Centralized error handling and rate limiting

#### 2. **Caching Strategy**
- In-memory cache with TTL
- Different cache durations by data type:
  - CVE details: 15 minutes
  - KEV catalog: 24 hours
  - Analytics data: 10 minutes
- Reduces API calls and improves performance

#### 3. **Rate Limiting**
- Automatic 6-second delay between NVD calls (without key)
- Respects NVD API guidelines
- Prevents 429 (Too Many Requests) errors

#### 4. **Date Range Chunking**
- NVD API limit: 120 days per request
- Automatic splitting into 119-day chunks
- Sequential processing with rate limiting
- Aggregates results transparently

#### 5. **Progressive Enhancement**
- Core functionality works without API keys
- AI features degrade gracefully if Gemini unavailable
- File upload supports multiple formats
- Autocomplete enhances but not required

### Performance Optimizations

1. **Parallel Processing**: Bulk CVE fetching uses Promise.allSettled
2. **Smart Caching**: Reduces redundant API calls
3. **Lazy Loading**: Components load on demand
4. **Code Splitting**: Next.js automatic route-based splitting
5. **Server Components**: Default server-side rendering where possible

### Security Considerations

1. **Environment Variables**: API keys stored securely in .env.local
2. **Server-Side API Calls**: No client-side exposure of keys
3. **Input Validation**: CVE ID format validation
4. **Rate Limiting**: Prevents abuse
5. **Error Handling**: No sensitive data in error messages

## 🔗 External Data Sources

### 1. NVD (National Vulnerability Database)
- **URL**: https://services.nvd.nist.gov/rest/json/cves/2.0
- **Purpose**: CVE details, CVSS scores, CWE mappings, references
- **Rate Limits**: 5 req/30s (no key), 50 req/30s (with key)
- **Data Freshness**: Near real-time updates
- **Cache Duration**: 15 minutes

### 2. EPSS (Exploit Prediction Scoring System)
- **URL**: https://api.first.org/data/v1/epss
- **Purpose**: Exploitation probability scores (0-1 scale)
- **Rate Limits**: Generous, no strict enforcement
- **Data Freshness**: Daily updates
- **Cache Duration**: 1 hour

### 3. CISA KEV (Known Exploited Vulnerabilities)
- **URL**: https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
- **Purpose**: Critical vulnerabilities exploited in the wild
- **Rate Limits**: Static file, no limits
- **Data Freshness**: Updated as vulnerabilities are confirmed
- **Cache Duration**: 24 hours

### 4. Google Gemini API
- **URL**: https://generativelanguage.googleapis.com/v1beta/
- **Model**: gemini-1.5-flash
- **Purpose**: AI-powered migration recommendations and chat
- **Rate Limits**: Generous free tier
- **Features Used**:
  - Text generation for recommendations
  - Conversational chat with context
  - JSON-structured responses

## 🚀 Features Implemented

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

## 📖 How to Use

### Analyzing Single or Multiple CVEs

1. **Navigate to the homepage** (http://localhost:3000)
2. **Add CVEs using any method**:
   - **Type directly**: Start typing "CVE-" and select from autocomplete suggestions
   - **Manual entry**: Type full CVE-ID and press Enter
   - **Upload file**: Click "Upload File" and select TXT/CSV/XLSX containing CVE-IDs
3. **Click "Analyze X CVEs"** button
4. **View results**:
   - Summary stats (total, successful, failed)
   - Collapsible cards for each CVE
   - Click any card to expand full details

### Using the Threat Dashboard

1. **Navigate to Dashboard** (click "Dashboard" in navigation)
2. **Select vendor** from dropdown (Oracle, Microsoft, SAP, etc.)
3. **Choose time period** (1, 3, 6, or 12 months)
4. **View analytics**:
   - Total CVEs and averages
   - Top 10 critical vulnerabilities
   - Severity distribution
   - CWE categories
   - Timeline trends

### Getting Migration Recommendations

1. **Search for a Windows/Oracle CVE** (e.g., CVE-2023-21839)
2. **Scroll to orange "Digital Dependency Risk" card**
3. **Review AI-generated recommendations**:
   - Open-source alternatives
   - Migration complexity
   - Key considerations
   - Durable integration tips
4. **Click "Get Personalized Migration Assistance"**
5. **Chat with AI assistant**:
   - Ask specific questions
   - Get step-by-step guidance
   - Scroll within chat without moving page

### File Upload Format Examples

**TXT File (one per line or mixed):**
```
CVE-2021-44228
CVE-2023-21839
Additional text can be here CVE-2023-34048 more text
```

**CSV File:**
```csv
CVE ID,Severity,Status
CVE-2021-44228,Critical,Patched
CVE-2023-21839,High,Open
CVE-2023-34048,Critical,Patched
```

**XLSX/XLS:** Any column containing CVE-IDs will be extracted automatically.

## 🔧 Troubleshooting

### Common Issues

**Issue**: "Error fetching CVE data"
- **Solution**: Check your internet connection and NVD API status

**Issue**: "Maximum 50 CVEs can be processed at once"
- **Solution**: Split your CVE list into smaller batches

**Issue**: "Rate limit exceeded"
- **Solution**: Add NVD_API_KEY to .env.local for higher limits

**Issue**: "Migration assistant not available"
- **Solution**: Add GEMINI_API_KEY to .env.local

**Issue**: Autocomplete not working
- **Solution**: Type at least 3 characters to trigger suggestions

**Issue**: Date range errors on dashboard
- **Solution**: App automatically chunks requests over 120 days, wait for completion

## 🎯 Future Enhancements

- [ ] Export results to PDF/Excel
- [ ] Advanced filtering and sorting
- [ ] User accounts and saved searches
- [ ] Real-time notifications for new CVEs
- [ ] Integration with SIEM systems
- [ ] Machine learning for prioritization
- [ ] Multi-language support
- [ ] Collaborative workspace features

## 📝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

See the [LICENSE](LICENSE) file for the full license text.

### Why AGPL v3.0?
- Ensures software freedom remains for web applications
- Requires source code sharing when modified versions are run on a server
- Aligns with hackathon requirements for open source contributions
- Protects the community while allowing commercial use

### Quick Summary
✅ **You can:**
- Use, study, and modify the code
- Distribute original or modified versions
- Use commercially (with AGPL requirements)

✅ **You must:**
- Disclose source code when running modified versions on a server
- Include copyright and license notices
- State changes made to the code

✅ **You cannot:**
- Relicense or remove the AGPL requirements
- Hold authors liable for damages (within limits)

For more information, visit: https://choosealicense.com/licenses/agpl-3.0/

## 🙏 Credits & Acknowledgments

### Data Sources
- **NVD (NIST)**: National Vulnerability Database
- **FIRST.org**: EPSS scoring system
- **CISA**: Known Exploited Vulnerabilities catalog
- **Google**: Gemini AI API

### Technology Stack
- **Vercel**: Next.js framework and hosting
- **Shadcn/ui**: Beautiful UI components
- **Recharts**: Data visualization library
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

### Inspiration
Built to address the growing need for:
- Digital sovereignty awareness
- Open-source migration strategies
- Efficient vulnerability analysis
- AI-assisted security decision-making

---

**🛡️ Built with dedication for security professionals and digital sovereignty advocates**

Made with ❤️ by [yuno2l](https://github.com/yuno2l)
