/**
 * Basic Integration Test
 *
 * Tests the core functionality of the deterministic analysis engine
 */

import { AssessmentEngine } from "../core/assessment-engine";

describe("AssessmentEngine Integration", () => {
  it("should analyze repository and return valid results", async () => {
    const engine = new AssessmentEngine({
      repoPath: ".",
      includeRecommendations: true,
      generateADR: false,
    });

    const result = await engine.execute();

    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.metadata.repository).toBe(".");
    expect(result.metadata.timestamp).toBeDefined();
    expect(result.metadata.duration).toBeGreaterThan(0);

    expect(result.analysis).toBeDefined();
    expect(result.analysis.copilotFeatures).toBeDefined();
    expect(result.analysis.techStack).toBeDefined();
    expect(result.analysis.evidence).toBeDefined();

    expect(result.scores).toBeDefined();
    expect(result.scores.repoReadiness).toBeGreaterThanOrEqual(0);
    expect(result.scores.repoReadiness).toBeLessThanOrEqual(100);
    expect(result.scores.teamReadiness).toBeGreaterThanOrEqual(0);
    expect(result.scores.teamReadiness).toBeLessThanOrEqual(100);
    expect(result.scores.orgReadiness).toBeGreaterThanOrEqual(0);
    expect(result.scores.orgReadiness).toBeLessThanOrEqual(100);
    expect(result.scores.overallMaturity).toBeGreaterThanOrEqual(1);
    expect(result.scores.overallMaturity).toBeLessThanOrEqual(8);
    expect(["high", "medium", "low"]).toContain(result.scores.confidence);

    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);

    // Check recommendation structure
    if (result.recommendations.length > 0) {
      const rec = result.recommendations[0];
      expect(rec.id).toBeDefined();
      expect(rec.title).toBeDefined();
      expect(rec.description).toBeDefined();
      expect(["high", "medium", "low"]).toContain(rec.priority);
      expect([
        "foundation",
        "security",
        "workflow",
        "ai",
        "governance",
      ]).toContain(rec.category);
      expect(["small", "medium", "large"]).toContain(rec.effort);
      expect(rec.timeframe).toBeDefined();
      expect(Array.isArray(rec.dependencies)).toBe(true);
      expect(Array.isArray(rec.evidence)).toBe(true);
    }
  });

  it("should generate ADR when requested", async () => {
    const engine = new AssessmentEngine({
      repoPath: ".",
      includeRecommendations: true,
      generateADR: true,
    });

    const result = await engine.execute();

    expect(result.adr).toBeDefined();
    expect(typeof result.adr).toBe("string");
    expect(result.adr!.length).toBeGreaterThan(100);
    expect(result.adr).toContain("Architecture Decision Record");
    expect(result.adr).toContain("Context");
    expect(result.adr).toContain("Decision");
    expect(result.adr).toContain("Rationale");
  });

  it("should skip recommendations when disabled", async () => {
    const engine = new AssessmentEngine({
      repoPath: ".",
      includeRecommendations: false,
      generateADR: false,
    });

    const result = await engine.execute();

    expect(result.recommendations).toEqual([]);
  });

  it("should complete analysis within reasonable time", async () => {
    const engine = new AssessmentEngine({
      repoPath: ".",
      includeRecommendations: true,
      generateADR: true,
    });

    const startTime = Date.now();
    const result = await engine.execute();
    const duration = Date.now() - startTime;

    expect(result.metadata.duration).toBeLessThan(5000); // 5 seconds max
    expect(duration).toBeLessThan(10000); // 10 seconds max including overhead
  });
});
