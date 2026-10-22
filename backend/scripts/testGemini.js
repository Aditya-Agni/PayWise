import "dotenv/config";
import { generateText, generateStructuredJson } from "../services/gemini.service.js";

async function runTest() {
  console.log("=== Testing Gemini API Integration (Phase 1) ===");

  try {
    console.log("1. Sending harmless prompt via generateText()...");
    const textResult = await generateText("Reply with exactly: 'Gemini service is online.'");
    console.log("-> Response received:", textResult.trim());

    console.log("\n2. Testing generateStructuredJson()...");
    const jsonResult = await generateStructuredJson(
      "Return a JSON object with keys 'status' (string 'online') and 'timestamp' (string current ISO date)."
    );
    console.log("-> Parsed JSON response:", jsonResult);

    console.log("\n=== Phase 1 Verification Successful: Gemini connection working ===");
  } catch (error) {
    console.error("\n❌ Phase 1 Verification Failed:", error.message);
    process.exit(1);
  }
}

runTest();
