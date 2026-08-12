import { describe, expect, it } from "vitest";
import {
  BUSINESS_BUCKET_ORDER,
  BUSINESS_BUCKET_PATHS,
  BUSINESS_PATHS,
  computeBusinessAssessment,
  type BusinessBucket,
} from "../business-assessment";

const minds = ["A", "V", "S", "E"];
const actions = ["B", "M", "R", "C"];
const characters = ["N", "T", "G", "P"];

function expectedBuckets(values: BusinessBucket[]): BusinessBucket[] {
  const counts = new Map(BUSINESS_BUCKET_ORDER.map((bucket) => [bucket, 0]));
  values.forEach((bucket) => counts.set(bucket, (counts.get(bucket) ?? 0) + 1));
  return [...BUSINESS_BUCKET_ORDER].sort((a, b) => {
    const byScore = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
    return byScore || BUSINESS_BUCKET_ORDER.indexOf(a) - BUSINESS_BUCKET_ORDER.indexOf(b);
  });
}

describe("computeBusinessAssessment", () => {
  it("covers every one of the 4,096 valid answer combinations", () => {
    let covered = 0;
    for (const mind of minds) {
      for (const action of actions) {
        for (const character of characters) {
          for (const first of BUSINESS_BUCKET_ORDER) {
            for (const second of BUSINESS_BUCKET_ORDER) {
              for (const third of BUSINESS_BUCKET_ORDER) {
                const result = computeBusinessAssessment({
                  op_mind: mind,
                  op_action: action,
                  op_char: character,
                  bn_friction: first,
                  bn_break: second,
                  bn_avoid: third,
                });
                const ranked = expectedBuckets([first, second, third]);
                const expectedPath = BUSINESS_BUCKET_PATHS[ranked[0]];

                expect(result.code).toBe(`${mind}-${action}-${character}`);
                expect(result.primaryBucket).toBe(ranked[0]);
                expect(result.secondaryBucket).toBe(ranked[1]);
                expect(result.primaryPath).toBe(expectedPath.primary);
                expect(result.alternatePaths).toEqual(expectedPath.alternates);
                expect(BUSINESS_PATHS[result.primaryPath].route).toMatch(/^\//);
                covered += 1;
              }
            }
          }
        }
      }
    }
    expect(covered).toBe(4096);
  });

  it("makes the all-different tie rule explicit", () => {
    const result = computeBusinessAssessment({
      op_mind: "V",
      op_action: "B",
      op_char: "N",
      bn_friction: "OWNERSHIP",
      bn_break: "UPLEVEL",
      bn_avoid: "FOCUS",
    });
    expect(result.primaryBucket).toBe("FOCUS");
    expect(result.secondaryBucket).toBe("UPLEVEL");
  });

  it("rejects missing or corrupted answers instead of fabricating a result", () => {
    expect(() => computeBusinessAssessment({})).toThrow(/op_mind/);
    expect(() =>
      computeBusinessAssessment({
        op_mind: "X",
        op_action: "B",
        op_char: "N",
        bn_friction: "CLARITY",
        bn_break: "CLARITY",
        bn_avoid: "CLARITY",
      }),
    ).toThrow(/op_mind/);
  });
});
