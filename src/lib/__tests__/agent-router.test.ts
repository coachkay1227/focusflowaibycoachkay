import { describe, expect, it } from "vitest";
import { computeAgentRecommendation, type AgentAnswers } from "../agent-router";

const counts: AgentAnswers["agentCount"][] = ["1", "2-3", "4+"];
const ownership: AgentAnswers["ownershipPref"][] = ["own", "hosted"];
const documents: AgentAnswers["hasDocuments"][] = ["yes", "no"];

function answers(overrides: Partial<AgentAnswers> = {}): AgentAnswers {
  return {
    tasks: ["inbox"],
    agentCount: "1",
    needsRealtime: "no",
    hasDocuments: "no",
    ownershipPref: "own",
    ...overrides,
  };
}

describe("computeAgentRecommendation", () => {
  it("gives real-time and phone work precedence over every other path", () => {
    expect(computeAgentRecommendation(answers({ needsRealtime: "yes", tasks: ["strategic-thinking"] })).path).toBe("ghl");
    expect(computeAgentRecommendation(answers({ tasks: ["phone-calls", "strategic-thinking"] })).path).toBe("ghl");
  });

  it("routes strategic async work to Claude and other async work to GPT", () => {
    expect(computeAgentRecommendation(answers({ tasks: ["strategic-thinking"] })).path).toBe("claude");
    expect(computeAgentRecommendation(answers({ tasks: ["content"] })).path).toBe("gpt");
  });

  it("covers all 36 scale, ownership, document, and path combinations", () => {
    const taskSets = [["content"], ["strategic-thinking"], ["phone-calls"]];
    let covered = 0;
    for (const agentCount of counts) {
      for (const ownershipPref of ownership) {
        for (const hasDocuments of documents) {
          for (const tasks of taskSets) {
            const result = computeAgentRecommendation(answers({
              agentCount,
              ownershipPref,
              hasDocuments,
              tasks,
            }));
            expect(result.tier).toBe(agentCount === "1" ? "single" : agentCount === "2-3" ? "bundle" : "agency");
            expect(result.knowledgeBaseFlag).toBe(hasDocuments === "yes");
            expect(result.isCustomQuote).toBe(true);
            expect(result.priceLines).toEqual([]);
            expect(result.totalOneTime).toBe(0);
            expect(result.totalMonthly).toBe(0);
            expect(result.priceNote).toMatch(/before you pay/i);
            expect(result.includes).toContain("Required AI Brain foundation");
            covered += 1;
          }
        }
      }
    }
    expect(covered).toBe(36);
  });

  it("never claims a paid dashboard is included", () => {
    const result = computeAgentRecommendation(answers({ agentCount: "4+", tasks: ["content"] }));
    expect(JSON.stringify(result)).not.toMatch(/dashboard/i);
    expect(JSON.stringify(result)).not.toMatch(/included for 4/i);
  });
});
