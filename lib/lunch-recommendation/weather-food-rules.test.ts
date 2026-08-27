import { describe, expect, it } from "vitest";

import { matchFoodRule } from "./weather-food-rules";

const baseWeather = { temperatureCelsius: 18, precipitationType: "none" as const, observedAt: "2026-04-10T12:00:00+09:00" };

describe("matchFoodRule", () => {
  it("비가 오면 강수 규칙을 고른다", () => {
    const rule = matchFoodRule({ ...baseWeather, precipitationType: "rain" });
    expect(rule.id).toBe("rainy");
  });

  it("강수가 없고 기온이 무더위 기준(28도) 이상이면 더위 규칙을 고른다", () => {
    const rule = matchFoodRule({ ...baseWeather, temperatureCelsius: 30 });
    expect(rule.id).toBe("heatwave");
  });

  it("강수가 없고 기온이 한파 기준(0도) 이하면 한파 규칙을 고른다", () => {
    const rule = matchFoodRule({ ...baseWeather, temperatureCelsius: -5 });
    expect(rule.id).toBe("coldwave");
  });

  it("강수도 없고 기온도 평범하면 평시 규칙을 고른다", () => {
    const rule = matchFoodRule(baseWeather);
    expect(rule.id).toBe("normal");
  });

  it("비가 오면서 무더운 날에도 강수 규칙을 우선한다", () => {
    const rule = matchFoodRule({ ...baseWeather, temperatureCelsius: 30, precipitationType: "snow" });
    expect(rule.id).toBe("rainy");
  });

  it("규칙마다 검색에 쓸 키워드를 하나 이상 제공한다", () => {
    const rule = matchFoodRule(baseWeather);
    expect(rule.keywords.length).toBeGreaterThan(0);
  });
});
