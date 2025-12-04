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
  } catch (error) {
    console.error(`Error searching CVEs by date range:`, error);
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

  // Extract affected products (simplified)
  const affectedProducts: string[] = [];
  if (cve.configurations) {
    // This is simplified - real implementation would parse configuration data
    affectedProducts.push("See NVD for full details");
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
