import { describe, expect, it } from "vitest";

import { toKmaGrid } from "./kma-grid";

describe("toKmaGrid", () => {
  it("서울시청 좌표를 기상청 공식 예시 격자 60,127로 변환한다", () => {
    expect(toKmaGrid(37.5665, 126.978)).toEqual({ nx: 60, ny: 127 });
  });

  it("부산시청 좌표를 기상청 격자 98,76으로 변환한다", () => {
    expect(toKmaGrid(35.1798, 129.0750)).toEqual({ nx: 98, ny: 76 });
  });
});
