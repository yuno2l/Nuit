export interface CVEMetrics {
  cvssMetricV31?: Array<{
    cvssData: {
      baseScore: number;
      baseSeverity: string;
      vectorString: string;
    };
  }>;
  cvssMetricV2?: Array<{
    cvssData: {
      baseScore: number;
      baseSeverity: string;
      vectorString: string;
    };
  }>;
}

export interface CVEWeakness {
  description: Array<{
    lang: string;
    value: string;
  }>;
}

export interface CVEReference {
  url: string;
  source: string;
}

export interface CVEDescription {
  lang: string;
  value: string;
}

export interface NVDCVEItem {
  id: string;
  sourceIdentifier: string;
  published: string;
  lastModified: string;
  vulnStatus: string;
  descriptions: CVEDescription[];
  metrics: CVEMetrics;
  weaknesses?: CVEWeakness[];
  configurations?: any[];
  references?: CVEReference[];
}

export interface NVDResponse {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  format: string;
  version: string;
  timestamp: string;
  vulnerabilities: Array<{
    cve: NVDCVEItem;
  }>;
}

export interface EPSSScore {
  cve: string;
  epss: string;
  percentile: string;
  date: string;
}

export interface EPSSResponse {
  status: string;
  status_code: number;
  version: string;
  access: string;
  total: number;
  offset: number;
  limit: number;
  data: EPSSScore[];
}

export interface KEVVulnerability {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse: string;
  notes: string;
}

export interface KEVCatalog {
  title: string;
  catalogVersion: string;
  dateReleased: string;
  count: number;
  vulnerabilities: KEVVulnerability[];
}

export interface CVEDetails {
  id: string;
  description: string;
  published: string;
  lastModified: string;
  cvssScore: number;
  severity: string;
  vectorString: string;
  epss?: number;
  epssPercentile?: number;
  cwe?: string;
  cweDescription?: string;
  isKEV: boolean;
  kevDetails?: KEVVulnerability;
  references: CVEReference[];
  affectedProducts: string[];
}

export interface AnalyticsData {
  totalCVEs: number;
  avgCVSS: number;
  avgEPSS: number;
  kevCount: number;
  topCVSS: CVEDetails[];
  topEPSS: CVEDetails[];
  cvssDistribution: Array<{ severity: string; count: number }>;
  cweDistribution: Array<{ name: string; count: number }>;
  timeline: Array<{ date: string; count: number; avgCVSS: number }>;
}
