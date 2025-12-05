import axios from "axios";
import { getFromCache, setInCache } from "./cache";
import type { NVDResponse, EPSSResponse, KEVCatalog, CVEDetails } from "./types";

const NVD_BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const EPSS_BASE_URL = "https://api.first.org/data/v1/epss";
const KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";

// Rate limiting helper
let lastNVDCall = 0;
const NVD_RATE_LIMIT = 6000; // 6 seconds between calls (without API key)

async function rateLimitNVD() {
  const now = Date.now();
  const timeSinceLastCall = now - lastNVDCall;
  if (timeSinceLastCall < NVD_RATE_LIMIT) {
    await new Promise(resolve => setTimeout(resolve, NVD_RATE_LIMIT - timeSinceLastCall));
  }
  lastNVDCall = Date.now();
}

export async function fetchCVEFromNVD(cveId: string): Promise<NVDResponse | null> {
  const cacheKey = `nvd_${cveId}`;
  const cached = getFromCache<NVDResponse>(cacheKey);
  if (cached) return cached;

  try {
    await rateLimitNVD();
    const response = await axios.get(NVD_BASE_URL, {
      params: { cveId },
      headers: process.env.NVD_API_KEY ? { "apiKey": process.env.NVD_API_KEY } : {},
      timeout: 10000,
    });

    if (response.data && response.data.vulnerabilities?.length > 0) {
      setInCache(cacheKey, response.data);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching CVE ${cveId} from NVD:`, error);
    return null;
  }
}

export async function searchCVEsFromNVD(keyword: string, resultsPerPage = 20): Promise<NVDResponse | null> {
  const cacheKey = `nvd_search_${keyword}_${resultsPerPage}`;
  const cached = getFromCache<NVDResponse>(cacheKey);
  if (cached) return cached;

  try {
    await rateLimitNVD();
    const response = await axios.get(NVD_BASE_URL, {
      params: {
        keywordSearch: keyword,
        resultsPerPage,
      },
      headers: process.env.NVD_API_KEY ? { "apiKey": process.env.NVD_API_KEY } : {},
      timeout: 15000,
    });

    if (response.data) {
      setInCache(cacheKey, response.data);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Error searching CVEs for keyword "${keyword}":`, error);
    return null;
  }
}

// Helper function to split date ranges into 120-day chunks (NVD API limit)
function splitDateRange(startDate: Date, endDate: Date): Array<{ start: Date; end: Date }> {
  const chunks: Array<{ start: Date; end: Date }> = [];
  const MAX_DAYS = 119; // Use 119 to be safe with the 120-day limit
  
  let currentStart = new Date(startDate);
  
  while (currentStart < endDate) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + MAX_DAYS);
    
    // Don't exceed the end date
    if (currentEnd > endDate) {
      chunks.push({ start: new Date(currentStart), end: new Date(endDate) });
      break;
    }
    
    chunks.push({ start: new Date(currentStart), end: new Date(currentEnd) });
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1); // Move to next day
  }
  
  return chunks;
}

export async function searchCVEsByDateRange(
  keyword: string,
  pubStartDate: string,
  pubEndDate: string,
  resultsPerPage = 100
): Promise<NVDResponse | null> {
  const cacheKey = `nvd_date_${keyword}_${pubStartDate}_${pubEndDate}_${resultsPerPage}`;
  const cached = getFromCache<NVDResponse>(cacheKey);
  if (cached) return cached;

  try {
    const startDate = new Date(pubStartDate);
    const endDate = new Date(pubEndDate);
    
    // Calculate the difference in days
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If the range is within 120 days, make a single request
    if (daysDiff <= 120) {
      await rateLimitNVD();
      const response = await axios.get(NVD_BASE_URL, {
        params: {
          keywordSearch: keyword,
          pubStartDate,
          pubEndDate,
          resultsPerPage,
        },
        headers: process.env.NVD_API_KEY ? { "apiKey": process.env.NVD_API_KEY } : {},
        timeout: 20000,
      });

      if (response.data) {
        setInCache(cacheKey, response.data);
        return response.data;
      }
      return null;
    }
    
    // Split into multiple requests for date ranges exceeding 120 days
    console.log(`Date range exceeds 120 days (${daysDiff} days). Splitting into chunks...`);
    const chunks = splitDateRange(startDate, endDate);
    console.log(`Split into ${chunks.length} chunks`);
    
    const allVulnerabilities: any[] = [];
    let totalResults = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkStart = chunk.start.toISOString().split('T')[0] + 'T00:00:00.000';
      const chunkEnd = chunk.end.toISOString().split('T')[0] + 'T23:59:59.999';
      
      console.log(`Fetching chunk ${i + 1}/${chunks.length}: ${chunkStart} to ${chunkEnd}`);
      
      await rateLimitNVD();
      const response = await axios.get(NVD_BASE_URL, {
        params: {
          keywordSearch: keyword,
          pubStartDate: chunkStart,
          pubEndDate: chunkEnd,
          resultsPerPage,
        },
        headers: process.env.NVD_API_KEY ? { "apiKey": process.env.NVD_API_KEY } : {},
        timeout: 20000,
      });
      
      if (response.data?.vulnerabilities) {
        allVulnerabilities.push(...response.data.vulnerabilities);
        totalResults = response.data.totalResults || allVulnerabilities.length;
      }
    }
    
    // Combine all results into a single response
    const combinedResponse: NVDResponse = {
      resultsPerPage,
      startIndex: 0,
      totalResults: allVulnerabilities.length,
      format: 'NVD_CVE',
      version: '2.0',
      timestamp: new Date().toISOString(),
      vulnerabilities: allVulnerabilities,
    };
    
    setInCache(cacheKey, combinedResponse);
    return combinedResponse;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.error("Error searching CVEs by date range:", error.response.headers.message || error.message);
    } else {
      console.error("Error searching CVEs by date range:", error);
    }
    return null;
  }
}

export async function fetchEPSSScores(cveIds: string[]): Promise<Map<string, { epss: number; percentile: number }>> {
  const cacheKey = `epss_${cveIds.join(",")}`;
  const cached = getFromCache<Map<string, { epss: number; percentile: number }>>(cacheKey);
  if (cached) return new Map(cached);

  const epssMap = new Map<string, { epss: number; percentile: number }>();

  try {
    // EPSS API allows comma-separated CVE IDs
    const cveParam = cveIds.join(",");
    const response = await axios.get<EPSSResponse>(EPSS_BASE_URL, {
      params: { cve: cveParam },
      timeout: 10000,
    });

    if (response.data && response.data.data) {
      response.data.data.forEach((item) => {
        epssMap.set(item.cve, {
          epss: parseFloat(item.epss),
          percentile: parseFloat(item.percentile),
        });
      });
      setInCache(cacheKey, Array.from(epssMap.entries()));
    }
  } catch (error) {
    console.error("Error fetching EPSS scores:", error);
  }

  return epssMap;
}

export async function fetchKEVCatalog(): Promise<KEVCatalog | null> {
  const cacheKey = "kev_catalog";
  const cached = getFromCache<KEVCatalog>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get<KEVCatalog>(KEV_URL, {
      timeout: 10000,
    });

    if (response.data) {
      setInCache(cacheKey, response.data);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching KEV catalog:", error);
    return null;
  }
}

export async function getCVEDetails(cveId: string): Promise<CVEDetails | null> {
  const nvdData = await fetchCVEFromNVD(cveId);
  if (!nvdData || nvdData.vulnerabilities.length === 0) return null;

  const cve = nvdData.vulnerabilities[0].cve;
  const epssData = await fetchEPSSScores([cveId]);
  const kevCatalog = await fetchKEVCatalog();

  const epssScore = epssData.get(cveId);
  const kevEntry = kevCatalog?.vulnerabilities.find((v) => v.cveID === cveId);

  // Extract CVSS score
  const cvssV31 = cve.metrics.cvssMetricV31?.[0]?.cvssData;
  const cvssV2 = cve.metrics.cvssMetricV2?.[0]?.cvssData;
  const cvssScore = cvssV31?.baseScore || cvssV2?.baseScore || 0;
  const severity = cvssV31?.baseSeverity || cvssV2?.baseSeverity || "Unknown";
  const vectorString = cvssV31?.vectorString || cvssV2?.vectorString || "";

  // Extract CWE
  const cwe = cve.weaknesses?.[0]?.description?.[0]?.value || "";
  const cweDescription = cwe;

  // Extract description
  const description = cve.descriptions.find((d) => d.lang === "en")?.value || "";

  // Extract affected products from description and references
  const affectedProducts: string[] = [];
  const productMatches = description.match(/(?:Microsoft|Windows|Oracle|Linux|Apache|Cisco|VMware|Adobe|Google|Apple|IBM|SAP|Dell|HP|Nvidia|Intel|AMD)[\w\s\-\.]+/gi);
  if (productMatches) {
    const uniqueProducts = [...new Set(productMatches.slice(0, 5))]; // Limit to 5 unique matches
    affectedProducts.push(...uniqueProducts);
  }
  
  // Add vendor info from KEV if available
  if (kevEntry) {
    affectedProducts.push(`${kevEntry.vendorProject} ${kevEntry.product}`);
  }

  return {
    id: cve.id,
    description,
    published: cve.published,
    lastModified: cve.lastModified,
    cvssScore,
    severity,
    vectorString,
    epss: epssScore?.epss,
    epssPercentile: epssScore?.percentile,
    cwe,
    cweDescription,
    isKEV: !!kevEntry,
    kevDetails: kevEntry,
    references: cve.references || [],
    affectedProducts,
  };
}
