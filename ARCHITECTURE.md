# 📐 Technical Architecture Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [API Integration](#api-integration)
5. [State Management](#state-management)
6. [Caching Strategy](#caching-strategy)
7. [Performance Optimizations](#performance-optimizations)
8. [Security](#security)

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│                    (Browser / React UI)                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Home Page   │  │  Dashboard   │  │  Components Library  │ │
│  │  (Multi-CVE) │  │  (Analytics) │  │  (Reusable UI)       │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘ │
└─────────┼──────────────────┼────────────────────────────────────┘
          │                  │
          │  HTTP/REST       │
          │  (JSON)          │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Application Server Layer                       │
│                     (Next.js 14 App Router)                      │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    API Routes                              │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │ │
│  │  │ /api/cve   │  │ /api/bulk  │  │ /api/migration     │ │ │
│  │  │ /analytics │  │ /autocmplt │  │ (AI endpoints)     │ │ │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  Business Logic Layer                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│ │
│  │  │  api.ts  │  │gemini.ts │  │ cache.ts │  │parser.ts ││ │
│  │  │ (NVD/KEV)│  │  (AI)    │  │(Memory)  │  │(Files)   ││ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│   External APIs  │  │  AI Services    │  │  Data Sources    │
│                  │  │                 │  │                  │
│  • NVD API       │  │  • Gemini API   │  │  • KEV Catalog   │
│  • EPSS API      │  │                 │  │  • CISA          │
└──────────────────┘  └─────────────────┘  └──────────────────┘
```

## Component Architecture

### Frontend Components Hierarchy

```
App (layout.tsx)
├── Navigation
│   ├── Theme Toggle
│   └── Route Links
│
├── Home Page (page.tsx)
│   ├── CVEInput
│   │   ├── Input (autocomplete)
│   │   ├── File Upload
│   │   └── CVE Tags (badges)
│   │
│   ├── Stats Summary Card
│   │
│   └── CVE Results
│       └── CVECard[] (multiple)
│           ├── Header (collapsible)
│           ├── CVSSGauge
│           ├── EPSSMeter
│           ├── KEV Details Card
│           ├── CWE Card
│           ├── References Card
│           └── NIRDRecommendations
│               ├── Warning Card
│               ├── Recommendations Card
│               └── MigrationChat (inline)
│
└── Dashboard Page (dashboard/page.tsx)
    ├── Filters
    │   ├── Vendor Select
    │   └── Time Period Select
    │
    ├── Stats Cards[]
    │   ├── Total CVEs
    │   ├── Avg CVSS
    │   ├── Avg EPSS
    │   └── KEV Count
    │
    └── Visualizations
        ├── TopCVSSChart
        ├── CVSSTimelineChart
        ├── CVSSDistributionChart
        └── CWEDistributionList
```

### Component Communication

```
User Action
    ↓
Component State Update (useState)
    ↓
API Call (fetch/axios)
    ↓
API Route Handler
    ↓
Business Logic (lib/)
    ↓
External API / AI Service
    ↓
Cache Layer (if applicable)
    ↓
Response Back Through Chain
    ↓
Component State Update
    ↓
UI Re-render
```

## Data Flow

### 1. Single CVE Lookup Flow

```typescript
// User enters CVE-2023-21839
CVEInput.onChange
    → setCveIds(['CVE-2023-21839'])
    → User clicks "Analyze"
    → searchCVEs()
        → POST /api/cve/bulk
            → getCVEDetails('CVE-2023-21839')
                → checkCache('nvd_CVE-2023-21839')
                    → CACHE MISS
                    → rateLimitNVD() // Wait if needed
                    → axios.get(NVD_API)
                    → fetchEPSSScores(['CVE-2023-21839'])
                    → fetchKEVCatalog()
                    → detectProprietarySoftware()
                    → setInCache()
                    → return CVEDetails
        → setCveDataList([cveDetails])
        → Render CVECard
            → detectProprietarySoftware() → isProprietary: true
            → Render NIRDRecommendations
                → POST /api/migration/recommendations
                    → generateMigrationRecommendations()
                        → Gemini API call
                        → Parse JSON response
                        → return MigrationRecommendation
                → Display alternatives
```

### 2. Bulk CVE Processing Flow

```typescript
// User uploads file with 10 CVE-IDs
FileInput.onChange
    → parseUploadedFile(file)
        → detect file type (.csv)
        → parseCsvFile(content)
            → regex match /CVE-\d{4}-\d{4,}/gi
            → return ['CVE-2023-1', 'CVE-2023-2', ...]
    → setCveIds(parsedIds)
    → User clicks "Analyze 10 CVEs"
    → POST /api/cve/bulk
        → Promise.allSettled([
            getCVEDetails('CVE-2023-1'),
            getCVEDetails('CVE-2023-2'),
            // ... parallel execution
          ])
        → Filter successful/failed
        → Return {
            total: 10,
            successful: 9,
            failed: 1,
            results: [CVEDetails[]],
            errors: [...]
          }
    → Display stats + CVECard for each
```

### 3. AI Chat Interaction Flow

```typescript
// User clicks "Get Personalized Migration Assistance"
setShowChat(true)
    → MigrationChat renders with initial message
    → User types: "What are the best alternatives?"
    → handleSend()
        → Add user message to state
        → POST /api/migration/chat
            {
              message: "What are the best alternatives?",
              conversationHistory: [previousMessages],
              context: { cveId, affectedProducts }
            }
            → chatWithMigrationAssistant()
                → Build full prompt with context
                → Gemini API generateContent()
                → return AI response text
        → Add assistant message to state
        → Scroll to bottom
```

### 4. Dashboard Analytics Flow

```typescript
// User selects "Oracle" + "6 months"
onChange vendor/months
    → searchParams update
    → GET /api/analytics?keyword=Oracle&months=6
        → Calculate date range
            → endDate: now
            → startDate: now - 6 months
        → Check if > 120 days
            → YES: Split into chunks
            → Create 3 chunks (60 days each)
        → For each chunk:
            → rateLimitNVD()
            → searchCVEsByDateRange()
            → Aggregate results
        → Process all CVEs:
            → Extract CVSS scores
            → Extract EPSS scores
            → Count KEV entries
            → Group by CWE
            → Group by date
        → Return AnalyticsData {
            totalCVEs, avgCVSS, avgEPSS,
            topCVSS[], topEPSS[],
            cvssDistribution[], cweDistribution[],
            timeline[]
          }
    → Render charts with Recharts
```

## API Integration

### Rate Limiting Implementation

```typescript
// lib/api.ts
let lastNVDCall = 0;
const NVD_RATE_LIMIT = 6000; // 6 seconds

async function rateLimitNVD() {
  const now = Date.now();
  const timeSinceLastCall = now - lastNVDCall;
  if (timeSinceLastCall < NVD_RATE_LIMIT) {
    const waitTime = NVD_RATE_LIMIT - timeSinceLastCall;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastNVDCall = Date.now();
}

// Before every NVD API call:
await rateLimitNVD();
const response = await axios.get(NVD_BASE_URL, {...});
```

### Date Range Chunking

```typescript
// Handles NVD 120-day limit
function splitDateRange(startDate: Date, endDate: Date) {
  const chunks = [];
  const MAX_DAYS = 119;
  let currentStart = new Date(startDate);
  
  while (currentStart < endDate) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + MAX_DAYS);
    
    if (currentEnd > endDate) {
      chunks.push({ start: currentStart, end: endDate });
      break;
    }
    
    chunks.push({ start: currentStart, end: currentEnd });
    currentStart.setDate(currentEnd.getDate() + 1);
  }
  
  return chunks;
}
```

### Error Handling Pattern

```typescript
// Consistent error handling across API routes
export async function POST(request: NextRequest) {
  try {
    const { param } = await request.json();
    
    // Validation
    if (!param) {
      return NextResponse.json(
        { error: "Parameter required" },
        { status: 400 }
      );
    }
    
    // Business logic
    const result = await someOperation(param);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Error in endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## State Management

### Local State (useState)

```typescript
// Component-level state
const [cveIds, setCveIds] = useState<string[]>([]);
const [loading, setLoading] = useState(false);
const [cveDataList, setCveDataList] = useState<CVEDetails[]>([]);
const [error, setError] = useState<string | null>(null);
```

### Lifting State Up

```typescript
// Parent manages CVE list
function HomePage() {
  const [cveIds, setCveIds] = useState<string[]>([]);
  
  return (
    <CVEInput onCVEsChange={setCveIds} />
    // Child component updates parent state
  );
}
```

### Context API (Theme)

```typescript
// app/layout.tsx
<ThemeProvider>
  <Navigation />
  {children}
</ThemeProvider>

// Any child component
const { theme, setTheme } = useTheme();
```

## Caching Strategy

### Cache Structure

```typescript
// lib/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<any>>();
```

### Cache Durations by Data Type

| Data Type | TTL | Reason |
|-----------|-----|--------|
| CVE Details | 15 min | Moderately dynamic |
| EPSS Scores | 1 hour | Daily updates |
| KEV Catalog | 24 hours | Infrequent changes |
| Analytics | 10 min | Frequently changing |
| Autocomplete | 5 min | Real-time feel |

### Cache Usage Pattern

```typescript
export async function fetchData(id: string) {
  const cacheKey = `data_${id}`;
  
  // Try cache first
  const cached = getFromCache<DataType>(cacheKey);
  if (cached) return cached;
  
  // Cache miss - fetch fresh data
  const data = await externalAPI.get(id);
  
  // Store in cache
  setInCache(cacheKey, data, 900000); // 15 min
  
  return data;
}
```

## Performance Optimizations

### 1. Parallel API Calls

```typescript
// Instead of sequential
for (const id of cveIds) {
  await getCVEDetails(id); // SLOW
}

// Use parallel processing
const results = await Promise.allSettled(
  cveIds.map(id => getCVEDetails(id))
); // FAST
```

### 2. Lazy Loading Components

```typescript
// Only load when needed
const MigrationChat = lazy(() => import('./MigrationChat'));

{showChat && <Suspense fallback={<Loader />}>
  <MigrationChat />
</Suspense>}
```

### 3. Memoization

```typescript
// Prevent unnecessary recalculations
const detection = useMemo(() => 
  detectProprietarySoftware(description, references, products),
  [description, references, products]
);
```

### 4. Debouncing Autocomplete

```typescript
// Wait 300ms after user stops typing
useEffect(() => {
  const debounce = setTimeout(() => {
    fetchSuggestions(inputValue);
  }, 300);
  
  return () => clearTimeout(debounce);
}, [inputValue]);
```

### 5. Request Deduplication

```typescript
// Prevent duplicate simultaneous requests
const pendingRequests = new Map<string, Promise<any>>();

async function fetchWithDedup(key: string, fetcher: () => Promise<any>) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  const promise = fetcher();
  pendingRequests.set(key, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(key);
  }
}
```

## Security

### 1. Environment Variable Protection

```typescript
// ✅ Server-side only
const apiKey = process.env.NVD_API_KEY;

// ❌ Never expose in client
// Don't use NEXT_PUBLIC_ for secrets
```

### 2. Input Validation

```typescript
// Validate CVE ID format
export function validateCveId(id: string): boolean {
  const pattern = /^CVE-\d{4}-\d{4,}$/i;
  return pattern.test(id);
}

// Sanitize user input
const sanitized = cveId.trim().toUpperCase();
if (!validateCveId(sanitized)) {
  throw new Error('Invalid CVE ID format');
}
```

### 3. Rate Limit Protection

```typescript
// Prevent abuse
const MAX_CVES_PER_REQUEST = 50;

if (cveIds.length > MAX_CVES_PER_REQUEST) {
  return NextResponse.json(
    { error: `Maximum ${MAX_CVES_PER_REQUEST} CVEs allowed` },
    { status: 400 }
  );
}
```

### 4. Error Message Sanitization

```typescript
// ❌ Don't expose internals
catch (error) {
  return NextResponse.json({ error: error.message });
}

// ✅ Generic error messages
catch (error) {
  console.error("Internal error:", error);
  return NextResponse.json({ error: "Internal server error" });
}
```

### 5. CORS Configuration

```typescript
// next.config.js - if needed
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST' },
        ],
      },
    ];
  },
};
```

## Deployment Considerations

### Environment Variables

```bash
# Production .env
NVD_API_KEY=prod_key_here
GEMINI_API_KEY=prod_gemini_key
NODE_ENV=production
```

### Build Optimization

```bash
# Next.js automatically optimizes
npm run build

# Outputs:
# - Static pages pre-rendered
# - API routes serverless functions
# - Assets optimized and cached
```

### Monitoring

```typescript
// Add logging for production
if (process.env.NODE_ENV === 'production') {
  console.log(`[${new Date().toISOString()}] API call: ${endpoint}`);
}
```

---

**Last Updated**: December 5, 2025
**Version**: 1.0.0
**Maintainer**: yuno2l
