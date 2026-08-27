import type { FoodRuleId, WeatherSnapshot } from "./types";

export type FoodRule = {
  id: FoodRuleId;
  keywords: string[];
};

const HEATWAVE_THRESHOLD_CELSIUS = 28;
const COLDWAVE_THRESHOLD_CELSIUS = 0;

const RULES: Record<FoodRuleId, FoodRule> = {
  rainy: { id: "rainy", keywords: ["칼국수", "부침개", "국밥"] },
  heatwave: { id: "heatwave", keywords: ["냉면", "냉국수", "콩국수"] },
  coldwave: { id: "coldwave", keywords: ["국밥", "찌개", "전골"] },
  normal: { id: "normal", keywords: ["한식", "백반"] },
};

// 비나 눈이 오면 기온과 무관하게 강수 조건을 최우선으로 본다.
export function matchFoodRule(weather: WeatherSnapshot): FoodRule {
  if (weather.precipitationType !== "none") {
    return RULES.rainy;
  }
  if (weather.temperatureCelsius >= HEATWAVE_THRESHOLD_CELSIUS) {
    return RULES.heatwave;
  }
  if (weather.temperatureCelsius <= COLDWAVE_THRESHOLD_CELSIUS) {
    return RULES.coldwave;
  }
  return RULES.normal;
}
