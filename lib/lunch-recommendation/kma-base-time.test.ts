import { describe, expect, it } from "vitest";

import { resolveUltraSrtNcstBaseTime } from "./kma-base-time";

describe("resolveUltraSrtNcstBaseTime", () => {
  it("정각 45분 이후면 같은 시각의 자료를 요청한다", () => {
    // 2026-08-27 12:50 KST = 2026-08-27 03:50 UTC
    const result = resolveUltraSrtNcstBaseTime(new Date("2026-08-27T03:50:00.000Z"));
    expect(result).toEqual({ baseDate: "20260827", baseTime: "1200" });
  });

  it("정각 45분 이전이면 한 시간 전 자료를 요청한다", () => {
    // 2026-08-27 12:10 KST = 2026-08-27 03:10 UTC
    const result = resolveUltraSrtNcstBaseTime(new Date("2026-08-27T03:10:00.000Z"));
    expect(result).toEqual({ baseDate: "20260827", baseTime: "1100" });
  });

  it("자정 직후 45분 이전이면 전날 23시 자료로 날짜가 넘어간다", () => {
    // 2026-08-27 00:10 KST = 2026-08-26 15:10 UTC
    const result = resolveUltraSrtNcstBaseTime(new Date("2026-08-26T15:10:00.000Z"));
    expect(result).toEqual({ baseDate: "20260826", baseTime: "2300" });
  });
});
