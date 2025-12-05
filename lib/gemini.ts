import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export interface MigrationRecommendation {
  vulnerability: string;
  affectedProduct: string;
  openSourceAlternatives: Array<{
    name: string;
    description: string;
    url: string;
    maturity: "stable" | "mature" | "emerging";
  }>;
  migrationComplexity: "low" | "medium" | "high";
  keyConsiderations: string[];
  durableIntegrationTips: string[];
}

export async function generateMigrationRecommendations(
  cveId: string,
  description: string,
  affectedProducts: string[]
): Promise<MigrationRecommendation | null> {
  if (!genAI) {
    console.warn("Gemini API key not configured");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `As a digital sovereignty and open-source migration expert, analyze this vulnerability:

CVE ID: ${cveId}
Description: ${description}
Affected Products: ${affectedProducts.join(", ")}

Provide migration recommendations focusing on:
1. Open-source alternatives that reduce digital dependency
2. NIRD (National Institute for Research in Digital Science) principles
3. Durable integration strategies
4. Long-term sovereignty considerations

Format response as JSON with this structure:
{
  "vulnerability": "brief summary",
  "affectedProduct": "main affected product",
  "openSourceAlternatives": [
    {
      "name": "software name",
      "description": "why it's a good alternative",
      "url": "official website",
      "maturity": "stable|mature|emerging"
    }
  ],
  "migrationComplexity": "low|medium|high",
  "keyConsiderations": ["consideration 1", "consideration 2"],
  "durableIntegrationTips": ["tip 1", "tip 2"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonText);
    }
    
    return null;
  } catch (error) {
    console.error("Error generating migration recommendations:", error);
    return null;
  }
}

export async function chatWithMigrationAssistant(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  newMessage: string,
  context?: {
    cveId?: string;
    affectedProducts?: string[];
  }
): Promise<string> {
  if (!genAI) {
    return "Migration assistant is not available. Please configure GEMINI_API_KEY in your environment.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemContext = `You are a migration assistant specializing in:
- Digital sovereignty and reducing dependency on proprietary software
- Open-source alternatives and NIRD principles
- Durable integration strategies
- Security vulnerability mitigation through migration
- Practical step-by-step migration planning

${context?.cveId ? `Current CVE: ${context.cveId}` : ""}
${context?.affectedProducts ? `Affected: ${context.affectedProducts.join(", ")}` : ""}

Provide practical, actionable advice with specific tool recommendations.`;

    const fullPrompt = `${systemContext}

${conversationHistory.map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`).join("\n\n")}

User: ${newMessage}</parameter>`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in migration assistant chat:", error);
    return "I apologize, but I encountered an error. Please try again or rephrase your question.";
  }
}

// Helper to detect if a CVE affects Windows or Oracle products
export function detectProprietarySoftware(
  description: string,
  references: any[],
  affectedProducts?: string[]
): { isWindows: boolean; isOracle: boolean; isProprietary: boolean } {
  const text = `${description} ${affectedProducts?.join(" ") || ""}`.toLowerCase();
  
  const isWindows = /windows|microsoft|ms-|\.net|azure|iis|active directory/i.test(text);
  const isOracle = /oracle|java se|java ee|mysql enterprise|weblogic|solaris/i.test(text);
  const isProprietary = isWindows || isOracle;
  
  console.log('Proprietary Software Detection:', { 
    text: text.substring(0, 100), 
    isWindows, 
    isOracle, 
    isProprietary,
    affectedProducts 
  });
  
  return { isWindows, isOracle, isProprietary };
}