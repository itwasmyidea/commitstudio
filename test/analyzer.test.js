import { describe, it, expect } from "vitest";
import { parseAnalysisResponse } from "../src/ai/analyzer.js";

describe("AI Analyzer", () => {
  describe("parseAnalysisResponse", () => {
    it("should extract summary from text", () => {
      const analysisText = `This commit adds user authentication functionality.`;

      const result = parseAnalysisResponse(analysisText);

      // Check summary extraction
      expect(result.summary).toBe(
        "This commit adds user authentication functionality.",
      );
      expect(result.comments).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should handle an empty response", () => {
      const result = parseAnalysisResponse("");

      expect(result.summary).toBe("");
      expect(result.comments).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should extract suggestions correctly", () => {
      const analysisText = `This is a summary.

### Suggestions

- Add unit tests
- Improve documentation
- Fix performance issue`;

      const result = parseAnalysisResponse(analysisText);

      expect(result.summary).toBe("This is a summary.");
      expect(result.comments).toHaveLength(0);
      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions).toContain("Add unit tests");
      expect(result.suggestions).toContain("Improve documentation");
      expect(result.suggestions).toContain("Fix performance issue");
    });
  });
});
